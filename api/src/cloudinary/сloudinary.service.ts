import { Injectable } from '@nestjs/common';
import {UploadApiErrorResponse, UploadApiResponse, v2 as cloudinary} from 'cloudinary';
import { error } from 'console';
import { resolve } from 'path';


@Injectable()
export class CloudinaryService {
    
    async UploadImageByUrl (): Promise<void>{
        cloudinary.uploader.upload("https://avatars.githubusercontent.com/u/86874761?v=4",
        { public_id: "micha" }, 
        function(error, result) {console.log(result); });
    }

    async UploadImageByFile (file: Buffer): Promise<UploadApiResponse | UploadApiErrorResponse>{
        return new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({
                resource_type: 'auto',
            }, (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }).end(file)
        })
    }

    async FindImageById (id: string): Promise<void>{
        console.log(await cloudinary.api.resources_by_asset_ids(id))
    }
}
