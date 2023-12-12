import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { Message } from "./shemas/message.schema";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { ChannelDto } from "./dto/channel.dto";
import { MessageDto } from "src/messages/dto/message.dto";
import { MongoParser } from "src/mongo/mongoObjectParser";
import { CreateMessageDto } from "src/messages/dto/create-message.dto";


@Injectable()
export class MongoMessageService{
    constructor(
        @InjectModel(Message.name) private messageModel: Model<Message>,
        private mongoParser: MongoParser,
    ){}

    async findMany(channelId: string, chunkNumber: number, limit: number):Promise<MessageDto[]>{

        const skip = (chunkNumber - 1) * limit;
        const messages = await this.messageModel.find({channelId})
            .sort({createdAt: 'desc'})
            .skip(skip)
            .limit(limit)
            .exec()

        const parsedMessages = await this.mongoParser.parse<MessageDto[]>(['updatedAt'], messages);

        // const resultMessages = messages.map((message)=>{
        //     const parsedMessage =  this.mongoParser.parse<MessageDto>(['createdAt'], message);
        //     return parsedMessage;
        // })

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
}