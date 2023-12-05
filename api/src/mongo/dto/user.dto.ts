import { IsEmail, IsOptional, IsString } from "class-validator";

export class UserDto{
    @IsString()
    readonly id: string;

    @IsString()
    readonly name: string;

    @IsOptional()
    @IsString()
    readonly subscriptions: string[];

    @IsEmail()
    readonly email: string;
}