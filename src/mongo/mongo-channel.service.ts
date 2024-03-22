import { Injectable, InternalServerErrorException, NotFoundException} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Channel } from "./shemas/channel.schema";
import { Model } from "mongoose";
import { ChannelDto } from "../channels/dto/channel.dto";
import { UpdateChannelImgDto, UpdateChannelDto, UpdateChannelLastMessageDto, UpdateChannelModeratorsDto} from "./dto/update-channel.dto";
import { CreateChannelDto } from "src/channels/dto/create-channel.dto";
import { MongoParser } from "./mongoObjectParser";

const channelProjection = {
    id: 1,
    title: 1,
    imgUrl: 1,
    subscribers: 1,
    moderatorsId: 1,
    lastMessageId: 1,
    updatedAt: 1,
}

@Injectable()
export class MongoChannelService {
    constructor(
        @InjectModel(Channel.name) private channelModel: Model<Channel>,
        private mongoParser: MongoParser){}


    async findById(id: string): Promise<ChannelDto>{
        const channel = await this.channelModel.findById(id, channelProjection);  
        if (!channel){
            throw new NotFoundException('there is no such channel')
        }
        this.StringifyId(channel);

        return channel as any as ChannelDto;
    }

    async findMultipleChannelsById(channelsList: string[]): Promise<ChannelDto[]>{

        const channels = await this.channelModel.find({_id: {$in: channelsList}}, channelProjection);
        this.StringifyId(channels);
        
        return channels as any as ChannelDto[];
    }

    async create(channelData: CreateChannelDto, userId: string): Promise<boolean>{

        const newChannel = {...channelData, subscribers: 1}
        const data = Object.assign(newChannel, {creatorId: userId})

        try{
            await this.channelModel.create(data);
            return(true);
        } catch(error){
            throw new InternalServerErrorException("Something went wrong when creating channel") 
        }
    }

    async update(channelData: UpdateChannelDto | UpdateChannelLastMessageDto | UpdateChannelModeratorsDto | UpdateChannelImgDto): Promise<ChannelDto>{
    
        const updatedChannel = await this.channelModel.findByIdAndUpdate(channelData.id, {...channelData}, {
            runValidators: true,
            new: true,
        })
        const parsedChannels = await this.mongoParser.parse<ChannelDto>(['createdAt', '__v'], updatedChannel);
        return parsedChannels;
    }

    async messageCount(channelId: string){
        const updatedChannel = await this.channelModel.findByIdAndUpdate(channelId, {$inc: {totalMessages: 1}})
        return updatedChannel;
    }

    async subscribe(channelId: string): Promise<ChannelDto>{
        const updatedChannel = await this.channelModel.findByIdAndUpdate(channelId, {$inc: {subscribers: 1}}, {
            runValidators: true,
            new: true,
        })

        const parsedChannels = await this.mongoParser.parse<ChannelDto>(['createdAt', '__v'], updatedChannel);
        return parsedChannels;
    }

    private StringifyId(channels: any){
        channels.forEach((channel)=>{
            channel.id = channel._id.toString()
            delete channel._id;
        })
    } 
}