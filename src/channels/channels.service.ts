import { ForbiddenException, Injectable, InternalServerErrorException} from '@nestjs/common';
import { UserDto } from 'src/mongo/dto/user.dto';
import { CreateChannelDto } from './dto/create-channel.dto';
import { ChannelRepository } from 'src/mongo/mongo-channel.service';
import { ChannelDto } from 'src/channels/dto/channel.dto';
import { UpdateChannelImgDto, UpdateChannelDto, UpdateChannelLastMessageDto, UpdateChannelModeratorDto, UpdateChannelModeratorsDto } from 'src/mongo/dto/update-channel.dto';
import { UserRepository } from 'src/mongo/mongo-user.service';
import { CloudinaryService } from 'src/cloudinary/сloudinary.service';

@Injectable()
export class ChannelsService {
    constructor(
        private mongoChannelService: ChannelRepository,
        private mongoUserService: UserRepository,
        private cloudinaryService: CloudinaryService
    ){}
    // @InjectModel(Channel.name) private channelModel: Model<Channel>
    // async findAll(query: Query): Promise<Channel[]> {

        
    // }

    async findAllForUser(user: UserDto): Promise<ChannelDto[]>{

        return await this.mongoChannelService.findMultipleChannelsById(user.subscriptions);
    }

    async create(channelData: CreateChannelDto, user: UserDto): Promise<ChannelDto>{

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

        if(!user.subscriptions.includes(channel.id)){
            throw new ForbiddenException('You do not have such access rights')
        }
        const updatedChannel = await this.mongoChannelService.update(channelParams)

        if(!updatedChannel){
            throw new InternalServerErrorException("DB: Something went wrong when updating channel last activity")
        }

        return channelParams;
    }
    
    async updatePhoto(channelId: string, user: UserDto, fileData: Buffer): Promise<UpdateChannelImgDto> {
        
        const channel = await this.mongoChannelService.findById(channelId);

        if(channel.creatorId !== user.id){
            throw new ForbiddenException('You do not have such access rights')
        }
        
        const url = await this.cloudinaryService.UploadImageByFile(fileData);        
        const dataToUpdate: UpdateChannelImgDto = {id: channelId, imgUrl: url}
        const updatedChannel = await this.mongoChannelService.update(dataToUpdate)

        if(!updatedChannel){
            throw new InternalServerErrorException("DB: Something went wrong when updating channel photo")
        }

        return dataToUpdate;
    }

    async UpdateTotalMessages(channelId: string){
        await this.mongoChannelService.messageCount(channelId);
    }

    async subscribe(channelId: string, user: UserDto): Promise<void>{
        const result = await this.mongoUserService.addSubscription(user.id, channelId);

        if(result){
            const channel = await this.mongoChannelService.subscribe(channelId);
            console.log(channel);
        }
    }
}
