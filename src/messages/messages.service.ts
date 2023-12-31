import { BadRequestException, Injectable } from '@nestjs/common';
import { MessageDto } from './dto/message.dto';
import { GetMessagesDto } from './dto/get-messages.dto';
import { MongoMessageService } from 'src/mongo/mongo-message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UserDto } from 'src/mongo/dto/user.dto';
import { UpdateMediaDto, UpdateMessageContentDto } from 'src/mongo/dto/update-message.dto';

@Injectable()
export class MessagesService {
    constructor(private mongoMessageService: MongoMessageService){}

    async getMessages(params: GetMessagesDto): Promise<MessageDto[]>{
        const limit: number = 25;
        const messages = await this.mongoMessageService.findManyByChannel(params.channelId, 
                                                                parseInt(params.chunkNumber), 
                                                                limit);
        return messages
    }
    
    async create(message: CreateMessageDto, user: UserDto): Promise<MessageDto | string>{

        const newMessage = await this.mongoMessageService.create(message, user.id);
        if (newMessage.hasMedia){
            return newMessage.id;
        }

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
}
