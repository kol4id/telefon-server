import { Prop, Schema, SchemaFactory} from '@nestjs/mongoose'
import mongoose, { HydratedDocument} from "mongoose";
import { IMessage } from '../utils';
import { User } from 'src/auth/schemas/user.schema';


export type ChannelDocument = HydratedDocument<Channel>;

@Schema({
    timestamps: true
})
export class Channel{
    @Prop()
    title: string;

    @Prop()
    content: string;

    @Prop()
    messages: IMessage[];

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User'})
    creatorId: User;
}

export const ChannelSchema = SchemaFactory.createForClass(Channel);