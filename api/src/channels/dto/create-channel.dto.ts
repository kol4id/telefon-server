import { Optional } from "@nestjs/common";
import { Prop } from "@nestjs/mongoose";
import { IsNotEmpty, IsOptional, IsString, IsArray, ArrayNotEmpty, IsEmpty } from "class-validator";
import { User } from "src/auth/schemas/user.schema";

export class CreateChannelDto {
    @IsNotEmpty()
    @IsString()
    readonly title: string;

    @Optional()
    readonly imgUrl: string;

    @Optional()
    readonly description: string;

    @Optional()
    readonly subscribers: number;

    @Optional()
    readonly moderatorsId: string[];

    @IsEmpty({message: 'you cannot pass user id'})
    readonly creatorId: User;
}
