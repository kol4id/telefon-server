import { Prop, Schema, SchemaFactory} from '@nestjs/mongoose'
import { HydratedDocument} from "mongoose";
import { Optional } from '@nestjs/common';


export type ChatDocument = HydratedDocument<Chat>;

@Schema({
    timestamps: true
})
export class Chat{
    @Optional()
    @Prop()
    owner: string[];

    @Optional()
    @Prop()
    totalMessages: number;

    @Prop()
    updatedAt?: Date;

    @Optional()
    @Prop()
    participants?: string[];

    @Optional()
    @Prop()
    lastMessage?: string;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);