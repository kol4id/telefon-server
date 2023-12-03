import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import { Channel } from './schemas/channels.schema';
import { Model } from 'mongoose';
import { Query } from 'express-serve-static-core';
import { User } from 'src/auth/schemas/user.schema';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { UserDto } from 'src/auth/dto/user.dto';

@Injectable()
export class ChannelsService {
    constructor(@InjectModel(Channel.name) private channelModel: Model<Channel>) {}

    async findAll(query: Query): Promise<Channel[]> {
        return await this.channelModel.find();
    }

    async findAllForUser(user: UserDto): Promise<Channel[]>{

        return await this.channelModel.find({ _id: {$in: user.subscriptions}});
    }
    
    async findById(id: string): Promise<Channel>{
        const channel = await this.channelModel.findById(id);

        if(!channel){
            throw new NotFoundException('there is no such channel');
        }

        return channel
    }

    async updateById(channelData: UpdateChannelDto, user: UserDto): Promise<Channel>{
        const channel = await this.channelModel.findById(channelData.id)
        if (!channel){
            throw new NotFoundException('there is no such channel')
        }

        if (String(channel.creatorId) !== user.id){
            throw new ForbiddenException('You do not have such access rights')
        }

        return await this.channelModel.findByIdAndUpdate(channelData.id, channel, {
            runValidators: true,
            new: true,
        });
    }

    async updatePhoto(imgUrl: string, user: UserDto, channelId: string): Promise<Channel>{
        const channel = await this.channelModel.findById(channelId)
        if (!channel){
            throw new NotFoundException('there is no such channel')
        }
        
        if (String(channel.creatorId) !== user.id){
            throw new ForbiddenException('You do not have such access rights')
        }

        channel.imgUrl = imgUrl;
        return await this.channelModel.findByIdAndUpdate(channelId, channel, {
            runValidators: true,
            new: true,
        });
        // return await this.channelModel.findByIdAndUpdate()
    }

    async create(channel: Channel, user: User): Promise<Channel>{
        const data = Object.assign(channel, {creatorId: user._id})

        return await this.channelModel.create(data);
    }

}
