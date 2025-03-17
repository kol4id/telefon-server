import { Injectable, Logger } from '@nestjs/common';
import { MessageDto } from 'src/messages/dto/message.dto';
import { MessageRepository } from 'src/mongo/mongo-message.service';
import { ServerToClientMessageType } from './events';
import { UserService } from 'src/user/user.service';
import { UserDto } from 'src/user/dto/user.dto';
import { MessagesService } from 'src/messages/messages.service';
import { ChannelsService } from 'src/channels/channels.service';
import { ChannelDto } from 'src/channels/dto/channel.dto';
import { ChatRepository } from 'src/mongo/mongo-chat.service';
import { UserRepository } from 'src/mongo/mongo-user.service';
import { ChatDto } from 'src/chats/dto/chat.dto';
import { RedisService } from 'src/redis-service/redis.service';
import { Server, Socket } from 'socket.io';
import { CreateMessageDto } from 'src/messages/dto/message-utls.dto';
import { convertFilesToBuffers } from 'src/utils/convertFilesToBuffers';
import { MediaService } from 'src/media/media.service';
import { CreateChannelGroupDto } from 'src/channels/dto/create-channel.dto';
import { ChatsService } from 'src/chats/chats.service';

type TransferData = {
    eventType: ServerToClientMessageType,
    data: any,
}

@Injectable()
export class RealtimeService {
    constructor(
        private messageRepository: MessageRepository,
        private messageService: MessagesService,
        private channelService: ChannelsService,
        private userService: UserService,
        private userRepository: UserRepository,
        private chatRepository: ChatRepository,
        private chatService: ChatsService,
        private mediaService: MediaService,
        private redis: RedisService
    ){}
    
    async setServer(server: Server){
        this.server = server;
    }

    async userSubscribe(userId: string, channel: ChannelDto): Promise<void>{
        this.logger.debug(channel)
        if (channel.channelType == 'user'){
            const newChat = await this.chatRepository.create();
            const mainUserChannel = await this.channelService.findByCreator(userId);
            await this.userRepository.addDmChat(userId, channel.id, newChat.id);
            await this.userRepository.addDmChat(channel.creatorId, mainUserChannel.id, newChat.id);
            await this.channelService.subscribe(mainUserChannel.id, channel.creatorId);
        }
        await this.channelService.subscribe(channel.id, userId);
    }

    async handleSubscribe(user: UserDto, channelId: string): Promise<ChatDto>{
        const channel = await this.channelService.get(channelId);
        const initiatorChannel = await this.channelService.get(user.personalChannel);
    
        if (channel.channelType == 'user'){
            const newChat = await this.userSubscribeDm(user, channel);
            await this.serverUpdateNewChannel(user.id, newChat, channel);
            await this.serverUpdateNewChannel(channel.creatorId, newChat, initiatorChannel);
            return newChat;
        }

        const chat = await this.userSubscribeChannel(user, channel);
        await this.serverUpdateNewChannel(user.id, chat, channel);
        return chat;
    }

    async handleCreateMessage(userId: string, messageData: CreateMessageDto): Promise<MessageDto>{
        const user = await this.userRepository.findById(userId);
        if (user.subscriptions == undefined || !user.subscriptions.includes(messageData.channelId)){
            await this.handleSubscribe(user, messageData.channelId);
        }

        const chat = await this.chatService.find(messageData.channelId, user.personalChannel);
        const message = await this.createMessage(messageData, user, chat);
        this.server.in(message.chatId).emit("messageCreate", {message, chat});
        return message;
    }

    async createMessage(messageData: CreateMessageDto, user: UserDto, chat: ChatDto): Promise<MessageDto>{
        let media: string[];
        
        if (messageData.hasMedia){
            const buffers = await convertFilesToBuffers(messageData.media);
            media = await Promise.all(buffers.map(async buffer => this.mediaService.create(buffer)));
        }
    
        return this.messageService.create({
            chatId: chat.id,
            content: messageData.content,
            hasMedia: Boolean(media),
            mediaUrls: media
        }, user);
    }

