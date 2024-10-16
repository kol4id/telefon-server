import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Channel } from "./shemas/channel.schema";
import { Model } from "mongoose";
import { ChannelDto } from "../channels/dto/channel.dto";
import { UpdateChannelImgDto, UpdateChannelDto, UpdateChannelLastMessageDto, UpdateChannelModeratorsDto } from "./dto/update-channel.dto";
import { CreateChannelDto } from "src/channels/dto/create-channel.dto";
import idProjection from "./mongo-projection-id-config";

const channelProjection = {
    ...idProjection,
    channelName: 1,
    title: 1,
    imgUrl: 1,
    subscribers: 1,
    moderatorsId: 1,
    lastMessageId: 1,
    updatedAt: 1,
    creatorId: 1, 
    description: 1,
    isPrivte: 1,
    channelType: 1,
}

const defaultOptions = {
    runValidators: true,
    new: true,
    lean: true,
    projection: channelProjection,
}

@Injectable()
export class ChannelRepository {
    constructor(
        @InjectModel(Channel.name) private channelModel: Model<Channel>,
    ){}

    async findById(id: string): Promise<ChannelDto>{
        const channel = await this.channelModel.findById(id, channelProjection).lean();  
        // if (!channel){
        //     throw new NotFoundException(`there is no such channel ${id}`)
        // }

        return channel as any as ChannelDto;
    }

    async findByCreator(creatorId: string): Promise<ChannelDto>{
        const channel = await this.channelModel.findOne({creatorId: creatorId}, channelProjection).lean();
        return channel as any as ChannelDto;
    }

    async findMultipleChannelsById(channelsList: string[]): Promise<ChannelDto[]>{
        const channels = await this.channelModel.find({_id: {$in: channelsList}}, channelProjection).lean();
        
        return channels as any as ChannelDto[];
    }

    async findMultipleByName(subString: string, limit: number):Promise<ChannelDto[]> {
        const regex = new RegExp(subString, 'i');
        const channels = this.channelModel.find({channelName: {$regex: regex}}, channelProjection).limit(limit).lean().exec()
        return channels as any as ChannelDto[]
    }

    async findMultipleByTitle(subString: string, limit: number):Promise<ChannelDto[]> {
        const regex = new RegExp(subString, 'i');
        const channels = this.channelModel.find({title: {$regex: regex}}, channelProjection).limit(limit).lean().exec()
        return channels as any as ChannelDto[]
    }

    async create(channelData: CreateChannelDto, userId: string): Promise<ChannelDto>{
        const newChannel = {...channelData, subscribers: 1}
        const data = Object.assign(newChannel, {creatorId: userId})
        const channel = await this.channelModel.create(data);

        if(channel){
            throw new InternalServerErrorException("Something went wrong when creating channel") 
        }

        this.StringifyId(channel);
    
        return(channel as any as ChannelDto);
    }

    async createEmpty(userId: string): Promise<ChannelDto>{
        const DEFAULT_BLANK_PHOTO_URL = "https://res.cloudinary.com/dz57wrthe/image/upload/v1727736783/blank.jpg";
        const channel = await this.channelModel.create({
            creatorId: userId,
            channelType: 'user',
            isPrivate: false,
            subscribers: 0,
            moderatorsId: [],
            imgUrl: DEFAULT_BLANK_PHOTO_URL
        });
        return channel as any as ChannelDto;
    }

    async update(channelData: ChannelDto| UpdateChannelDto | UpdateChannelLastMessageDto | UpdateChannelModeratorsDto | UpdateChannelImgDto): Promise<ChannelDto>{
        const updatedChannel = await this.channelModel.findByIdAndUpdate(channelData.id, {...channelData}, defaultOptions)
        return updatedChannel as any as ChannelDto;
    }

    async findByCreatorAndUpdate(creatorId: string, channelData: ChannelDto): Promise<ChannelDto>{
        const updatedChannel = this.channelModel.findOneAndUpdate({creatorId: creatorId}, {...channelData}, defaultOptions);
        return updatedChannel as any as ChannelDto
    }

    async messageCount(channelId: string){
        const updatedChannel = await this.channelModel.findByIdAndUpdate(channelId, {$inc: {totalMessages: 1}}, defaultOptions)
        return updatedChannel;
    }

    async subscribe(channelId: string): Promise<ChannelDto>{
        const updatedChannel = await this.channelModel.findByIdAndUpdate(channelId, {$inc: {subscribers: 1}}, defaultOptions)
        return updatedChannel as any as ChannelDto;
    }

    private StringifyId(channels: any){
        channels.forEach((channel)=>{
            channel.id = channel._id.toString()
            delete channel._id;
        })
    } 
}