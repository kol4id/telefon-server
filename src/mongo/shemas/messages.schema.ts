import { Optional } from "@nestjs/common";
import { Prop, Schema } from "@nestjs/mongoose";


@Schema()
export class Message extends Document{
    @Prop()
    channelId: string;

    @Prop()
    creatorId: string;

    @Prop()
    content: string;

    @Prop()
    @Optional()
    media: string[];
}