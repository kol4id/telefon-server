import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Channel } from "./shemas/channels.schema";
import { Model } from "mongoose";
import { UserDto } from "./dto/user.dto";
import { ChannelDto } from "./dto/channel.dto";


@Injectable()
export class MongoChannelService {
    constructor(@InjectModel(Channel.name) private channelModel: Model<Channel>){}

    async findAllForUser(user: UserDto): Promise<void>{

        const channels = await this.channelModel.find({_id: {$in: user.subscriptions}})
        console.log(channels);

        // const resultChannels = channels.map((channel)=>{
        //     const newChannel: ChannelDto = {
        //         id: String(channel._id),
        //         title: channel.title,
        //         imgUrl: channel.imgUrl,
        //         subscribers: channel.subscribers,
        //         moderatorsId: channel.moderatorsId,
        //         lastMessageId: channel.lastMessageId,
                
        //     }
        // })
    }
}