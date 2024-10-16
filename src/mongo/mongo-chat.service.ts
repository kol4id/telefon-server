import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ChatDto } from "src/chats/dto/chat.dto";
import { Chat } from "./shemas/chat.schema";
import idProjection from "./mongo-projection-id-config";

const chatProjection = {
    ...idProjection,
    owner: 1,
    totalMessages: 1,
    updatedAt: 1,
    participants: 1,
    lastMessage: 1,
}

const defaultOptions = {
    runValidators: true,
    new: true,
    lean: true,
    projection: chatProjection,
}

@Injectable()
export class ChatRepository {
    constructor(
        @InjectModel(Chat.name) private chatModel: Model<Chat>,
    ){}

    async create(owners?: string[]): Promise<ChatDto>{
        const newChat: ChatDto = {
            totalMessages: 0,
            owner: owners
        }
        const data = await this.chatModel.create(newChat)
        return this.chatModel.findById(data._id, chatProjection).lean();
    }

    async findById(id: string): Promise<ChatDto>{
        const chat = await this.chatModel.findById(id, chatProjection).lean();
        if (!chat) throw new NotFoundException(`there is no such chat ${id}`);
        return chat;
    }

    async findByOwner(ownerId: string): Promise<ChatDto[]>{
        const chats = await this.chatModel.find({owner: ownerId}, chatProjection).lean();
        if (!chats) throw new NotFoundException(`there is no such chat with owner${ownerId}`);
        return chats
    }

    async findByChannel(ownerId: string): Promise<ChatDto>{
        const chat = await this.chatModel.findOne({owner: ownerId, $expr: { $eq: [{ $size: "$owner" }, 1]}}, chatProjection).lean();
        // if (!chat) throw new NotFoundException(`there is no such chat with owner${ownerId}`);
        return chat
    }

    async findByParticipant(participantId: string): Promise<ChatDto[]>{
        const chats = await this.chatModel.find({participants: participantId}, chatProjection).lean();
        // if (chats) throw new NotFoundException(`there is no such chat with participant${participantId}`);
        return chats
    }

    async findDMChat(owners: string[]): Promise<ChatDto>{
        const chat = await this.chatModel.findOne({owner: {$all: owners}}, chatProjection).lean();
        // if (!chat) throw new NotFoundException(`there is no such chat with owners ${owners}`);
        return chat;
    }

    async updateLastMessage(chatId: string, messageId: string): Promise<ChatDto>{
        const chat = await this.chatModel.findByIdAndUpdate(chatId, {$set: {lastMessage: messageId}}, chatProjection);
        if (!chat) throw new NotFoundException(`there is no such chat ${chatId}`);
        return chat;
    }

    async incTotalMessages(id: string): Promise<ChatDto>{
        const chat = await this.chatModel.findByIdAndUpdate(id, {$inc: {totalMessages: 1}}, chatProjection).lean();
        if (!chat) throw new NotFoundException(`there is no such chat${id}`);
        return chat;
    }

    async decTotalMessages(id: string): Promise<ChatDto>{
        const chat = await this.chatModel.findById(id, chatProjection).lean();
        if (!chat) throw new NotFoundException(`there is no such chat ${id}`);
        if (chat.totalMessages <= 0) throw new NotFoundException(`total messages cannot be less than 0`);
        return this.chatModel.findByIdAndUpdate(id, {$inc: {totalMessages: -1}}).lean();
    }

    async addParticipants(chatId: string, usersId: string[]): Promise<ChatDto>{
        const chat = await this.chatModel.findById(chatId, chatProjection).lean();
        if (!chat) throw new NotFoundException(`there is no such chat ${chatId}`);
        const idToAdd = usersId.filter(id => !chat.participants.includes(id));
        return this.chatModel.findByIdAndUpdate(chatId, {$push: {participants: {$each: idToAdd}}}).lean();
    }

    async addParticipant(chatId: string, userId: string): Promise<ChatDto>{
        const chat = await this.chatModel.findById(chatId, chatProjection).lean();
        if (!chat) throw new NotFoundException(`there is no such chat${chatId}`);
        if (chat.participants.includes(userId)) throw new ForbiddenException(`you already participant of the chat ${chatId}`)
        return this.chatModel.findByIdAndUpdate(chatId, {$push: {participants: userId}}).lean();
    }

    async deleteById(id: string): Promise<ChatDto>{
        return this.chatModel.findByIdAndDelete(id, chatProjection).lean().exec();
    }
}