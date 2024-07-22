import { BadRequestException, Body, Controller, Delete, Get, ParseIntPipe, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { MessageDto } from './dto/message.dto';
import { GetMessagesDto } from './dto/get-messages.dto';
import { MessagesService } from './messages.service';
import { CookieAccessGuard } from 'src/auth/cookie-access.guard';
import { CreateMessageDto } from './dto/create-message.dto';
import { FastifyRequest } from 'fastify';
import { HandleMultipartArray } from 'src/utils/fastify-multipart-toBuffer';
import { CloudinaryService } from 'src/cloudinary/сloudinary.service';
import { MediaService } from 'src/media/media.service';
// import { DeleteMessagesDto } from './dto/delete-message.dto';

@UseGuards(CookieAccessGuard)
@Controller('messages')
export class MessagesController {
    constructor(
        private messageService: MessagesService,
        private mediaService: MediaService
    ){}

    @Get() 
    async GetMessagesForChannel(
        @Query() request: GetMessagesDto,
    ):Promise<MessageDto[]>{
        return await this.messageService.getMessages(request);
    }

    @Get('lastreads')
    async GetLastReadsMessages(
        @Query('limit', ParseIntPipe) limit: number,
        @Req() req, 
    ): Promise<MessageDto[][]>{
        return await this.messageService.getLastReadMessages(req.user, limit);
    }

    @Get('last') 
    async GetLastMessagesForUser(
        @Req() req
    ):Promise<MessageDto[][]>{
        return await this.messageService.getLastMessages(req.user);
    }

    // @Get('last/one') 
    // async GetOneLastMessagesForUser(
    //     @Req() req
    // ):Promise<MessageDto[][]>{
    //     console.log('messages/all')
    //     return await this.messageService.getLastMessages(req.user);
    // }
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
        // const urls: string[] = await this.mediaService.UploadMultiple(files);
        // return await this.messageService.createMedia(urls, messageId, req.user);
    }

    

    // @Put('update')
    // async UpdateMessage(
    //     @Body() message: 
    // )

    // @Put('update')
    // async MediaUpdate(
    //     @Body() message: UpdateMessageContentDto,
    //     @Req() req
    // ): Promise<UpdateMediaDto>{

    //     return await this.messageService.update(message, req.user)
    // }

    @Delete('delete')
    async DeleteMessage(
        @Query('messageId') messageId: string,
        @Query('channelId') channelId: string,
        @Req() req
    ): Promise<void>{

        const messageData = {messageId, channelId};
        await this.messageService.delete(messageData, req.user);
    }

}
