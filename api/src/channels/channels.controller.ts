import { Body, Controller, Get, NotFoundException, Param, Post, Put, Query, Req, UseGuards} from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { Channel } from './schemas/channels.schema';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';

import { Query as IQuery } from 'express-serve-static-core'; 
import { AuthGuard } from '@nestjs/passport';
import { FastifyRequest } from 'fastify';

@Controller('channels')
export class ChannelsController {
    constructor(private readonly channelsService: ChannelsService){}
    @Get()
    defaultResponce(){
        return 'hi there!';
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