    async deleteMessage(messageId: string, user: string | UserDto){
        if (typeof user != 'object') user = await this.userService.getUser(user);
        const message = await this.messageService.getMessage(messageId);
    
        const isDeleted = await this.messageService.delete(messageId, user);
        const clientId = await this.redis.get(user.id);

        if (!isDeleted) {
            this.server.to(clientId).emit('messageDelete', false);
            return;
        }
        const chat = await this.chatService.reduceTotalMessageCount(message.chatId);
        const userChannel = user.personalChannel;
        const channelId = chat.owner.length == 2 
            ? (chat.owner.filter(owner => owner != userChannel))[0]
            : chat.owner[0]

        if(!chat.totalMessages) await this.leaveChannel(user, channelId)
        this.server.in(message.chatId).emit('messageDelete', message)
    }

    async setUserOnlineStatus(user: string | UserDto, isOnline: boolean): Promise<void>{
        if (typeof user != 'object') user = await this.userService.getUser(user);
        this.logger.debug(`setUserOnlineStatus| userId: ${user.id} || isOnline: ${isOnline}`);

        isOnline ? await this.markUserOnline(user) : await this.setUserOffline(user)

        await this.reportUserOnlineStatus(user, isOnline);
    }

    async sendSubsOnlineStatus(userId: string): Promise<void>{
        const user = await this.userService.getUser(userId);
        if (!user.subscriptions.length) return;

        const statuses = await this.redis.getMany(...user.subscriptions);
        const sendData = user.subscriptions.map((sub, index) => {return {channelId: sub, status: statuses[index]}});
        const client = await this.redis.get(user.id);
        const socket = this.getSocket(client);
        socket.emit('subsOnlineStatus', sendData);
    }


    async handleMessageRead(userId: string, messages: MessageDto[]){
        const updatedMessages = await this.setMessagesRead(userId, messages, { group: true });
        Object.entries(updatedMessages).forEach(([key, value]) => {
            this.server.in(key).emit("messagesRead", value);
        });
    }

    // async setMessagesRead(userId: string, messages: MessageDto[], params?: IMessagesReadParams): Promise<MessageDto[] | Record<string, MessageDto[]>>{
    //     const updatedMessages = await this.setMessagesAsRead(messages, params) as Record<string, MessageDto[]>;
    //     return updatedMessages
    // }
    
    async handleCreateChannel(channelData: CreateChannelGroupDto, userId: string): Promise<void>{
        this.logger.debug('handleCreateChannel')
        let media: string;
        if (channelData.imageBuffer){
            const buffer = Buffer.from(channelData.imageBuffer)
            media = await this.mediaService.create(buffer);
        }

        const {imageBuffer, ...rest} = channelData;
        const newChannelData: ChannelDto = {...rest, imgUrl: media}
        const channel = await this.channelService.createChannelGroup(newChannelData, userId);
        const newChat = await this.chatRepository.create([channel.id]);

        const usersToAdd = [...channelData.usersToAdd, userId];

        await this.chatRepository.addParticipants(newChat.id, usersToAdd);
        await Promise.all(usersToAdd.map(async (user) =>{
           await this.channelService.subscribe(channel.id, user);
        }))
        await this.serverUpdateNewChannelGroup(usersToAdd, newChat, channel);
    }

    async leaveChannel(user: string | UserDto, channelId: string): Promise<void>{
        this.logger.debug('leaveChannel')
        if (typeof user != 'object') user = await this.userService.getUser(user);
        const channel = await this.channelService.get(channelId);
        const chat = channel.channelType == 'user' 
            ?   await this.chatRepository.findDMChat([user.personalChannel, channel.id])
            :   await this.chatRepository.findByChannel(channelId); 
        
        if (!chat.owner.includes(user.personalChannel) && !chat.participants.includes(user.id)) return;
        await this.channelService.unsubscribe(channelId, user.id);

        if (channel.channelType == 'user'){
            await this.chatRepository.deleteById(chat.id);
            await this.messageService.deleteManyByChat(chat.id);
            const channelInitiator = await this.channelService.get(user.personalChannel); 
            await this.serverUpdateLeaveChannel(channel.creatorId, chat, channelInitiator);
        }

        await this.serverUpdateLeaveChannel(user.id, chat, channel);
        await this.chatRepository.removeParticipants(chat.id, user);
    }

