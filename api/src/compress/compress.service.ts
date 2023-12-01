import { Injectable } from '@nestjs/common';
import * as sharp from 'sharp'

@Injectable()
export class CompressService {
    async CompressImageFromBuffer(img: Buffer): Promise<Buffer>{
        const compressedImage: Buffer = await sharp(img).resize(1280,720).webp({quality:70}).toBuffer()
        return compressedImage;
    }
}
