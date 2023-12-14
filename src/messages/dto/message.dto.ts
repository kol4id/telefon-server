import { IsBoolean, IsDate, IsNumber, IsOptional, IsString } from "class-validator";


export class MessageDto{
    @IsString()
    readonly id: string;

    @IsString()
    readonly channelId: string;

    @IsString()
    readonly creatorId: string;

    @IsString()
    readonly content: string;

    @IsBoolean()
    readonly edited: boolean;

    @IsDate()
    readonly createdAt: Date;

    @IsBoolean()
    readonly hasMedia: boolean;

    @IsOptional()
    readonly mediaUrls: string[];
}