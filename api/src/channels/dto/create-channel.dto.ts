import { IsNotEmpty, IsOptional, IsString, IsArray, ArrayNotEmpty, IsEmpty } from "class-validator";
import { IMessage } from "../utils";
import { User } from "src/auth/schemas/user.schema";

export class CreateChannelDto {
    @IsNotEmpty()
    @IsString()
    readonly title: string;

    @IsNotEmpty()
    @IsString()
    readonly content: string;

    @IsOptional()
    @IsArray()
    readonly messages: IMessage[];

    @IsEmpty({message: 'you cannot pass user id'})
    readonly creatorId: User
}
