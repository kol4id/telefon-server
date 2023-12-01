import { Optional } from "@nestjs/common";
import { IsEmpty } from "class-validator";
import { User } from "src/auth/schemas/user.schema";

export class UpdateChannelDto {
    @Optional()
    readonly title: string;

    @Optional()
    readonly img: Buffer;

    @Optional()
    readonly description: string;

    @Optional()
    readonly subscribers: number
    
    @IsEmpty({message: 'you cannot pass user id'})
    readonly creatorId: User
}