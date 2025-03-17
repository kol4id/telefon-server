import { ForbiddenException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { transformUserToChannel, UserDto, UserExternalDto } from 'src/user/dto/user.dto';
import { CreateChannelDto, CreateChannelGroupDto } from './dto/create-channel.dto';
import { ChannelRepository } from 'src/mongo/mongo-channel.service';
import { ChannelDto } from 'src/channels/dto/channel.dto';
import { UpdateChannelImgDto, UpdateChannelDto, UpdateChannelLastMessageDto, UpdateChannelModeratorDto, UpdateChannelModeratorsDto } from 'src/mongo/dto/update-channel.dto';
import { UserRepository } from 'src/mongo/mongo-user.service';
import { MediaService } from 'src/media/media.service';
import { ChatRepository } from 'src/mongo/mongo-chat.service';

@Injectable()
export class ChannelsService {
    constructor(
        private channelRepository: ChannelRepository,
        private userRepository: UserRepository,
        private chatRepository: ChatRepository,
        private mediaService: MediaService
    ){}

    private readonly logger = new Logger(ChannelsService.name);

    async findAllForUser(user: UserDto): Promise<ChannelDto[]>{
        return await this.channelRepository.findMultipleChannelsById(user.subscriptions);
    }

    async findByCreator(creatorId: string): Promise<ChannelDto>{
        return this.channelRepository.findByCreator(creatorId);
    }

    async create(channelData: CreateChannelDto, user: UserDto): Promise<ChannelDto>{
        const channel = await this.channelRepository.create(channelData, user.id);
        await this.chatRepository.create([channel.id]);
        return channel;
    }

    async createChannelGroup(channelData: ChannelDto, userId: string): Promise<ChannelDto>{
        return this.channelRepository.createEmptyChannel(channelData, userId);
    }

    async get(channelId: string): Promise<ChannelDto>{
        let channel = await this.channelRepository.findById(channelId);
        if (!channel){
            channel = transformUserToChannel(await this.userRepository.findById(channelId));
        }
        return channel
    }

    async getParticipants(channelId: string, user: UserDto): Promise<UserExternalDto[]>{
        const channel = await this.channelRepository.findById(channelId);
        const chat = await this.chatRepository.findByChannel(channel.id);
        if (!chat.participants.includes(user.id)) return 

        return await this.userRepository.findManyById(chat.participants);
    }

    async searchMany(subString: string, user?: UserDto): Promise<ChannelDto[]>{
        const byName = this.channelRepository.findMultipleByName(subString, 10);
        const byTitle = this.channelRepository.findMultipleByTitle(subString, 10);
        //const userByUsername = this.userRepository.findManyByUsername(subString, 10);

        const channels = await Promise.all([byName, byTitle])
        const channelsConcated = channels[0].concat(channels[1]);

        const uniqueMap = new Map<string, ChannelDto>();
        channelsConcated.forEach(channel => uniqueMap.set(channel.id.toString(), channel))
        let uniqueChannels = Array.from(uniqueMap.values());

        if (user) uniqueChannels = uniqueChannels.filter(channel => {
            return(
                channel.creatorId != user.id ||
                channel.channelType != 'user')
        });

        this.logger.debug(uniqueChannels)
        return uniqueChannels as any as ChannelDto[];
    }

    async updateGeneral(channelParams: UpdateChannelDto, user: UserDto): Promise<UpdateChannelDto> {
        const channel = await this.channelRepository.findById(channelParams.id);

        if(channel.creatorId !== user.id){
            throw new ForbiddenException('You do not have such access rights')
        }
 
        const updatedChannel = await this.channelRepository.update(channelParams)

        if(!updatedChannel){
            throw new InternalServerErrorException("DB: Something went wrong when updating channel last activity")
        }

        return channelParams;        
    }

    async addModerator(channelParams: UpdateChannelModeratorDto, user: UserDto): Promise<UpdateChannelModeratorsDto> {

        const channel = await this.channelRepository.findById(channelParams.id);

        if(channel.creatorId !== user.id){
            throw new ForbiddenException('You do not have such access rights')
        }
        //geting array of channel moderators id <string[]>
        //and adding new moderatot to array
        const moderators = channel.moderatorsId;
        const newModerators = [...moderators, channelParams.moderatorId];

        //updating channel moderator array
        const channelData: UpdateChannelModeratorsDto = {id: channel.id, moderatorsId: newModerators}; 
        const updatedChannel = await this.channelRepository.update(channelData)

        //if some error handle it here
        if(!updatedChannel){
            throw new InternalServerErrorException("DB: Something went wrong when updating channel moderator list")
        }

        return channelData;
    }

    async removeModerator(channelParams: UpdateChannelModeratorDto, user: UserDto, internalCall: boolean = false): Promise<UpdateChannelModeratorsDto> {

        const channel = await this.channelRepository.findById(channelParams.id);

        if (!internalCall){
            if(channel.creatorId !== user.id){
                throw new ForbiddenException('You do not have such access rights')
            }
        }
        //geting array of channel moderators id <string[]>
        //remove moderator with remModeratorId from array 
        const moderators = channel.moderatorsId;
        const newModerators = moderators.filter((value) => value !== channelParams.moderatorId);

        //updating channel moderator array
        const channelData: UpdateChannelModeratorsDto = {id: channel.id, moderatorsId: newModerators}; 
        const updatedChannel = await this.channelRepository.update(channelData)

        //if some error handle it here
        if(!updatedChannel){
            throw new InternalServerErrorException("DB: Something went wrong when updating channel moderator list")
        }

        return channelData;
    }

    async updateLastMessage(channelParams: UpdateChannelLastMessageDto, user: UserDto): Promise<UpdateChannelLastMessageDto> {
        const channel = await this.channelRepository.findById(channelParams.id);
        if(!user.subscriptions.includes(channel.id)){
            return            
        }

        const updatedChannel = await this.channelRepository.update(channelParams)

        if(!updatedChannel){
            throw new InternalServerErrorException("DB: Something went wrong when updating channel last activity")
        }

        return channelParams;
    }
    
    async updatePhoto(channelId: string, user: UserDto, fileData: Buffer): Promise<UpdateChannelImgDto> {
        
        const channel = await this.channelRepository.findById(channelId);

        if(channel.creatorId !== user.id){
            try{
                throw new ForbiddenException('You do not have such access rights')}
            catch(error){
            }
        }
        
        const url = await this.mediaService.create(fileData);        
        const dataToUpdate: UpdateChannelImgDto = {id: channelId, imgUrl: url}
        const updatedChannel = await this.channelRepository.update(dataToUpdate)

        if(!updatedChannel){
            throw new InternalServerErrorException("DB: Something went wrong when updating channel photo")
        }

        return dataToUpdate;
    }

    async UpdateTotalMessages(channelId: string){
        await this.channelRepository.messageCount(channelId);
    }

    async subscribe(channelId: string, userId: string): Promise<ChannelDto[]>{
        const updatedUser = await this.userRepository.addSubscription(userId, channelId);
        this.logger.debug(`new sub added for user: ${updatedUser.id}`)
        this.logger.debug(updatedUser)
        if(updatedUser){
            const channel = await this.channelRepository.subscribe(channelId);
        }
        return await this.findAllForUser(updatedUser);
    }
    
    async unsubscribe(channelId: string, user: string | UserDto): Promise<ChannelDto>{
        const channel = await this.get(channelId);
        let userData: UserDto = typeof user === 'object' 
            ? user 
            : await this.userRepository.findById(user) as UserDto;

        if (channel.channelType == 'user'){
            await this.userRepository.removeSubscription(channel.creatorId, userData.personalChannel);
            await this.channelRepository.reduceSubCount(userData.personalChannel);
        }

        await this.removeModerator({id: channelId, moderatorId: userData.id}, userData, true);
        await this.userRepository.removeSubscription(userData.id, channel.id);
        await this.channelRepository.reduceSubCount(channel.id);
        return channel;
    }
}
