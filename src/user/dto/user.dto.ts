import { ApiProperty, OmitType } from "@nestjs/swagger";
import { IsArray, IsEmail, IsOptional, IsString } from "class-validator";
import { Date } from "mongoose";
import { ChannelDto } from "src/channels/dto/channel.dto";

export class UserDto{
    @ApiProperty({type: 'string', example: '655fb528340f40ad3cddd929'})
    @IsString()
    readonly id: string;

    @ApiProperty({type: 'string', example: 'over90006at9@gmail.com'})
    @IsEmail()
    readonly email: string;

    @ApiProperty({type: 'string', example: 'kiril'})
    @IsOptional()
    @IsString()
    readonly firstName: string;

    @ApiProperty({type: 'string', example: 'familiya'})
    @IsOptional()
    @IsString()
    readonly lastName: string;

    @ApiProperty({type: 'string', example: 'kol4id'})
    @IsOptional()
    @IsString()
    readonly userName: string;

    @ApiProperty({type: 'string', example: 'https://cdn.fishki.net/upload/post/2022/04/20/4126733/9b9e32090356c1d18fe17ae836196e0a.jpg'})
    @IsOptional()
    @IsString()
    readonly photoUrl: string;

    @ApiProperty({type: 'string[]', example: ['658312cdec90aea7e5b457e6', '65831453ec90aea7e5b457e9']})
    @IsOptional()
    @IsArray()
    readonly subscriptions: string[];

    // @ApiProperty({type: 'Map<string, string>', example: [{'65831453ec90aea7e5b457e9': '658312cdec90aea7e5b457e6'}]})
    // @IsOptional()
    // @IsArray()
    // readonly dmChats: Map<string, string>

    @ApiProperty({type: 'string[]', example: ['658312cdec90aea7e5b457e6']})
    @IsOptional()
    @IsArray()
    readonly favorite: string[];

    @ApiProperty({type: 'string[]', example: ['65831453ec90aea7e5b457e9']})
    @IsOptional()
    @IsArray()
    readonly blacklist: string[];

    @ApiProperty({type: 'string', example: [{'65831453ec90aea7e5b457e9': 45633}, {'658312cdec90aea7e5b457e6': 23626}]})
    @IsOptional()
    readonly lastReads: Map<string, Date>;

    @ApiProperty({type: 'date', example: ['2024-05-21T19:27:30.950+00:00']})
    @IsOptional()
    readonly lastLogin: Date;

    @ApiProperty({type: 'string', example: ['65831453ec90aea7e5b457e9']})
    @IsOptional()
    readonly personalChannel: string;
};

export class UserExternalDto extends OmitType(UserDto, ['email', 'subscriptions', 'lastReads', 'favorite', 'blacklist'] as const){}


export function transformUserToChannel(user: UserDto): ChannelDto {
    return {
        id: user.id,
        channelName: user.userName,
        title: `${user.firstName} ${user.lastName}`,
        imgUrl: user.photoUrl,
        subscribers: 0, // Значение по умолчанию
        moderatorsId: [], // Значение по умолчанию
        lastMessage: new Date(), // Значение по умолчанию
        updatedAt: new Date(),
        creatorId: user.id,
        channelType: 'user',
        isPrivate: true,
        description: `${user.firstName} ${user.lastName}'s channel`
    };
  }