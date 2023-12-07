import { Optional } from "@nestjs/common";
import { IsDate, IsNumber, IsOptional, IsString } from "class-validator";


export class ChannelDto{
    @IsString()
    readonly id: string;

    @IsString()
    readonly title: string;

    @Optional()
    readonly imgUrl: string;

    @IsNumber()
    readonly subscribers: number;

    @IsOptional()
    readonly moderatorsId: string[];

    @IsOptional()
    readonly lastMessageId: string;

    @IsDate()
    readonly updatedAt: Date;

    @IsString()
    readonly creatorId: string;

}