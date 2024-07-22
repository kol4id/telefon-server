import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { CloudinaryService } from 'src/cloudinary/сloudinary.service';
import { CompressService } from 'src/compress/compress.service';

@Injectable()
export class MediaService {
    constructor(
        private mediaRepository: CloudinaryService,
        private compress: CompressService
    ){}

    async find(){

    }

    async create(img: Buffer): Promise<string>{
        const hash = createHash('sha256').update(img).digest('hex').toString();
        const media = await this.mediaRepository.findMedia(hash);
        if (media) return media.url
        
        const compressed = await this.compress.CompressImageFromBuffer(img)
        return this.mediaRepository.UploadImageByFile(compressed, hash);
    }

}
