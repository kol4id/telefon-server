import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { MessageDto } from './dto/message.dto';
import { GetMessagesDto } from './dto/get-messages.dto';
import { MessageRepository } from 'src/mongo/mongo-message.service';
import { CreateMessageChatDto } from './dto/create-message.dto';
import { UserDto } from 'src/user/dto/user.dto';
import { UnreadMessagesDto, UpdateMediaDto, UpdateMessageContentDto } from './dto/message-utls.dto';
import { ChannelsService } from 'src/channels/channels.service';
import { ChatRepository } from 'src/mongo/mongo-chat.service';
import { ChatDto } from 'src/chats/dto/chat.dto';

@Injectable()
export class MessagesService {
    constructor(
        private channelsService: ChannelsService,
        private messageRepository: MessageRepository,   
        private chatRepository: ChatRepository,
        // private realtimeService: RealtimeGateway
    ){}

    private logger = new Logger(MessagesService.name)
    

    async getMessage(id: string): Promise<MessageDto>{
        return this.messageRepository.findOne(id);
    }

    async getMessages(params: GetMessagesDto): Promise<MessageDto[]>{
        return await this.messageRepository.findManyByDate(params.chatId, params.limit, params.startDate, params.endDate);
    }

    async getLastReadMessages(user: UserDto, limit: number): Promise<MessageDto[][]>{
        const chats = await this.chatRepository.findByParticipant(user.id);
        this.logger.debug(chats);
        const messages: MessageDto[][] = await Promise.all(
            chats.map(async(chat)=>{
                const messagesHigh = await this.messageRepository.findManyByDate(chat.id, limit, undefined , user.lastReads?.[chat.id]);
                return messagesHigh;
            })
        )
        return messages;
    }

    async getLastMessages(user: UserDto): Promise<MessageDto[][]>{  
        const chats = await this.chatRepository.findByParticipant(user.id);
        const messages = await Promise.all(
            chats.map(async(chat) => {
                const searchParams: GetMessagesDto = {
                    chatId: chat.id,
                    limit: 1
                }
                return await this.getMessages(searchParams)
            })
        )
        return messages;
    }

    async getUnreadMessagesCount(user: UserDto): Promise<UnreadMessagesDto[]>{
        const chats = await this.chatRepository.findByParticipant(user.id);
        const channelChatMap = this.mapChannelToChat(chats, user.subscriptions);
        const matchConditions = user.subscriptions.map(channelId => {
            const chat = channelChatMap.get(channelId);
            return (
                {
                    chatId: chat,
                    createdAt: user.lastReads[chat]
                }    
            )
        });
        return this.messageRepository.findUnreadMessagesForChannels(matchConditions, user);
    }
    
    async create(message: CreateMessageChatDto, user: UserDto): Promise<MessageDto>{
        const newMessage = await this.messageRepository.create(message, user.id);
        this.chatRepository.updateLastMessage(newMessage.chatId, newMessage.id);
        this.chatRepository.incTotalMessages(message.chatId);
        return newMessage
    }

    async createMedia(mediaLinks: string[], messageId: string, user: UserDto): Promise<MessageDto>{
        const message: MessageDto = await this.messageRepository.findOne(messageId);
        if(message.creatorId !== user.id){
            throw new BadRequestException("You don't have such access rights")
        }

        const createMedia: UpdateMediaDto = {
            id: messageId,
            edited: false,
            hasMedia: true,
            mediaUrls: mediaLinks
        }

        const newMessageWithMedia = await this.messageRepository.update(createMedia);
        return newMessageWithMedia;
    }

    async update(messageData: UpdateMessageContentDto, user: UserDto): Promise<MessageDto>{
        const message: MessageDto = await this.messageRepository.findOne(messageData.id);
        if(message.creatorId !== user.id){
            throw new BadRequestException("You don't have such access rights")
        }

        const updateData: UpdateMessageContentDto = {
            id: messageData.id,
            content: messageData.content,
            edited: true,
        }

        const updatedMessage = await this.messageRepository.update(updateData);
        return updatedMessage;
    }

    async delete(messageId: string, user: UserDto): Promise<MessageDto | boolean>{
        const message = await this.messageRepository.findOne(messageId);
        const chat = await this.chatRepository.findById(message.chatId);
        
        //if initiator is creator of the message => delete (dm / chat / channel);
        //if initiator is reciver => delete (dm only)
        if (chat.owner.includes(user.personalChannel) || message.creatorId == user.id){
            return this.messageRepository.delete(message.id);
        } 

        if (chat.owner.length == 2) return false;

        const channel = await this.channelsService.get(chat.owner[0]);
        if (!channel.moderatorsId.includes(user.id)) return false;

        return await this.messageRepository.delete(message.id);
    }

    async deleteManyByChat(chatId: string){
        await this.messageRepository.deleteByChat(chatId);
    }

    async markMessagesAsRead(messages: MessageDto[]): Promise<MessageDto[]>{
        const updatedMessages = await this.messageRepository.updateReadMany(messages)
        return updatedMessages
    }

    private mapChannelToChat(chats: ChatDto[], subscriptions: string[]) {
        const channelToChatMap = new Map<string, string>();
        const subscribedSet = new Set(subscriptions); // Преобразуем массив подписок в Set для более быстрой проверки
    
        chats.forEach((chat) => {
            chat.owner.forEach(ownerId => {
                if (subscribedSet.has(ownerId)) {
                    channelToChatMap.set(ownerId, chat.id); // Если владелец есть в подписках, добавляем его
                }
            });
        });
    
        return channelToChatMap;
    }


}
