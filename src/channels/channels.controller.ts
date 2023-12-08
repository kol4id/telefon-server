import { Body, Controller, Get, Param, Post, Put, Query, Req, UseGuards} from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { Channel } from './schemas/channels.schema';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';

import { Query as IQuery } from 'express-serve-static-core'; 
import { FastifyRequest } from 'fastify';
import { CloudinaryService } from 'src/cloudinary/сloudinary.service';
import HandleMultipart from 'src/utils/fastify-multipart-toBuffer';
import { CookieAccessGuard } from 'src/auth/cookie-access.guard';
import { CookieRefreshGuard } from 'src/auth/cookie-refresh.guard';

@UseGuards(CookieAccessGuard)
@Controller('channels')
export class ChannelsController {
    constructor(
        private readonly channelsService: ChannelsService, 
        private readonly cloudinaryService: CloudinaryService,
    ){}

    @Get('all')
    async getAllChannels(@Query() query: IQuery): Promise<Channel[]>{

        return await this.channelsService.findAll(query);
    }

    @Get(':id')
    async getChannelById(@Param('id') id: string): Promise<Channel>{

        return await this.channelsService.findById(id);
    }

    @Get('multiple')
    async getAllChannelsForUser(@Req() req): Promise<Channel[]>{

        return await this.channelsService.findAllForUser(req.user);
    }

    @Post()
    async createChannel(
        @Body() channel: CreateChannelDto,
        @Req() req,
    ): Promise<Channel>{

        return await this.channelsService.create(channel, req.user);
    }

    @Put('id')
    async updateChannelById(
        @Body() channel: UpdateChannelDto,
        @Req() req,
    ): Promise<Channel>{

        return await this.channelsService.updateById(channel, req.user);
    }
    
    @Put('media')
    async UpdateChannelPhoto(
        @Query('channelId') channelId: string,
        @Req() request: FastifyRequest,
        @Req() req
    ): Promise<Channel>{

        const fileData: Buffer = await HandleMultipart(request);
        const result = await this.cloudinaryService.UploadImageByFile(fileData);        
        return await this.channelsService.updatePhoto(result , req.user, channelId)      
    }
}
