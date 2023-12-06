import { Optional } from "@nestjs/common";
import { IsArray, IsEmpty, IsNotEmpty } from "class-validator";
import { User } from "src/auth/schemas/user.schema";

export class UpdateChannelDto {
    @IsNotEmpty({message: 'channel ID requred to update'})
    readonly id: string

    @Optional()
    readonly title: string;

    @Optional()
    readonly imgUrl: string;

    @Optional()
    readonly description: string;

    @Optional()
    readonly subscribers: number;

    @Optional()
    readonly moderatorsId: string[];

    @Optional()
    readonly lastMessageId: string;
    
    @IsEmpty({message: 'you cannot pass user id'})
    readonly creatorId: User;
}