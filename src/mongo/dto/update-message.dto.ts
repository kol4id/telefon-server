import { IsBoolean, IsNumber, IsString } from "class-validator";


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