import { BadRequestException, Body, Controller, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { MessageDto } from './dto/message.dto';
import { GetMessagesDto } from './dto/get-messages.dto';
import { MessagesService } from './messages.service';
import { CookieAccessGuard } from 'src/auth/cookie-access.guard';
import { CreateMessageDto } from './dto/create-message.dto';
import { FastifyRequest } from 'fastify';
import {HandleMultipartArray} from 'src/utils/fastify-multipart-toBuffer';
import { CloudinaryService } from 'src/cloudinary/сloudinary.service';
import { UpdateMediaDto, UpdateMessageContentDto } from 'src/mongo/dto/update-message.dto';

@UseGuards(CookieAccessGuard)
@Controller('messages')
export class MessagesController {
    constructor(
        private messageService: MessagesService,
        private cloudinaryService: CloudinaryService
    ){}

    @Get()
    async GetMessagesForChannel(
        @Query() request: GetMessagesDto,
    ):Promise<MessageDto[]>{

        return await this.messageService.getMessages(request);
    }

    //A router with a specific, we accept part of the message without media
    //if there is no media in the message initially, use only this router
    //in another case, additionally use @Put('create').
    //When transmitting a message with a media, it is mandatory to set the hasMedia = true flag
    //passing such a message, we get the messageId in the response, which we pass to @Put('create')
    //and attaching all the files that came with the message
    @Post('create')
    async CreateMessage(
        @Body() message: CreateMessageDto,
        @Req() req
    ): Promise<MessageDto | string>{
        
        return await this.messageService.create(message, req.user);
    }

    @Put('create')
    async Media(
        @Query('messageId') messageId: string,
        @Req() request: FastifyRequest,
        @Req() req
    ): Promise<MessageDto | void>{
    
        if (!messageId) {
            throw new BadRequestException('messageId should not be empty');
        }
        const files: Buffer[] = await HandleMultipartArray(request);
        const urls: string[] = await this.cloudinaryService.UploadMultiple(files);
        return await this.messageService.createMedia(urls, messageId, req.user);
    }

    @Put('update')
    async MediaUpdate(
        @Body() message: UpdateMessageContentDto,
        @Req() req
    ): Promise<UpdateMediaDto>{

        return await this.messageService.update(message, req.user)
    }

}
