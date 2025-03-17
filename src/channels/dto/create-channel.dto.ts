import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { IChannelType } from "./channel.dto";

export class CreateChannelDto {
    @ApiProperty({type: 'string', example: 'Telegram'})
    @IsNotEmpty()
    @IsString()
    readonly title: string;

    @ApiProperty({type: 'string', example: '6560c5cbda0824fc8725f03b'})
    @IsNotEmpty()
    @IsString()
    readonly creatorId: string;
}

export class CreateChannelGroupDto{
    @IsString()
    readonly title: string;

    @IsString()
    readonly channelName: string;

    @IsString()
    @IsOptional()
    readonly description: string;

    @IsString()
    readonly channelType: IChannelType;

    @IsOptional()
    readonly imageBuffer: ArrayBuffer;

    @IsArray()
    @IsString()
    @IsOptional()
    readonly usersToAdd: string[];
}