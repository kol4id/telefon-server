import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class LoginUserDto {
    @ApiProperty({type: 'string', example: 'over90006at9@gmail.com'})
    @IsEmail({}, {message: 'Please enter correct email'})
    readonly email: string;

    @ApiProperty({type: 'string', example: 'longer6char'})
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    readonly password: string;
}