import { Controller, Get, ParseIntPipe, Query, Req, UseGuards } from '@nestjs/common';
import { MessageDto } from './dto/message.dto';
import { GetMessagesDto } from './dto/get-messages.dto';
import { MessagesService } from './messages.service';
import { CookieAccessGuard } from 'src/auth/cookie-access.guard';
import { UnreadMessagesDto } from './dto/message-utls.dto';
// import { DeleteMessagesDto } from './dto/delete-message.dto';

@UseGuards(CookieAccessGuard)
@Controller('messages')
export class MessagesController {
    constructor(
        private messageService: MessagesService,
    ){}

    @Get() 
    async GetMessagesForChannel(@Query() request: GetMessagesDto):Promise<MessageDto[]>{
        return await this.messageService.getMessages(request);
    }

    @Get('lastreads')
    async GetLastReadsMessages(@Query('limit', ParseIntPipe) limit: number, @Req() req): Promise<MessageDto[][]>{
        return await this.messageService.getLastReadMessages(req.user, limit);
    }

    @Get('last') 
    async GetLastMessagesForUser(
        @Req() req
    ):Promise<MessageDto[][]>{
        return await this.messageService.getLastMessages(req.user);
    }

    @Get('unreadCount')
    async getUnreadMessagesCount(
        @Req() req,
    ): Promise<UnreadMessagesDto[]>{
        return await this.messageService.getUnreadMessagesCount(req.user);
    }

    // @Delete('delete')
    // async DeleteMessage(
    //     @Query('messageId') messageId: string,
    //     @Query('channelId') chatId: string,
    //     @Req() req
    // ): Promise<void>{

    //     const messageData = {messageId, chatId};
    //     await this.messageService.delete(messageData, req.user);
    // }

}
