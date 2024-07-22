import { Optional } from "@nestjs/common";
import { IsBoolean, IsDate, IsNumber, IsOptional, isString, IsString } from "class-validator";

export class ChannelDto{
    @IsString()
    readonly id?: string;

    @IsString()
    readonly channelName?: string;

    @IsString()
    readonly title?: string;

    @Optional()
    readonly imgUrl?: string;

    @IsNumber()
    readonly subscribers?: number;

    @IsOptional()
    readonly moderatorsId?: string[];

    @IsOptional()
    readonly lastMessageId?: string;

    @IsDate()
    readonly updatedAt?: Date;

    @IsString()
    readonly creatorId?: string;

    @IsString()
    readonly channelType?: string;

    @IsBoolean()
    readonly isPrivate?: boolean;

    @IsString()
    @IsOptional()
    readonly description?: string;
}
