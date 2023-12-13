import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import {UploadApiErrorResponse, UploadApiResponse, v2 as cloudinary} from 'cloudinary';
import { error } from 'console';
import { resolve } from 'path';
import { CompressService } from 'src/compress/compress.service';


@Injectable()
export class CloudinaryService {
    constructor(private readonly compressService: CompressService){}
    
    async UploadImageByUrl (): Promise<void>{
        cloudinary.uploader.upload("https://avatars.githubusercontent.com/u/86874761?v=4",
        { resource_type: 'auto' }, 
        function(error, result) {console.log(result); });
    }

    //NOTE: compressing the image and changing format to .webp via compressService
    //Then sending it by a stream to cloudinary, handling errors
    //geting UploadApiReturn only if image successful sended
    async UploadImageByFile (file: Buffer): Promise<string>{
        const compresedImg = await this.compressService.CompressImageFromBuffer(file);
        return new Promise((resolve) => {
            cloudinary.uploader.upload_stream({
                resource_type: 'auto'
            }, (error, result) => {
                if (error){
                    throw new ServiceUnavailableException('There some error while uploading your image');
                }
                resolve(result.secure_url);
            }).end(compresedImg)
        })
    }

    async UploadMultiple(files: Buffer[]): Promise<string[]>{
        const urlsArr: string[] = [];
        await Promise.all(
            files.map(async(file)=>{
                const url = await this.UploadImageByFile(file);
                urlsArr.push(url);
        }));
        return urlsArr
    }

    async FindImageById (id: string): Promise<void>{
        console.log(await cloudinary.api.resources_by_asset_ids(id))
    }
}
