    import { IsArray, IsBoolean, IsDate, IsNumber, IsString } from "class-validator";

    export class ChatDto{
        @IsString()
        readonly id?: string;

        @IsString()
        readonly owner?: string[];

        @IsNumber()
        readonly totalMessages?: number;

        @IsDate()
        readonly updatedAt?: Date;

        @IsArray()
        @IsString()
        readonly participants?: string[];

        @IsBoolean()
        readonly isSubChat?: boolean;

        @IsString()
        readonly lastMessage?: string;
    }
