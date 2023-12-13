import { FastifyRequest } from "fastify";
import { Multipart } from '@fastify/multipart';
import { PayloadTooLargeException } from "@nestjs/common";

export const HandleMultipart = async(request: FastifyRequest): Promise<Buffer> =>{
    const multData: Multipart = await request.file();
    try {
        return await multData.toBuffer()
    } catch (error: unknown){
        throw new PayloadTooLargeException('image is too large')
    }
}

export const HandleMultipartArray = async(request: FastifyRequest): Promise<Buffer[]> =>{

    const parts = request.files();
    const fileArray: Buffer[] = [];
    try {
        for await (const part of parts){
            const buffer = await part.toBuffer();
            if (buffer.length){
                fileArray.push(buffer)
            }
        }
    } catch (error: unknown){
        throw new PayloadTooLargeException(error)
    }
    return fileArray;
}