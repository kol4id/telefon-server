import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { Message } from "./shemas/message.schema";
import { Model, Types } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { ChannelDto } from "../channels/dto/channel.dto";
import { MessageDto } from "src/messages/dto/message.dto";
import { MongoParser } from "src/mongo/mongoObjectParser";
import { CreateMessageDto } from "src/messages/dto/create-message.dto";
import { UpdateMediaDto, UpdateMessageContentDto } from "./dto/update-message.dto";


@Injectable()
export class MongoMessageService{
    constructor(
        @InjectModel(Message.name) private messageModel: Model<Message>,
        private mongoParser: MongoParser,
    ){}

    async findOne(messageId: string): Promise<MessageDto>{

        const message = await this.messageModel.findById(messageId).exec();

        if(!message){
            throw new BadRequestException('There is no such message')
        }
        const parsedMessages = await this.mongoParser.parse<MessageDto>(['updatedAt'], message);
        return parsedMessages;
    }

    async findManyByChannel(channelId: string, chunkNumber: number, limit: number, sort: 'asc' | 'desc'):Promise<MessageDto[]>{

        const skip = (chunkNumber - 1) * limit;
        const messages = await this.messageModel
            .find({channelId})
            .sort({createdAt: sort})
            .skip(skip)
            .limit(limit)
            .exec()

        const parsedMessages = await this.mongoParser.parseArray<MessageDto>(['updatedAt', '__v'], messages);
        return parsedMessages;
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

        const parsedMessages = await this.mongoParser.parse<MessageDto>(['updatedAt'], created);
        return parsedMessages;
    }

    async update(messageData: UpdateMediaDto | UpdateMessageContentDto): Promise<MessageDto>{
        const updatedChannel = await this.messageModel.findByIdAndUpdate(messageData.id, {...messageData}, {
            runValidators: true,
            new: true,
        })
        const updatedChannelData: MessageDto = await this.mongoParser.parse<MessageDto>(['updatedAt'], updatedChannel);
        return updatedChannelData;
    }
    
    async delete(messageId: string): Promise<any>{
        // console.log(await this.findOne(messageId))
        const deleted = await this.messageModel.findByIdAndDelete(messageId);
        return deleted
    }
}