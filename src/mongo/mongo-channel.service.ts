import { Injectable, NotFoundException, ServiceUnavailableException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Channel } from "./shemas/channels.schema";
import { Model } from "mongoose";
import { ChannelDto } from "./dto/channel.dto";
import { UpdataChannelImgDto, UpdateChannelDto, UpdateChannelLastMessageDto, UpdateChannelModeratorsDto} from "./dto/update-channel.dto";
import { CreateChannelDto } from "src/channels/dto/create-channel.dto";


@Injectable()
export class MongoChannelService {
    constructor(@InjectModel(Channel.name) private channelModel: Model<Channel>){}


    async findById(id: string): Promise<ChannelDto>{
        const channel = await this.channelModel.findById(id);  
        if (!channel){
            throw new NotFoundException('there is no such channel')
        }

        const {createdAt, _id, ...channelObj} =  JSON.parse(JSON.stringify(channel));

        const channelData: ChannelDto = {id: _id, ...channelObj}
        return channelData;
    }

    async findMultipleChannelsById(channelsList: string[]): Promise<ChannelDto[]>{

        const channels = await this.channelModel.find({_id: {$in: channelsList}})

        const resultChannels = channels.map((channel)=>{
            const {createdAt, _id, ...channelObj} =  JSON.parse(JSON.stringify(channel));
            const newChannel: ChannelDto = {id: _id, ...channelObj}
            return newChannel;
        })
        
        return resultChannels;
    }

    async create(channelData: CreateChannelDto, userId: string): Promise<boolean>{

        const newChannel = {...channelData, subscribers: 1}
        const data = Object.assign(newChannel, {creatorId: userId})

        try{
            await this.channelModel.create(data);
            return(true);
        } catch(error){
            throw new ServiceUnavailableException("Something went wrong when creating channel") 
        }
    }

    async update(channelData: UpdateChannelDto | UpdateChannelLastMessageDto | UpdateChannelModeratorsDto | UpdataChannelImgDto): Promise<ChannelDto>{
    
        console.log(channelData)
        const updatedChannel = await this.channelModel.findByIdAndUpdate(channelData.id, {...channelData}, {
            runValidators: true,
            new: true,
        })
        const {createdAt, _id, ...channelObj} =  JSON.parse(JSON.stringify(updatedChannel));
        const updatedChannelData: ChannelDto = {id: _id, ...channelObj}

        return updatedChannelData;
    }
}