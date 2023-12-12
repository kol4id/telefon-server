import { ForbiddenException, Injectable, InternalServerErrorException} from '@nestjs/common';
import { UserDto } from 'src/mongo/dto/user.dto';
import { CreateChannelDto } from './dto/create-channel.dto';
import { MongoChannelService } from 'src/mongo/mongo-channel.service';
import { ChannelDto } from 'src/mongo/dto/channel.dto';
import { UpdataChannelImgDto, UpdateChannelDto, UpdateChannelLastMessageDto, UpdateChannelModeratorDto, UpdateChannelModeratorsDto } from 'src/mongo/dto/update-channel.dto';

@Injectable()
export class ChannelsService {
    constructor(private mongoChannelService: MongoChannelService) {}
    // @InjectModel(Channel.name) private channelModel: Model<Channel>
    // async findAll(query: Query): Promise<Channel[]> {

        
    // }

    async findAllForUser(user: UserDto): Promise<ChannelDto[]>{

        return await this.mongoChannelService.findMultipleChannelsById(user.subscriptions);
    }

    async create(channelData: CreateChannelDto, user: UserDto): Promise<boolean>{

        return this.mongoChannelService.create(channelData, user.id)
    }

    async updateGeneral(channelParams: UpdateChannelDto, user: UserDto): Promise<UpdateChannelDto> {
        const channel = await this.mongoChannelService.findById(channelParams.id);

        if(channel.creatorId !== user.id){
            throw new ForbiddenException('You do not have such access rights')
        }
 
        const updatedChannel = await this.mongoChannelService.update(channelParams)

        if(!updatedChannel){
            throw new InternalServerErrorException("DB: Something went wrong when updating channel last activity")
        }

        return channelParams;        
    }

    async addModerator(channelParams: UpdateChannelModeratorDto, user: UserDto): Promise<UpdateChannelModeratorsDto> {

        const channel = await this.mongoChannelService.findById(channelParams.id);

        if(channel.creatorId !== user.id){
            throw new ForbiddenException('You do not have such access rights')
        }
        //geting array of channel moderators id <string[]>
        //and adding new moderatot to array
        const moderators = channel.moderatorsId;
        const newModerators = [...moderators, channelParams.moderatorId];

        //updating channel moderator array
        const channelData: UpdateChannelModeratorsDto = {id: channel.id, moderatorsId: newModerators}; 
        const updatedChannel = await this.mongoChannelService.update(channelData)

        //if some error handle it here
        if(!updatedChannel){
            throw new InternalServerErrorException("DB: Something went wrong when updating channel moderator list")
        }

        return channelData;
    }

    async removeModerator(channelParams: UpdateChannelModeratorDto, user: UserDto): Promise<UpdateChannelModeratorsDto> {

        const channel = await this.mongoChannelService.findById(channelParams.id);

        if(channel.creatorId !== user.id){
            throw new ForbiddenException('You do not have such access rights')
        }
        //geting array of channel moderators id <string[]>
        //remove moderator with remModeratorId from array 
        const moderators = channel.moderatorsId;
        const newModerators = moderators.filter((value) => value !== channelParams.moderatorId);

        //updating channel moderator array
        const channelData: UpdateChannelModeratorsDto = {id: channel.id, moderatorsId: newModerators}; 
        const updatedChannel = await this.mongoChannelService.update(channelData)

        //if some error handle it here
        if(!updatedChannel){
            throw new InternalServerErrorException("DB: Something went wrong when updating channel moderator list")
        }

        return channelData;
    }

    async updateLastMessage(channelParams: UpdateChannelLastMessageDto, user: UserDto): Promise<UpdateChannelLastMessageDto> {

        const channel = await this.mongoChannelService.findById(channelParams.id);

        if(channel.creatorId !== user.id){
            throw new ForbiddenException('You do not have such access rights')
        }

        const updatedChannel = await this.mongoChannelService.update(channelParams)

        if(!updatedChannel){
            throw new InternalServerErrorException("DB: Something went wrong when updating channel last activity")
        }

        return channelParams;
    }
    
    async updatePhoto(channelParams: UpdataChannelImgDto, user: UserDto): Promise<UpdataChannelImgDto> {
        
        const channel = await this.mongoChannelService.findById(channelParams.id);

        if(channel.creatorId !== user.id){
            throw new ForbiddenException('You do not have such access rights')
        }

        const updatedChannel = await this.mongoChannelService.update(channelParams)

        if(!updatedChannel){
            throw new InternalServerErrorException("DB: Something went wrong when updating channel photo")
        }

        return channelParams;
    }

}
