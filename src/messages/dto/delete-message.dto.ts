import { IsString } from "class-validator";

export class DeleteMessagesDto{
    @IsString()
    readonly messageId: string;

    @IsString()
    readonly chatId: string;
}