import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

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
