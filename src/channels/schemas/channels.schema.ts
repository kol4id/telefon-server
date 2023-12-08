import { Prop, Schema, SchemaFactory} from '@nestjs/mongoose'
import mongoose, { HydratedDocument} from "mongoose";
import { User } from 'src/auth/schemas/user.schema';
import { Optional } from '@nestjs/common';


export type ChannelDocument = HydratedDocument<Channel>;

@Schema({
    timestamps: true
})
export class Channel{
    @Prop()
    title: string;

    @Prop()
    @Optional()
    imgUrl: string;

    @Prop()
    @Optional()
    description: string

    @Prop()
    @Optional()
    subscribers: number

    @Prop()
    @Optional()
    moderatorsId: string[]

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User'})
    creatorId: User;
}

export const ChannelSchema = SchemaFactory.createForClass(Channel);