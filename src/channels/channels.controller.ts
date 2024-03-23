import { BadRequestException, Body, Controller, Get, Post, Put, Query, Req, UseGuards} from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { CreateChannelDto } from './dto/create-channel.dto';

import { FastifyRequest } from 'fastify';
import { CloudinaryService } from 'src/cloudinary/сloudinary.service';
import {HandleMultipart} from 'src/utils/fastify-multipart-toBuffer';
import { CookieAccessGuard } from 'src/auth/cookie-access.guard';
import { ChannelDto } from 'src/channels/dto/channel.dto';
import { UpdateChannelImgDto, UpdateChannelDto, UpdateChannelModeratorDto, UpdateChannelModeratorsDto } from 'src/mongo/dto/update-channel.dto';


@UseGuards(CookieAccessGuard)
@Controller('channels')
export class ChannelsController {
    constructor(
        private readonly channelsService: ChannelsService, 
        private readonly cloudinaryService: CloudinaryService,
    ){}

    @Get('all')
    async GetAllChannelsForUser(@Req() req): Promise<ChannelDto[]>{

        const channels = await this.channelsService.findAllForUser(req.user);
        return channels
    }

    @Post()
    async CreateChannel(
        @Body() channel: CreateChannelDto,
        @Req() req,
    ): Promise<ChannelDto>{

        return await this.channelsService.create(channel, req.user);
    }

    @Put('general')
    async UpdateGeneral(
        @Body() channel: UpdateChannelDto,
        @Req() req,
    ): Promise<UpdateChannelDto>{

        return await this.channelsService.updateGeneral(channel, req.user);        
    }


    @Put('moderator/add')
    async AddModerator(
        @Body() channel: UpdateChannelModeratorDto,
        @Req() req,
    ): Promise<UpdateChannelModeratorsDto>{

        return await this.channelsService.addModerator(channel, req.user);
    }

    @Put('moderator/remove')
    async RemoveModerator(
        @Body() channel: UpdateChannelModeratorDto,
        @Req() req,
    ): Promise<UpdateChannelModeratorsDto>{

        return await this.channelsService.removeModerator(channel, req.user);
    }
    
    @Put('media')
    async UpdateChannelPhoto(
        @Query('channelId') channelId: string,
        @Req() request: FastifyRequest,
        @Req() req
    ): Promise<UpdateChannelImgDto>{

        if (!channelId) {
            throw new BadRequestException('channelId should not be empty');
        }
        const fileData: Buffer = await HandleMultipart(request);
        return await this.channelsService.updatePhoto(channelId , req.user, fileData)      
    }

    @Put('subscribe')
    async Subscribe(
        @Query('channelId') channelId: string,
        @Req() req
    ){
        if (!channelId) {
            throw new BadRequestException('channelId should not be empty');
        }

        await this.channelsService.subscribe(channelId, req.user);
    }
}
