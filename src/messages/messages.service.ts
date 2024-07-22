import { BadRequestException, Injectable} from '@nestjs/common';
import { MessageDto } from './dto/message.dto';
import { GetMessagesByDateDto, GetMessagesDto } from './dto/get-messages.dto';
import { MessageRepository } from 'src/mongo/mongo-message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UserDto } from 'src/user/dto/user.dto';
import { UpdateMediaDto, UpdateMessageContentDto } from 'src/mongo/dto/update-message.dto';
import { RealtimeGateway } from 'src/realtime/realtime.gateway';
import { DeleteMessagesDto } from './dto/delete-message.dto';
import { ChannelsService } from 'src/channels/channels.service';

@Injectable()
export class MessagesService {
    constructor(
        private channelsService: ChannelsService,
        private messageRepository: MessageRepository,
        private realtimeService: RealtimeGateway
    ){}

    
    async getMessages(params: GetMessagesDto): Promise<MessageDto[]>{
        return await this.messageRepository.findManyByDate(params.channelId, params.limit, params.startDate, params.endDate);
    }

    async getLastReadMessages(user: UserDto, limit: number): Promise<MessageDto[][]>{
        // const halfLimit = Math.floor(limit / 2);
        const messages: MessageDto[][] = await Promise.all(
            user.subscriptions.map(async(subscription)=>{
                const messagesHigh = await this.messageRepository.findManyByDate(subscription, limit, undefined , user.lastReads?.[subscription]);
                // const messagesLow = await this.messageRepository.findManyByDate(subscription, halfLimit, user.lastReads[subscription], undefined);
                return messagesHigh;
            })
        )
        return messages;
    }

    async getLastMessages(user: UserDto): Promise<MessageDto[][]>{
        const messages = await Promise.all(
            user.subscriptions.map(async(subscription) => {
                const searchParams: GetMessagesDto = {
                    channelId: subscription,
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
    
    async create(message: CreateMessageDto, user: UserDto): Promise<MessageDto | string>{

        const newMessage = await this.messageRepository.create(message, user.id);
        if (newMessage.hasMedia){
            return newMessage.id;
        }

        this.realtimeService.sendToRoom(newMessage.channelId, 'messageCreate', newMessage);
        this.channelsService.updateLastMessage({id: message.channelId, lastMessageId: newMessage.id}, user);
        await this.channelsService.UpdateTotalMessages(message.channelId);        
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

    async delete(messageData: DeleteMessagesDto, user: UserDto): Promise<void>{
        if (!user.subscriptions.find((sub) => sub === messageData.channelId)){
            throw new BadRequestException("You don't have such access rights")
        }

        return await this.messageRepository.delete(messageData.messageId);
    }

    async markMessagesAsRead(messages: MessageDto[]): Promise<MessageDto[]>{
        const updatedMessages = await this.messageRepository.updateReadMany(messages)
        return updatedMessages
    }
}
