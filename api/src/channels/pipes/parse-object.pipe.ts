import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import { UpdateChannelDto } from "../dto/update-channel.dto";

@Injectable()
export class ParseObjectPipe implements PipeTransform<any>{
    async transform(value: any, metadata: ArgumentMetadata): Promise<UpdateChannelDto>{
        try {
            const parsedObject = JSON.parse(decodeURIComponent(value));
            const objectInstance = plainToClass(metadata.metatype, parsedObject);
            const errors = await validate(objectInstance);

            if(errors.length > 0){
                throw new BadRequestException('query parameter is incorect');
            }

            return objectInstance;
        } catch (error: unknown){
            throw new BadRequestException('Invalid JSON format');
        }
    }
}