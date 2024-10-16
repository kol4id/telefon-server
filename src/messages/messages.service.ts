import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { MessageDto } from './dto/message.dto';
import { GetMessagesDto } from './dto/get-messages.dto';
import { MessageRepository } from 'src/mongo/mongo-message.service';
import { CreateMessageChatDto } from './dto/create-message.dto';
import { UserDto } from 'src/user/dto/user.dto';
import { UpdateMediaDto, UpdateMessageContentDto } from 'src/mongo/dto/update-message.dto';
import { DeleteMessagesDto } from './dto/delete-message.dto';
import { ChannelsService } from 'src/channels/channels.service';
import { ChatRepository } from 'src/mongo/mongo-chat.service';
import { ChannelDto } from 'src/channels/dto/channel.dto';

@Injectable()
export class MessagesService {
    constructor(
        private channelsService: ChannelsService,
        private messageRepository: MessageRepository,
        private chatRepository: ChatRepository,
        // private realtimeService: RealtimeGateway
    ){}

    private logger = new Logger(MessagesService.name)
    
    async getMessages(params: GetMessagesDto): Promise<MessageDto[]>{
        return await this.messageRepository.findManyByDate(params.chatId, params.limit, params.startDate, params.endDate);
    }

    async getLastReadMessages(user: UserDto, limit: number): Promise<MessageDto[][]>{
        const chats = await this.chatRepository.findByParticipant(user.id);
        const messages: MessageDto[][] = await Promise.all(
            chats.map(async(chat)=>{
                const messagesHigh = await this.messageRepository.findManyByDate(chat.id, limit, undefined , user.lastReads?.[chat.id]);
                // const messagesLow = await this.messageRepository.findManyByDate(subscription, halfLimit, user.lastReads[subscription], undefined);
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

    // async getMessagesByDate(params: GetMessagesByDateDto): Promise<MessageDto[]>{
    //     const sortFilter = params.searchSide === 'earlier' ? 'lt' : "gt"
    //     const messages = await this.messageRepository.findManyByDate(params.channelId, params.searchDate, parseInt(params.limit), sortFilter)
    //     return messages;
    // }
    
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

    async delete(messageData: DeleteMessagesDto, user: UserDto): Promise<boolean>{
        const chat = await this.chatRepository.findById(messageData.chatId);
        // if (!chat.owner.includes(user.personalChannel)){
        // }
        let channel: ChannelDto;
        if (chat.owner.length == 1){
            channel = await this.channelsService.get(chat.owner[0]);
        }

        if (chat.owner.includes(user.personalChannel) || channel.moderatorsId?.includes(user.id)){
            const isDeleted = await this.messageRepository.delete(messageData.messageId);
        } else {
            throw new BadRequestException("You don't have such access rights");
        }
        return;
    }

    async markMessagesAsRead(messages: MessageDto[]): Promise<MessageDto[]>{
        const updatedMessages = await this.messageRepository.updateReadMany(messages)
        return updatedMessages
    }
}
