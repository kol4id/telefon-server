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
    

    async get(chatId: string): Promise<ChatDto>{
        return this.chatRepository.findById(chatId);
    }

    async getForUser(user: UserDto): Promise<ChatDto[]>{
        return this.chatRepository.findByParticipant(user.id);
    }

    async getByChannel(channelId: string, user: UserDto): Promise<ChatDto>{
        const channel = await this.channelRepository.findById(channelId);
        if (channel.channelType == 'user'){
            return this.chatRepository.findDMChat([user.personalChannel, channel.id]);
        }
        return this.chatRepository.findByChannel(channel.id);
    }
    // async create(chat: ChatDto): Promise<ChatDto>{
    //     return this.chatRepository.create(chat);
    // }

    // // 


    // async findAllForUser(user: UserDto): Promise<ChannelDto[]>{
    //     return await this.channelRepository.findMultipleChannelsById(user.subscriptions);
    // }

    // async create(channelData: CreateChannelDto, user: UserDto): Promise<ChannelDto>{
    //     return this.channelRepository.create(channelData, user.id)
    // }

    // async get(channelId: string): Promise<ChannelDto>{
    //     let channel = await this.channelRepository.findById(channelId);
    //     if (!channel){
    //         channel = transformUserToChannel(await this.userRepository.findById(channelId));
        
    //     }
    //     return channel
    // }

    // async searchMany(subString: string, user?: UserDto): Promise<ChannelDto[]>{
    //     const byName = this.channelRepository.findMultipleByName(subString, 10);
    //     const byTitle = this.channelRepository.findMultipleByTitle(subString, 10);
    //     //const userByUsername = this.userRepository.findManyByUsername(subString, 10);

    //     const channels = await Promise.all([byName, byTitle])
    //     const channelsConcated = channels[0].concat(channels[1]);

    //     const uniqueMap = new Map<string, ChannelDto>();
    //     channelsConcated.forEach(channel => uniqueMap.set(channel.id.toString(), channel))
    //     let uniqueChannels = Array.from(uniqueMap.values());

    //     if (user) uniqueChannels = uniqueChannels.filter(channel => channel.creatorId != user.id);

    //     this.logger.debug(uniqueChannels)
    //     return uniqueChannels as any as ChannelDto[];
    // }

    // async updateGeneral(channelParams: UpdateChannelDto, user: UserDto): Promise<UpdateChannelDto> {
    //     const channel = await this.channelRepository.findById(channelParams.id);

    //     if(channel.creatorId !== user.id){
    //         throw new ForbiddenException('You do not have such access rights')
    //     }
 
    //     const updatedChannel = await this.channelRepository.update(channelParams)

    //     if(!updatedChannel){
    //         throw new InternalServerErrorException("DB: Something went wrong when updating channel last activity")
    //     }

    //     return channelParams;        
    // }

    // async addModerator(channelParams: UpdateChannelModeratorDto, user: UserDto): Promise<UpdateChannelModeratorsDto> {

    //     const channel = await this.channelRepository.findById(channelParams.id);

    //     if(channel.creatorId !== user.id){
    //         throw new ForbiddenException('You do not have such access rights')
    //     }
    //     //geting array of channel moderators id <string[]>
    //     //and adding new moderatot to array
    //     const moderators = channel.moderatorsId;
    //     const newModerators = [...moderators, channelParams.moderatorId];

    //     //updating channel moderator array
    //     const channelData: UpdateChannelModeratorsDto = {id: channel.id, moderatorsId: newModerators}; 
    //     const updatedChannel = await this.channelRepository.update(channelData)

    //     //if some error handle it here
    //     if(!updatedChannel){
    //         throw new InternalServerErrorException("DB: Something went wrong when updating channel moderator list")
    //     }

    //     return channelData;
    // }

    // async removeModerator(channelParams: UpdateChannelModeratorDto, user: UserDto): Promise<UpdateChannelModeratorsDto> {

    //     const channel = await this.channelRepository.findById(channelParams.id);

    //     if(channel.creatorId !== user.id){
    //         throw new ForbiddenException('You do not have such access rights')
    //     }
    //     //geting array of channel moderators id <string[]>
    //     //remove moderator with remModeratorId from array 
    //     const moderators = channel.moderatorsId;
    //     const newModerators = moderators.filter((value) => value !== channelParams.moderatorId);

    //     //updating channel moderator array
    //     const channelData: UpdateChannelModeratorsDto = {id: channel.id, moderatorsId: newModerators}; 
    //     const updatedChannel = await this.channelRepository.update(channelData)

    //     //if some error handle it here
    //     if(!updatedChannel){
    //         throw new InternalServerErrorException("DB: Something went wrong when updating channel moderator list")
    //     }

    //     return channelData;
    // }

    // async updateLastMessage(channelParams: UpdateChannelLastMessageDto, user: UserDto): Promise<UpdateChannelLastMessageDto> {
    //     const channel = await this.channelRepository.findById(channelParams.id);
    //     if(!user.subscriptions.includes(channel.id)){
    //         return            
    //     }

    //     const updatedChannel = await this.channelRepository.update(channelParams)

    //     if(!updatedChannel){
    //         throw new InternalServerErrorException("DB: Something went wrong when updating channel last activity")
    //     }

    //     return channelParams;
    // }
    
    // async updatePhoto(channelId: string, user: UserDto, fileData: Buffer): Promise<UpdateChannelImgDto> {
        
    //     const channel = await this.channelRepository.findById(channelId);

    //     if(channel.creatorId !== user.id){
    //         try{
    //             throw new ForbiddenException('You do not have such access rights')}
    //         catch(error){
    //         }
    //     }
        
    //     const url = await this.mediaService.create(fileData);        
    //     const dataToUpdate: UpdateChannelImgDto = {id: channelId, imgUrl: url}
    //     const updatedChannel = await this.channelRepository.update(dataToUpdate)

    //     if(!updatedChannel){
    //         throw new InternalServerErrorException("DB: Something went wrong when updating channel photo")
    //     }

    //     return dataToUpdate;
    // }

    // async UpdateTotalMessages(channelId: string){
    //     await this.channelRepository.messageCount(channelId);
    // }

    // async subscribe(channelId: string, user: UserDto): Promise<ChannelDto[]>{
    //     const updatedUser = await this.userRepository.addSubscription(user.id, channelId);
    //     this.logger.debug(`new sub added for user: ${updatedUser.id}`)
    //     this.logger.debug(updatedUser)
    //     if(updatedUser){
    //         const channel = await this.channelRepository.subscribe(channelId);
    //     }
    //     return await this.findAllForUser(updatedUser);
    // }
}
