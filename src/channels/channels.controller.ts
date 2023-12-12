import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards} from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { CreateChannelDto } from './dto/create-channel.dto';

import { FastifyRequest } from 'fastify';
import { CloudinaryService } from 'src/cloudinary/сloudinary.service';
import HandleMultipart from 'src/utils/fastify-multipart-toBuffer';
import { CookieAccessGuard } from 'src/auth/cookie-access.guard';
import { ChannelDto } from 'src/mongo/dto/channel.dto';
import { UpdataChannelImgDto, UpdateChannelDto, UpdateChannelModeratorDto, UpdateChannelModeratorsDto } from 'src/mongo/dto/update-channel.dto';
import { IsNotEmpty } from 'class-validator';


@UseGuards(CookieAccessGuard)
@Controller('channels')
export class ChannelsController {
    constructor(
        private readonly channelsService: ChannelsService, 
        private readonly cloudinaryService: CloudinaryService,
    ){}

    @Get('all')
    async GetAllChannelsForUser(@Req() req): Promise<ChannelDto[]>{

        return await this.channelsService.findAllForUser(req.user);
    }

    @Post()
    async CreateChannel(
        @Body() channel: CreateChannelDto,
        @Req() req,
    ): Promise<boolean>{

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
    ): Promise<UpdataChannelImgDto>{

        if (!channelId) {
            throw new BadRequestException('channelId should not be empty');
        }
        const fileData: Buffer = await HandleMultipart(request);
        const url = await this.cloudinaryService.UploadImageByFile(fileData);        
        const dataToUpdate: UpdataChannelImgDto = {id: channelId, imgUrl: url}
        return await this.channelsService.updatePhoto(dataToUpdate , req.user)      
    }
}
