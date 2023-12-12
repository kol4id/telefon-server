import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { MessageDto } from './dto/message.dto';
import { GetMessagesDto } from './dto/get-messages.dto';
import { MessagesService } from './messages.service';
import { CookieAccessGuard } from 'src/auth/cookie-access.guard';
import { CreateMessageDto } from './dto/create-message.dto';

@UseGuards(CookieAccessGuard)
@Controller('messages')
export class MessagesController {
    constructor(private messageService: MessagesService){}

    @Get()
    async GetMessagesForChannel(
        @Query() request: GetMessagesDto,
    ):Promise<MessageDto[]>{

        return await this.messageService.getMessages(request);
    }

    @Post('create')
    async CreateMessage(
        @Body() message: CreateMessageDto,
        @Req() req
    ): Promise<MessageDto | string>{
        
        return await this.messageService.create(message, req.user);
    }
}
