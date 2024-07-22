import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { MessageDto } from 'src/messages/dto/message.dto';
import { ServerToClientEvents } from './events';
import { MessageRepository } from 'src/mongo/mongo-message.service';
import { ServerToClientMessageType } from './events';
import { UserService } from 'src/user/user.service';
import { UserDto } from 'src/user/dto/user.dto';

type TransferData = {
    eventType: ServerToClientMessageType,
    data: any,
}

@Injectable()
export class RealtimeService {
    constructor(
        private messageRepository: MessageRepository,
        private userService: UserService
    ){}

    async updateUserLastLogin(userId: string): Promise<UserDto>{
        return await this.userService.updateLastLogin(userId);
    }


    async setMessagesRead(userId: string, messages: MessageDto[], params?: IMessagesReadParams): Promise<MessageDto[] | Record<string, MessageDto[]>>{
        const updatedMessages = await this.setMessagesAsRead(messages, params) as Record<string, MessageDto[]>;

        // const user = await this.userService.getUser(userId);
        // Object.entries(updatedMessages).forEach(([key, value]) => {
        //     const sorted = value.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        //     this.userService.updateLastRead(user, sorted[0])
        // })

        return updatedMessages
    }
    
    /**
     * set all messages in array as read
     * 
     * (optionaly)
     * group them by channel for emit 
     * 
     * @param messages array of MessageDto[]. 
     * @param params optional params see IMessagesReadParams
     */
    private async setMessagesAsRead (messages: MessageDto[], params?: IMessagesReadParams): Promise<MessageDto[] | Record<string, MessageDto[]>>{
        const messagesId = messages.map((message) => message.id);
        await this.messageRepository.updateReadMany(messages, messagesId);

        const updatedMessages = await this.messageRepository.findManyById(messagesId);
        if (!params.group) return updatedMessages

        const groups: Record<string, MessageDto[]> = {};
        updatedMessages.forEach((message) => {
            const key = message.channelId;
            if (!groups[key]) groups[key] = [];
            groups[key].push(message);
        });
        return groups
    }
}

export interface IMessagesReadParams{
    group: boolean,
}
