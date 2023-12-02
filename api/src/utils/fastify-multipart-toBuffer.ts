import { FastifyRequest } from "fastify";
import { Multipart } from '@fastify/multipart';
import { PayloadTooLargeException } from "@nestjs/common";

const HandleMultipart = async(request: FastifyRequest): Promise<Buffer> =>{
    const multData: Multipart = await request.file();
    try {
        return await multData.toBuffer()
    } catch (error: unknown){
        throw new PayloadTooLargeException('image is too large')
    }
}
export default HandleMultipart;