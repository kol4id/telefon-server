import { BadRequestException, Injectable, NotFoundException} from "@nestjs/common";
import { Message } from "./shemas/message.schema";
import { Model} from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { MessageDto } from "src/messages/dto/message.dto";
import { CreateMessageDto } from "src/messages/dto/create-message.dto";
import { UpdateMediaDto, UpdateMessageContentDto } from "./dto/update-message.dto";


const messageProjection = {
    _id: 0,
    id: '$_id',
    channelId: 1,
    creatorId: 1,
    content: 1,
    edited: 1,
    hasMedia: 1,
    mediaUrls: 1,
    createdAt: 1,
}

const defaultOptions = {
    runValidators: true,
    new: true,
    lean: true,
    projection: messageProjection,
}

@Injectable()
export class MessageRepository{
    constructor(
        @InjectModel(Message.name) private messageModel: Model<Message>,
    ){}

    async findOne(messageId: string): Promise<MessageDto>{
        const message = await this.messageModel.findById(messageId, messageProjection).lean().exec(); 
        if(!message){
            throw new NotFoundException(`There is no such message ${messageId}`); 
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
        
        return messages as any as MessageDto[];
    }

    async create(message: CreateMessageDto, userId: string): Promise<MessageDto>{
        const newMessage = {
            ...message,
            creatorId: userId,
            edited: false,
        }

        const created = await this.messageModel.create(newMessage);
        this.StringifyId(created);

        return created as any as MessageDto;
    }

    async update(messageData: UpdateMediaDto | UpdateMessageContentDto): Promise<MessageDto>{
        const updatedChannel = await this.messageModel.findByIdAndUpdate(messageData.id, {...messageData}, defaultOptions);
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