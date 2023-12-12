import { IsBoolean, IsString, MaxLength } from "class-validator";


export class CreateMessageDto{
    @IsString()
    readonly channelId: string;

    @IsString()
    @MaxLength(3000)
    readonly content: string;

    @IsBoolean()
    readonly hasMedia: boolean;
}