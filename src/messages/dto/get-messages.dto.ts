import { IsNumber, IsString } from "class-validator";



export class GetMessagesDto{
    @IsString()
    readonly channelId: string;

    @IsString()
    readonly chunkNumber: string;
}