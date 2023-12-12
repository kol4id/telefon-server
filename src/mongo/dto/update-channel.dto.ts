import { Optional } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsEmpty, IsNotEmpty, IsString } from "class-validator";
import { User } from "src/auth/schemas/user.schema";

export class UpdateChannelDto {
    @ApiProperty({type: 'string', example: '6577417dd6769aad5c4ba04e'})
    @IsNotEmpty({message: 'channel ID requred to update'})
    readonly id: string

    @ApiProperty({type: 'string', example: 'Telegram'})
    @Optional()
    @IsString()
    readonly title: string;

    @ApiProperty({type: 'string', example: 'This is official telegram channel'})
    @Optional()
    @IsString()
    readonly description: string;
    
    @IsEmpty({message: 'you cannot pass user id'})
    readonly creatorId: User;
}

export class UpdataChannelImgDto {
    @ApiProperty({type: 'string', example: '6577417dd6769aad5c4ba04e'})
    @IsNotEmpty({message: 'channel ID requred to update'})
    readonly id: string;

    @ApiProperty({type: 'string', example: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Telegram_2019_Logo.svg/800px-Telegram_2019_Logo.svg.png'})
    @IsString()
    readonly imgUrl: string;
}

export class UpdateChannelModeratorDto {
    @ApiProperty({type: 'string', example: '6577417dd6769aad5c4ba04e'})
    @IsNotEmpty({message: 'channel ID requred to update'})
    readonly id: string;

    @ApiProperty({type: 'string', example: '655fbf9d14beecb1a0ff7e9d'})
    @IsString()
    readonly moderatorId: string;
}

export class UpdateChannelModeratorsDto {
    @ApiProperty({type: 'string', example: '6577417dd6769aad5c4ba04e'})
    @IsNotEmpty({message: 'channel ID requred to update'})
    readonly id: string;

    @ApiProperty({type: 'string', example: "['6577417dd6769aad5c4ba04e', '656a76704a5e300b8da9409e']"})
    @IsString()
    @IsArray()
    readonly moderatorsId: string[];
}

export class UpdateChannelLastMessageDto {
    @ApiProperty({type: 'string', example: '6577417dd6769aad5c4ba04e'})
    @IsNotEmpty({message: 'channel ID requred to update'})
    readonly id: string;

    @ApiProperty({type: 'string', example: '656536883be838eaf407f192'})
    @IsString()
    readonly lastMessageId: string;
}
