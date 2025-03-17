import { Injectable, Logger } from '@nestjs/common';
import { ChatDto } from './dto/chat.dto';
import { ChatRepository } from 'src/mongo/mongo-chat.service';
import { UserDto } from 'src/user/dto/user.dto';
import { ChannelRepository } from 'src/mongo/mongo-channel.service';

@Injectable()
export class ChatsService {
    constructor(
        private chatRepository: ChatRepository,
        private channelRepository: ChannelRepository,
    ){}

    private readonly logger = new Logger(ChatsService.name);
    
    async find(channelId: string, secondChannelId: string): Promise<ChatDto>{
        const channel = await this.channelRepository.findById(channelId)
        switch (channel.channelType){
            case 'user': 
                return this.chatRepository.findDMChat([channel.id, secondChannelId]);
            default: 
                return await this.chatRepository.findByChannel(channel.id);
        }
    }

    async get(chatId: string): Promise<ChatDto>{
        return this.chatRepository.findById(chatId);
    }

    async getForUser(userId: string): Promise<ChatDto[]>{
        return this.chatRepository.findByParticipant(userId);   
    } 

    async getByChannel(channelId: string, user: UserDto): Promise<ChatDto>{
        const channel = await this.channelRepository.findById(channelId);
        if (channel.channelType == 'user'){
            return this.chatRepository.findDMChat([user.personalChannel, channel.id]);
        }
        return this.chatRepository.findByChannel(channel.id);
    }

    async getDMByOwner(channelId: string): Promise<ChatDto[]>{
        return this.chatRepository.findDMByChannel(channelId);
    }

    async reduceTotalMessageCount(chatId: string): Promise<ChatDto>{
        return this.chatRepository.decTotalMessages(chatId);
    }

}
