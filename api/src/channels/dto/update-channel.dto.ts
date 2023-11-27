import { IsEmpty } from "class-validator";
import { User } from "src/auth/schemas/user.schema";
import { IMessage } from "../utils";

export class UpdateChannelDto {
    readonly title: string;
    readonly content: string;
    readonly messages: IMessage[];
    
    @IsEmpty({message: 'you cannot pass user id'})
    readonly creatorId: User
}