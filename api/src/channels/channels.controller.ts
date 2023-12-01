import { Body, Controller, Get, NotFoundException, Param, PayloadTooLargeException, Post, Put, Query, Req, Request, UseGuards} from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { Channel } from './schemas/channels.schema';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';

import { Query as IQuery } from 'express-serve-static-core'; 
import { AuthGuard } from '@nestjs/passport';
import { FastifyRequest } from 'fastify';
import { CloudinaryService } from 'src/cloudinary/сloudinary.service';
import fastifyMultipart from '@fastify/multipart';
import { buffer } from 'stream/consumers';
import { CompressService } from 'src/compress/compress.service';

@Controller('channels')
export class ChannelsController {
    constructor(
        private readonly channelsService: ChannelsService, 
        private readonly cloudinaryService: CloudinaryService,
        private readonly compressService: CompressService,
    ){}

    @Get()
    defaultResponce(){
        this.cloudinaryService.FindImageById('579f06216c05433b08d7ce2031995ee1');
        return 'hi there!';
    }

    @Post('media')
    async getChannelWithMedia(@Request() request: FastifyRequest): Promise<string>{
        const data = await request.file();
        let img: Buffer;
        
        try {
            const buffer = await data.toBuffer();
            img = await this.compressService.CompressImageFromBuffer(buffer);
        } catch (error: unknown){
            throw new PayloadTooLargeException('file is too large')
        }
        
        const result = await this.cloudinaryService.UploadImageByFile(img);
        return result.secure_url;
    }

    @Get('all')
    async getAllChannels(@Query() query: IQuery): Promise<Channel[]>{
        return this.channelsService.findAll(query);
    }

    @Get(':id')
    async getChannelById(
        @Param('id') id: string,
    ): Promise<Channel>{
        let channel: Channel;
        try{
            channel = await this.channelsService.findById(id);
        } catch(error: unknown){
            throw new NotFoundException('there is no such channel');
        }

        return channel
    }

    @Put(':id')
    async updateChannelById(
        @Param('id') id: string,
        @Body() channel: UpdateChannelDto,
    ): Promise<Channel>{
        console.log(channel)
        return this.channelsService.updateById(id, channel);
    }
    
    @Post()
    @UseGuards(AuthGuard())
    async createChannel(
        @Body() channel: CreateChannelDto,
        @Req() req,
    ): Promise<Channel>{
        console.log(req.user);  
        return this.channelsService.create(channel, req.user);
    }
}
