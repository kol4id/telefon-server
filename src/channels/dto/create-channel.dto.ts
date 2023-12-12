import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsEmpty } from "class-validator";
import { User } from "src/auth/schemas/user.schema";

export class CreateChannelDto {
    @ApiProperty({type: 'string', example: 'Telegram'})
    @IsNotEmpty()
    @IsString()
    readonly title: string;

    @IsEmpty({message: 'you cannot pass user id'})
    readonly creatorId: User;
}
