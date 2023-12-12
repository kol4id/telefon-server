import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class SignupUserDto {
    @ApiProperty({type: 'string', example: 'kol4id'})
    @IsNotEmpty()
    @IsString()
    readonly name: string;

    @ApiProperty({type: 'string', example: 'over90006at9@gmail.com'})
    @IsNotEmpty()
    @IsEmail({}, {message: 'Please enter correct email'})
    readonly email: string;

    @ApiProperty({type: 'string', example: 'longer6char'})
    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    readonly password: string;
}