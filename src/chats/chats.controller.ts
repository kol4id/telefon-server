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
        return await this.chatService.getForUser(req.user);
    }
    // @Get()
    // async GetAllChatsForUser(@Req() req): Promise<ChannelDto[]>{
    //     const channels = await this.chatService.findAllForUser(req.user);
    //     return channels
    // }

    // @Get(':id')
    // async GetChatById(@Param() params: any): Promise<ChannelDto>{
    //     return await this.channelsService.get(params.id);
    // }

    // @Get('search')
    // async GetChatsByString(@Query('subString') subString: string, @Req() req){
    //     return await this.channelsService.searchMany(subString, req.user)
    // }

    // @Post()
    // async CreateChat(
    //     @Body() channel: CreateChannelDto,
    //     @Req() req,
    // ): Promise<ChannelDto>{

    //     return await this.channelsService.create(channel, req.user);
    // }

    // // ?????????????
    // @Put('general')
    // async UpdateGeneral(
    //     @Body() channel: UpdateChannelDto,
    //     @Req() req,
    // ): Promise<UpdateChannelDto>{

    //     return await this.channelsService.updateGeneral(channel, req.user);        
    // }


    // @Put('moderator/add')
    // async ChatAddModerator(
    //     @Body() channel: UpdateChannelModeratorDto,
    //     @Req() req,
    // ): Promise<UpdateChannelModeratorsDto>{

    //     return await this.channelsService.addModerator(channel, req.user);
    // }

    // @Put('moderator/remove')
    // async ChatDelModerator(
    //     @Body() channel: UpdateChannelModeratorDto,
    //     @Req() req,
    // ): Promise<UpdateChannelModeratorsDto>{

    //     return await this.channelsService.removeModerator(channel, req.user);
    // }
    
    // @Put('media')
    // async UpdateChatPhoto(
    //     @Query('channelId') channelId: string,
    //     @Req() request: FastifyRequest,
    //     @Req() req
    // ): Promise<UpdateChannelImgDto>{

    //     if (!channelId) {
    //         throw new BadRequestException('channelId should not be empty');
    //     }
    //     const fileData: Buffer = await HandleMultipart(request);
    //     return await this.channelsService.updatePhoto(channelId , req.user, fileData)      
    // }

    // @Put('subscribe')
    // async ChatAddSubscribe(
    //     @Body('channelId') channelId: string,
    //     @Req() req
    // ): Promise<ChannelDto[]>{
    //     console.log('asdasdassdsdsadsadsd')
    //     if (!channelId) {
    //         throw new BadRequestException('channelId should not be empty');
    //     }

    //     return await this.channelsService.subscribe(channelId, req.user);
    // }
}
