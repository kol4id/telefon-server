import { Injectable } from '@nestjs/common';
import * as sharp from 'sharp'

@Injectable()
export class CompressService {
    async CompressImageFromBuffer(img: Buffer): Promise<Buffer>{
        // let compressedImage: Buffer;
        console.log(img)
        const compressedImage: Buffer = await sharp(img).resize(1280,720).jpeg({quality:72}).toBuffer()
        console.log(compressedImage)
        return compressedImage;
    }
}
