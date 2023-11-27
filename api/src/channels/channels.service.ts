import { Injectable } from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import { Channel } from './schemas/channels.schema';
import { Model } from 'mongoose';
import { Query } from 'express-serve-static-core';
import { User } from 'src/auth/schemas/user.schema';

@Injectable()
export class ChannelsService {
    constructor(@InjectModel(Channel.name) private channelModel: Model<Channel>) {}

    async findAll(query: Query): Promise<Channel[]> {

        // const channelsPerPage = 2;
        // const currentPage = Number(query.page) || 1;
        // const skip = channelsPerPage * (currentPage - 1);

        // const keyword = query.keyword ? {
        //     title: {
        //         $regex: query.keyword,
        //         $options: 'i'
        //     }
        // } : {}

        return await this.channelModel.find();
    }
    
    async findById(id: string): Promise<Channel>{
        return await this.channelModel.findById(id);
    }

    async updateById(id: string, channel: Channel): Promise<Channel>{
        return await this.channelModel.findByIdAndUpdate(id, channel, {
            new: true,
            runValidators: true,
        });
    }

    async create(channel: Channel, user: User): Promise<Channel>{
        const data = Object.assign(channel, {creatorId: user._id})

        return await this.channelModel.create(data);
    }

}
