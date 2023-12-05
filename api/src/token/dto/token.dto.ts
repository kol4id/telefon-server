import { IsString } from "class-validator";

export class TokenDto{
    @IsString()
    readonly id: string;
}