    /**
     * set all messages in array as read
     * 
     * (optionaly)
     * group them by channel for emit 
     * 
     * @param messages array of MessageDto[]. 
     * @param params optional params see IMessagesReadParams
     */
    private async setMessagesAsRead (messages: MessageDto[], params?: IMessagesReadParams): Promise<MessageDto[] | Record<string, MessageDto[]>>{
        const messagesId = messages.map((message) => message.id);
        await this.messageRepository.updateReadMany(messages, messagesId);

        const updatedMessages = await this.messageRepository.findManyById(messagesId);
        if (!params.group) return updatedMessages

        const groups: Record<string, MessageDto[]> = {};
        updatedMessages.forEach((message) => {
            const key = message.chatId;
            groups[key] ??= [];
            groups[key].push(message);
        });
        return groups
    }

    private async usersUpdateRoom (users: string[], chatId: string): Promise<void>{
        const clientIds = await this.redis.getMany(...users);
        await Promise.all(users.map(async (_, index) => {
            const clientId = clientIds[index];
            if (!clientId) return;
            
            const socket = this.getSocket(clientId);
            if(!socket) return;
            socket.join(chatId);
        }));
    }

    private async serverUpdateUser(userId: string): Promise<Socket>{
        const user = await this.userRepository.findById(userId);
        const clientId = await this.redis.get(user.id);

        const socket = this.getSocket(clientId);
        if (!socket) return

        socket.emit('updateUser', user);
        return socket;
    }

    private async serverUpdateNewChannelGroup(users: string[], chat: ChatDto, channel: ChannelDto){
        await Promise.all(users.map(async user => this.serverUpdateNewChannel(user, chat, channel)));
    }

    private async serverUpdateLeaveChannel(userId: string, chat: ChatDto, channel: ChannelDto){
        const socket = await this.serverUpdateUser(userId);
        if(!socket) return;
        socket.leave(chat.id);
        socket.emit('channelLeave', {channel, chat});
    }

    private async serverUpdateNewChannel (userId: string, chat: ChatDto, channel: ChannelDto){
        const socket = await this.serverUpdateUser(userId);
        if(!socket) return;
        socket.join(chat.id);
        socket.emit('channelSubscribe', {channel, chat});
    }

    private async userSubscribeDm(user: UserDto, channel: ChannelDto): Promise<ChatDto>{
        this.logger.debug('userSubscribeDm')
        const newChat = await this.chatRepository.create([user.personalChannel, channel.id]);
        await this.subscribeUser(channel.id, newChat.id, user.id);
        await this.subscribeUser(user.personalChannel, newChat.id, channel.creatorId);
        return newChat
    }

    private async userSubscribeChannel(user: UserDto, channel: ChannelDto): Promise<ChatDto>{
        const chat = await this.chatRepository.findByChannel(channel.id);
        await this.subscribeUser(channel.id, chat.id, user.id);
        return chat
    }

    private async subscribeUser(channelId: string, chatId: string, userId: string): Promise<any>{
        await this.chatRepository.addParticipant(chatId, userId);
        await this.channelService.subscribe(channelId, userId);
    }

    private async setMessagesRead(userId: string, messages: MessageDto[], params?: IMessagesReadParams): Promise<MessageDto[] | Record<string, MessageDto[]>>{
        const updatedMessages = await this.setMessagesAsRead(messages, params) as Record<string, MessageDto[]>;
        return updatedMessages
    }

    private async reportUserOnlineStatus(user: UserDto, isOnline: boolean){
        this.logger.debug(`repUserOnlineStatus| userId: ${user.id} || isOnline: ${isOnline}`);
        const chats = await this.chatRepository.findDMByChannel(user.personalChannel);
        if (!chats.length || !chats) return;

        chats.forEach(chat => {
            this.server.in(chat.id).emit('userOnlineStatus', {channelId: user.personalChannel, status: isOnline});
        })
    }

    private async setUserOffline(user: UserDto): Promise<void>{
        this.updateUserLastLogin(user.id);
        this.markUserOffline(user);
    }

    private async markUserOnline(user: UserDto): Promise<boolean>{
        if (!user) return
        return this.redis.set(user.personalChannel, 'true');
    }

    private async markUserOffline(user: UserDto): Promise<void>{
        await this.redis.del(user.personalChannel);
    }

    private async updateUserLastLogin(userId: string): Promise<UserDto>{
        return await this.userService.updateLastLogin(userId);
    }

    private getSocket(clientId: string){
        return this.server.sockets.sockets.get(clientId);
    }

    private server: Server | null = null;
    private logger = new Logger(RealtimeService.name);
}

export interface IMessagesReadParams{
    group: boolean,
}
