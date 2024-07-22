import { Type } from "class-transformer";
import { IsDate, IsNumber, IsOptional, IsString } from "class-validator";



export class GetMessagesDto{
    @IsString()
    readonly channelId: string;

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