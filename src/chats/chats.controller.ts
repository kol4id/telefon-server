import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';

import { CookieAccessGuard } from 'src/auth/cookie-access.guard';
import { ChatsService } from './chats.service';
import { ChatDto } from './dto/chat.dto';


@UseGuards(CookieAccessGuard)
@Controller('chats')
export class ChatsController {
    constructor(
        private chatService: ChatsService,
    ){}

    @Get(':id')
    async GetChatById(@Param() param: any): Promise<ChatDto>{
        return await this.chatService.get(param.id);
    }

    @Get('channel/:id')
    async GetChatsByChannel(@Param() param: any, @Req() req): Promise<ChatDto>{
        return await this.chatService.getByChannel(param.id, req.user);
    }

    @Get('user')
    async GetChatsByUser(@Req() req): Promise<ChatDto[]>{
        return await this.chatService.getForUser(req.user.id);
    }
}
