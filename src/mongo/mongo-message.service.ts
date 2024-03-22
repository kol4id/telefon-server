import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { Message } from "./shemas/message.schema";
import { Model} from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { MessageDto } from "src/messages/dto/message.dto";
import { MongoParser } from "src/mongo/mongoObjectParser";
import { CreateMessageDto } from "src/messages/dto/create-message.dto";
import { UpdateMediaDto, UpdateMessageContentDto } from "./dto/update-message.dto";


const messageProjection = {
    id: 1,
    channelId: 1,
    creatorId: 1,
    content: 1,
    edited: 1,
    hasMedia: 1,
    mediaUrls: 1,
    createdAt: 1,
}

@Injectable()
export class MongoMessageService{
    constructor(
        @InjectModel(Message.name) private messageModel: Model<Message>,
    ){}

    async findOne(messageId: string): Promise<MessageDto>{

        const message = await this.messageModel.findById(messageId, messageProjection).exec();
        this.StringifyId(message);

        if(!message){
            throw new BadRequestException('There is no such message')
        }
        
        return message as any as MessageDto;
    }

    async findManyByChannel(channelId: string, chunkNumber: number, limit: number, sort: 'asc' | 'desc'):Promise<MessageDto[]>{

        const skip = (chunkNumber - 1) * limit;
        const messages = await this.messageModel
            .find({channelId}, messageProjection)
            .sort({createdAt: sort})
            .skip(skip)
            .limit(limit)
            .lean()
            .exec()

        this.StringifyId(messages);
        
        return messages as any as MessageDto[];
    }

    async create(message: CreateMessageDto, userId: string): Promise<MessageDto>{
        const newMessage = {
            channelId: message.channelId,
            content: message.content,
            hasMedia: message.hasMedia,
            creatorId: userId,
            edited: false,
        }

        const created = await this.messageModel.create(newMessage)
        this.StringifyId(created);
    
        return created as any as MessageDto;
    }

    async update(messageData: UpdateMediaDto | UpdateMessageContentDto): Promise<MessageDto>{
        const updatedChannel = await this.messageModel.findByIdAndUpdate(messageData.id, {...messageData}, {
            runValidators: true,
            new: true,
        })

        this.StringifyId(updatedChannel);
        return updatedChannel as any as MessageDto;
    }
    
    async delete(messageId: string): Promise<any>{
        const deleted = await this.messageModel.findByIdAndDelete(messageId);
        return deleted
    }

    private StringifyId(messages: any){
        messages.forEach((message)=>{
            message.id = message._id.toString()
            delete message._id;
        })
    } 
}