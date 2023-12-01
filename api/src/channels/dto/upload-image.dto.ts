import { IsString } from "class-validator";
import { IsBuffer } from "../decorators/is-buffer.decorator";

export class UploadImageDto {
    @IsString({message: 'filename is not a string value'})
    readonly imgName: string;

    @IsBuffer({message: 'file data is corrupted'})
    readonly buffer: Buffer;
}