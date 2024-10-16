import { Injectable } from '@nestjs/common';
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
    ){}

    async updateUserLastLogin(userId: string): Promise<UserDto>{
        return await this.userService.updateLastLogin(userId);
    }

    async userSubscribe(userId: string, channel: ChannelDto): Promise<void>{
        console.log(channel)
        if (channel.channelType == 'user'){
            const newChat = await this.chatRepository.create();
            const mainUserChannel = await this.channelService.findByCreator(userId);
            await this.userRepository.addDmChat(userId, channel.id, newChat.id);
            await this.userRepository.addDmChat(channel.creatorId, mainUserChannel.id, newChat.id);
            await this.channelService.subscribe(mainUserChannel.id, channel.creatorId);
        }
        await this.channelService.subscribe(channel.id, userId);
    }

    async userSubscribeChannel(user: UserDto, channel: ChannelDto): Promise<ChatDto>{
        const chat = await this.chatRepository.findByChannel(channel.id);
        await this.chatRepository.addParticipant(chat.id, user.id);
        await this.channelService.subscribe(channel.id, user.id);
        return chat
    }
    async userSubscribeDm(user: UserDto, channel: ChannelDto): Promise<ChatDto>{
        const newChat = await this.chatRepository.create([user.personalChannel, channel.id]);
        await this.chatRepository.addParticipant(newChat.id, user.id);
        await this.chatRepository.addParticipant(newChat.id, channel.creatorId);
        await this.channelService.subscribe(channel.id, user.id);
        await this.channelService.subscribe(user.personalChannel, channel.creatorId);
        return newChat
    }


    async setMessagesRead(userId: string, messages: MessageDto[], params?: IMessagesReadParams): Promise<MessageDto[] | Record<string, MessageDto[]>>{
        const updatedMessages = await this.setMessagesAsRead(messages, params) as Record<string, MessageDto[]>;

        // const user = await this.userService.getUser(userId);
        // Object.entries(updatedMessages).forEach(([key, value]) => {
        //     const sorted = value.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        //     this.userService.updateLastRead(user, sorted[0])
        // })

        return updatedMessages
    }

    // async createMessage(userId: string, message: CreateMessageDto){
    //     const user = await this.userService.getUser(userId);
    //     return await this.messageService.create(message, user);
    // }
    
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
            if (!groups[key]) groups[key] = [];
            groups[key].push(message);
        });
        return groups
    }
}

export interface IMessagesReadParams{
    group: boolean,
}
