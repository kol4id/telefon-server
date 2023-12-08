import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Channel } from "./shemas/channels.schema";
import { Model } from "mongoose";
import { UserDto } from "./dto/user.dto";
import { ChannelDto } from "./dto/channel.dto";
import { UpdateChannelDto } from "./dto/update-channel.dto";


@Injectable()
export class MongoChannelService {
    constructor(@InjectModel(Channel.name) private channelModel: Model<Channel>){}

    async findById(id: string): Promise<ChannelDto>{
        const channel = await this.channelModel.findById(id);  
        if (!channel){
            throw new NotFoundException('there is no such channel')
        }

        const channelObj = Object.assign(channel);
        const channelData: ChannelDto = {
            id: String(channelObj._id),
                title: channelObj.title,
                imgUrl: channelObj.imgUrl,
                subscribers: channelObj.subscribers,
                moderatorsId: channelObj.moderatorsId,
                lastMessageId: channelObj.lastMessageId,
                updatedAt: channelObj.updatedAt,
                creatorId: channelObj.creatorId,
        }

        return channelData;
    }

    async findAllForUser(user: UserDto): Promise<ChannelDto[]>{

        const channels = await this.channelModel.find({_id: {$in: user.subscriptions}})

        const resultChannels = channels.map((channel)=>{
            const channelObj = Object.assign(channel);
            const newChannel: ChannelDto = {
                id: String(channelObj._id),
                title: channelObj.title,
                imgUrl: channelObj.imgUrl,
                subscribers: channelObj.subscribers,
                moderatorsId: channelObj.moderatorsId,
                lastMessageId: channelObj.lastMessageId,
                updatedAt: channelObj.updatedAt,
                creatorId: channelObj.creatorId,
            }
            return newChannel;
        })
        
        return resultChannels;
    }

    async update(channelData: UpdateChannelDto): Promise<ChannelDto>{
    
        const updatedChannel = await this.channelModel.findByIdAndUpdate(channelData.id, channelData, {
            runValidators: true,
            new: true,
        })
        const channelObj = Object.assign(updatedChannel);
        const updatedChannelData: ChannelDto = {
            id: String(channelObj._id),
                title: channelObj.title,
                imgUrl: channelObj.imgUrl,
                subscribers: channelObj.subscribers,
                moderatorsId: channelObj.moderatorsId,
                lastMessageId: channelObj.lastMessageId,
                updatedAt: channelObj.updatedAt,
                creatorId: channelObj.creatorId,
        }

        return updatedChannelData;
    }

    async updatePhoto(imgUrl: string, channelId: string): Promise<ChannelDto>{
        const updatedChannel = await this.channelModel.findByIdAndUpdate(channelId, {imgUrl: imgUrl}, {
            runValidators: true,
            new: true,
        })
        const channelObj = Object.assign(updatedChannel);
        const updatedChannelData: ChannelDto = {
            id: String(channelObj._id),
                title: channelObj.title,
                imgUrl: channelObj.imgUrl,
                subscribers: channelObj.subscribers,
                moderatorsId: channelObj.moderatorsId,
                lastMessageId: channelObj.lastMessageId,
                updatedAt: channelObj.updatedAt,
                creatorId: channelObj.creatorId,
        }
        
        return updatedChannelData;
    }
}