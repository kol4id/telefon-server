import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { CompressService } from 'src/compress/compress.service';


@Injectable()
export class CloudinaryService {
    constructor(private readonly compressService: CompressService){}
    
    async UploadImageByUrl (): Promise<void>{
        cloudinary.uploader.upload("https://avatars.githubusercontent.com/u/86874761?v=4",
        { resource_type: 'auto' }, 
        function(error, result) { });
    }

    //NOTE: compressing the image and changing format to .webp via compressService
    //Then sending it by a stream to cloudinary, handling errors
    //geting UploadApiReturn only if image successful sended
    async UploadImageByFile (file: Buffer, hash: string): Promise<string>{
        // const compresedImg = await this.compressService.CompressImageFromBuffer(file);
        return new Promise((resolve) => {
            cloudinary.uploader.upload_stream({
                resource_type: 'auto',
                public_id: hash
            }, (error, result) => {
                if (error){
                    throw new ServiceUnavailableException('There some error while uploading your image');
                }
                resolve(result.secure_url);
            }).end(file)
        })
    }

    async UploadMultiple(files: Buffer[], hashes: string[]): Promise<string[]>{
        const urlsArr: string[] = [];
        await Promise.all(
            files.map(async(file, index)=>{
                const url = await this.UploadImageByFile(file, hashes[index]);
                urlsArr.push(url);
        }));
        return urlsArr
    }

    async FindImageById (id: string): Promise<any>{
        return await cloudinary.api.resources_by_asset_ids(id)
    }

    async findMedia(hash: string): Promise<any>{
        let result = ''
        try{
            result = await cloudinary.api.resource(hash);
        } finally {
            return result
        }
    }


}
