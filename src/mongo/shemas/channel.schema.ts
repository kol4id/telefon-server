import { Prop, Schema, SchemaFactory} from '@nestjs/mongoose'
import { HydratedDocument} from "mongoose";
import { Optional } from '@nestjs/common';


export type ChannelDocument = HydratedDocument<Channel>;

@Schema({
    timestamps: true
})
export class Channel{
    @Prop()
    title: string;

    @Prop()
    channelName: string;

    @Prop()
    creatorId: string;

    @Prop()
    isPrivate: boolean;

    @Prop()
    channelType: string;

    @Prop()
    @Optional()
    imgUrl: string;

    @Prop()
    @Optional()
    description: string;

    @Prop()
    @Optional()
    subscribers: number;

    @Prop()
    @Optional()
    moderatorsId: string[];

    @Prop()
    @Optional()
    lastMessage: Date;
}

export const ChannelSchema = SchemaFactory.createForClass(Channel);