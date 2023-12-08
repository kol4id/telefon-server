import { IsNotEmpty, IsString, IsEmpty } from "class-validator";
import { User } from "src/auth/schemas/user.schema";

export class CreateChannelDto {
    @IsNotEmpty()
    @IsString()
    readonly title: string;

    @IsEmpty({message: 'you cannot pass user id'})
    readonly creatorId: User;
}
