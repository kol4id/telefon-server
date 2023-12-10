import { Optional } from "@nestjs/common";
import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class SignupUserDto {
    @IsNotEmpty()
    @IsString()
    readonly name: string;

    @IsNotEmpty()
    @IsEmail({}, {message: 'Please enter correct email'})
    readonly email: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    readonly password: string;
}