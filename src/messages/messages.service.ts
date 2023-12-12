import { Injectable } from '@nestjs/common';
import { MessageDto } from './dto/message.dto';
import { GetMessagesDto } from './dto/get-messages.dto';
import { MongoMessageService } from 'src/mongo/mongo-message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UserDto } from 'src/mongo/dto/user.dto';

@Injectable()
export class MessagesService {
    constructor(private mongoMessageService: MongoMessageService){}

    async getMessages(params: GetMessagesDto): Promise<MessageDto[]>{
        const limit: number = 25;
        const messages = await this.mongoMessageService.findMany(params.channelId, 
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
}
