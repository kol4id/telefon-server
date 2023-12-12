import { Optional } from "@nestjs/common";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose"

@Schema({
    timestamps: true,
})
export class Message extends Document{
    @Prop()
    channelId: string;

    @Prop()
    creatorId: string;

    @Prop()
    content: string;

    @Prop()
    edited: boolean;

    @Prop()
    hasMedia: boolean;

    @Prop()
    @Optional()
    mediaLenght: boolean;

    @Prop()
    @Optional()
    mediaUrls: string[];
}

export const MessageSchema = SchemaFactory.createForClass(Message);