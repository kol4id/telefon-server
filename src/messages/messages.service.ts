import { BadRequestException, Injectable } from '@nestjs/common';
import { MessageDto } from './dto/message.dto';
import { GetMessagesDto } from './dto/get-messages.dto';
import { MessageRepository } from 'src/mongo/mongo-message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UserDto } from 'src/mongo/dto/user.dto';
import { UpdateMediaDto, UpdateMessageContentDto } from 'src/mongo/dto/update-message.dto';
import { RealtimeGateway } from 'src/realtime/realtime.gateway';
import { DeleteMessagesDto } from './dto/delete-message.dto';
import { ChannelsService } from 'src/channels/channels.service';

@Injectable()
export class MessagesService {
    constructor(
        private channelsService: ChannelsService,
        private mongoMessageService: MessageRepository,
        private realtimeService: RealtimeGateway
    ){}

    async getMessages(params: GetMessagesDto): Promise<MessageDto[]>{
        const limit: number = 50;
        const messages = await this.mongoMessageService.findManyByChannel(params.channelId, 
                                                                parseInt(params.chunkNumber), 
                                                                limit,
                                                                'desc');

        return messages
    }

    async getLastMessages(user: UserDto, chunk: number, limit: number): Promise<MessageDto[][]>{
        // const CHUNK = 1;
        // const LIMIT = 50;
        const messages = await Promise.all(
            user.subscriptions.map(async(subscription) => {
                return await this.mongoMessageService
                                                .findManyByChannel( subscription, 
                                                                    chunk, 
                                                                    limit,
                                                                    'desc')
            })
        )

        // console.log(messages);
        return messages;
    }
    
    async create(message: CreateMessageDto, user: UserDto): Promise<MessageDto | string>{

        const newMessage = await this.mongoMessageService.create(message, user.id);
        if (newMessage.hasMedia){
            return newMessage.id;
        }

        this.realtimeService.sendToRoom(newMessage.channelId, {eventType: 'onMessageCreate', data: newMessage});
        this.channelsService.updateLastMessage({id: message.channelId, lastMessageId: newMessage.id}, user)
        await this.channelsService.UpdateTotalMessages(message.channelId);        
        return newMessage
    }

    async createMedia(mediaLinks: string[], messageId: string, user: UserDto): Promise<MessageDto>{
        const message: MessageDto = await this.mongoMessageService.findOne(messageId);
        if(message.creatorId !== user.id){
            throw new BadRequestException("You don't have such access rights")
        }

        const createMedia: UpdateMediaDto = {
            id: messageId,
            edited: false,
            hasMedia: true,
            mediaUrls: mediaLinks
        }

        const newMessageWithMedia = await this.mongoMessageService.update(createMedia);
        return newMessageWithMedia;
    }

    async update(messageData: UpdateMessageContentDto, user: UserDto): Promise<MessageDto>{
        const message: MessageDto = await this.mongoMessageService.findOne(messageData.id);
        if(message.creatorId !== user.id){
            throw new BadRequestException("You don't have such access rights")
        }

        const updateData: UpdateMessageContentDto = {
            id: messageData.id,
            content: messageData.content,
            edited: true,
        }

        const updatedMessage = await this.mongoMessageService.update(updateData);
        return updatedMessage;
    }

    async delete(messageData: DeleteMessagesDto, user: UserDto): Promise<void>{
        if (!user.subscriptions.find((sub) => sub === messageData.channelId)){
            throw new BadRequestException("You don't have such access rights")
        }

        return await this.mongoMessageService.delete(messageData.messageId);
    }
}
