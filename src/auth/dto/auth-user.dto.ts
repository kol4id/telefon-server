import { IsEmail, IsString } from "class-validator";

export class AuthUserDto{
    @IsString()
    readonly id: string;

    @IsString()
    readonly name: string;

    @IsEmail()
    readonly email: string;

    @IsString()
    readonly password: string;
}