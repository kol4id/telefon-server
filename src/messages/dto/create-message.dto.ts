import { IsBoolean, IsOptional, IsString, MaxLength } from "class-validator";


export class CreateMessageDto{
    @IsString()
    readonly channelId: string;

    @IsOptional()
    @IsString()
    readonly chatId: string;

    @IsString()
    @MaxLength(3000)
    readonly content: string;

    @IsBoolean()
    readonly hasMedia: boolean;

    readonly media?: ArrayBuffer[];
}


export class CreateMessageChatDto{
    @IsString()
    readonly chatId: string;

    @IsString()
    @MaxLength(3000)
    readonly content: string;

    @IsBoolean()
    readonly hasMedia: boolean;

    readonly mediaUrls?: string[];
}