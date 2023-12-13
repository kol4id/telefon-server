import { Injectable } from '@nestjs/common';
import * as sharp from 'sharp'

@Injectable()
export class CompressService {
    async CompressImageFromBuffer(img: Buffer): Promise<Buffer>{
        const resizeRate = 1.618;
        const metadata = await sharp(img).metadata()
        metadata.height = Math.floor(metadata.height/resizeRate);
        metadata.width = Math.floor(metadata.width/resizeRate);
        const compressedImage: Buffer = await sharp(img).resize(metadata.width, metadata.height).webp({quality:70}).toBuffer()
        return compressedImage;
    }
}
