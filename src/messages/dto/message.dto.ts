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
    readonly date: Date;

    @IsBoolean()
    readonly hasMedia: boolean;

    @IsOptional()
    readonly mediaLenght: number;

    @IsOptional()
    readonly mediaUrls: string[];
}