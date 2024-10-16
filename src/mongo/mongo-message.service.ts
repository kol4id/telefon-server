import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { Message } from "./shemas/message.schema";
import { FilterQuery, Model, SortOrder } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { MessageDto } from "src/messages/dto/message.dto";
import { CreateMessageChatDto } from "src/messages/dto/create-message.dto";
import { UpdateMediaDto, UpdateMessageContentDto } from "./dto/update-message.dto";
import idProjection from "./mongo-projection-id-config";


const messageProjection = {
    ...idProjection,
    chatId: 1,
    creatorId: 1,
    content: 1,
    edited: 1,
    hasMedia: 1,
    mediaUrls: 1,
    createdAt: 1,
    isRead: 1,
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

    private logger = new Logger(MessageRepository.name);

    async findOne(messageId: string): Promise<MessageDto>{
        const message = await this.messageModel.findById(messageId, messageProjection).lean().exec(); 
        if(!message){
            throw new NotFoundException(`There is no such message ${messageId}`); 
        }
        
        return message as any as MessageDto;
    }

    async findManyByChannel(channelId: string, chunkNumber: number, limit: number, sort: 'asc' | 'desc', ):Promise<MessageDto[]>{
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

    async findManyByDate(chatId: string, limit: number, startDate?: Date | undefined, endDate?: Date | undefined):Promise<MessageDto[]>{
        const filter: FilterQuery<Message> = {};
        let sort: SortOrder = -1;

        filter.chatId = chatId;
        if (startDate) {
            filter.createdAt = {$gte: startDate}
            sort = 1;
        }
        if (endDate) {
            if (filter.createdAt) filter.createdAt.$lte = endDate;
            else filter.createdAt = {$lte: endDate};
            sort = -1;
        }

        const messages = await this.messageModel
            .find(filter, messageProjection)
            .sort({createdAt: sort})
            .limit(limit)
            .lean()
            .exec()
        
        if (startDate && !endDate) messages.reverse();
        return messages as any as MessageDto[];
    }

    async findManyById(messagesId: string[]):Promise<MessageDto[]>{
        const messages = await this.messageModel
        .find({_id: {$in: messagesId}}, messageProjection)
        .lean()
        .exec()

        return messages as any as MessageDto[];
    }

    async create(message: CreateMessageChatDto, userId: string): Promise<MessageDto>{
        const newMessage = {
            ...message,
            creatorId: userId,
            edited: false,
        }

        const data = await this.messageModel.create(newMessage); 
        const created = await this.messageModel.findById(data._id, messageProjection).lean();
        return created as any as MessageDto;
    }

    async update(messageData: UpdateMediaDto | UpdateMessageContentDto): Promise<MessageDto>{
        const updatedChannel = await this.messageModel.findByIdAndUpdate(messageData.id, {...messageData}, defaultOptions);
        return updatedChannel as any as MessageDto;
    }

    async updateReadMany(messages: MessageDto[], messagesIds?: string[]): Promise<MessageDto[]>{
        let messagesId: string[] = messagesIds;
        if(!messagesIds.length){
            messagesId = messages.map((message) => message.id);
        }
        
        const updatedMessages = await this.messageModel.updateMany(
            {_id: {$in: messagesId}},
            {$set: {isRead: true}},
        ).exec()
        return updatedMessages as any as MessageDto[];
    }
    
    async delete(messageId: string): Promise<boolean>{
        const deleted = await this.messageModel.findByIdAndDelete(messageId).exec();
        return deleted ? true : false
    }

    private StringifyId(message: any){
        message.id = message._id.toString()
        delete message._id;
        delete message.__v;
        delete message.updatedAt;
    } 
}