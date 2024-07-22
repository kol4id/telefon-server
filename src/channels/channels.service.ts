import { ForbiddenException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { transformUserToChannel, UserDto } from 'src/user/dto/user.dto';
import { CreateChannelDto } from './dto/create-channel.dto';
import { ChannelRepository } from 'src/mongo/mongo-channel.service';
import { ChannelDto } from 'src/channels/dto/channel.dto';
import { UpdateChannelImgDto, UpdateChannelDto, UpdateChannelLastMessageDto, UpdateChannelModeratorDto, UpdateChannelModeratorsDto } from 'src/mongo/dto/update-channel.dto';
import { UserRepository } from 'src/mongo/mongo-user.service';
import { CloudinaryService } from 'src/cloudinary/сloudinary.service';
import { MediaService } from 'src/media/media.service';

@Injectable()
export class ChannelsService {
    constructor(
        private channelRepository: ChannelRepository,
        private userRepository: UserRepository,
        private mediaService: MediaService
    ){}

    private readonly logger = new Logger(ChannelsService.name);
    // @InjectModel(Channel.name) private channelModel: Model<Channel>
    // async findAll(query: Query): Promise<Channel[]> {

        
    // }

    async findAllForUser(user: UserDto): Promise<ChannelDto[]>{
        return await this.channelRepository.findMultipleChannelsById(user.subscriptions);
    }

    async create(channelData: CreateChannelDto, user: UserDto): Promise<ChannelDto>{
        return this.channelRepository.create(channelData, user.id)
    }

    async get(channelId: string): Promise<ChannelDto>{
        let channel = await this.channelRepository.findById(channelId);
        if (!channel){
            channel = transformUserToChannel(await this.userRepository.findById(channelId));
        
        }
        return channel
    }

    async searchMany(subString: string): Promise<ChannelDto>{
        const byName = this.channelRepository.findMultipleByName(subString, 10);
        const byTitle = this.channelRepository.findMultipleByTitle(subString, 10);
        const userByUsername = this.userRepository.findManyByUsername(subString, 10);

        const channels = await Promise.all([byName, byTitle, userByUsername])
        let usersAsChannel = [];

        // channels[2] == userByUsername
        if (channels[2]) {
            usersAsChannel = channels[2].map(user =>
                transformUserToChannel(user)
            )
        }
        this.logger.debug(usersAsChannel)
        
        const channelsConcated = channels[0].concat(channels[1].concat(usersAsChannel));
        return channelsConcated as any
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

    async removeModerator(channelParams: UpdateChannelModeratorDto, user: UserDto): Promise<UpdateChannelModeratorsDto> {

        const channel = await this.channelRepository.findById(channelParams.id);

        if(channel.creatorId !== user.id){
            throw new ForbiddenException('You do not have such access rights')
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

    async subscribe(channelId: string, user: UserDto): Promise<void>{
        const result = await this.userRepository.addSubscription(user.id, channelId);

        if(result){
            const channel = await this.channelRepository.subscribe(channelId);
        }
    }
}
