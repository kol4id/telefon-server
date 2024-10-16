import { Optional } from "@nestjs/common";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose"

@Schema({
    timestamps: true,
})
export class Message extends Document{
    @Prop()
    chatId: string;

    @Prop()
    creatorId: string;

    @Prop()
    content: string;

    @Prop()
    isRead: string;

    @Prop()
    readTime: Date;

    @Prop()
    edited: boolean;

    @Prop()
    hasMedia: boolean;

    @Prop()
    @Optional()
    mediaLenght: number;

    @Prop()
    @Optional()
    mediaUrls: string[];
}

export const MessageSchema = SchemaFactory.createForClass(Message);