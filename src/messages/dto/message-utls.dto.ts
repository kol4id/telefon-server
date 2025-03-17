import { IsBoolean, IsDate, IsNumber, IsOptional, IsString, MaxLength } from "class-validator";
import { Type } from "class-transformer";

export class UnreadMessagesDto{
    @IsString()
    readonly chatId: string;

    @IsNumber()
    readonly unreadCount: number;
}

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

export class GetMessagesDto{
    @IsString()
    readonly chatId: string;

    @Type(() => Date)
    @IsDate()
    @IsOptional()
    readonly startDate?: Date;

    @Type(() => Date)
    @IsDate()
    @IsOptional()
    readonly endDate?: Date;

    @Type(() => Number)
    @IsNumber()
    readonly limit: number;
}

export class GetMessagesByDateDto{
    @IsString()
    readonly channelId: string;

    @IsString()
    readonly searchDate: Date;

    @IsString({message: 'Please enter later or earlier'})
    readonly searchSide: 'later' | 'earlier';

    @IsString()
    readonly limit: string; 

}

export class DeleteMessagesDto{
    @IsString()
    readonly messageId: string;

    @IsString()
    readonly chatId: string;
}

export class UpdateMediaDto{
    @IsString()
    readonly id: string;

    @IsBoolean()
    readonly edited: boolean;

    @IsBoolean()
    readonly hasMedia: boolean;

    @IsString()
    readonly mediaUrls: string[];
}

export class UpdateMessageContentDto{
    @IsString()
    readonly id: string;

    @IsString()
    readonly content: string;

    @IsBoolean()
    readonly edited: boolean;
}