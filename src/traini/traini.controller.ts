import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CreateChannelDto } from 'src/channels/dto/create-channel.dto';
import { ChannelRepository } from 'src/mongo/mongo-channel.service';
import { UserRepository } from 'src/mongo/mongo-user.service';

@Controller('traini')
export class TrainiController {
    constructor(
        private mongoUserService: UserRepository,
        private mongoChannelService: ChannelRepository,
    ){}

    @Get()
    async traini(){
        const user = await this.mongoUserService.findById('656ba456d616847368ffc143');
        return this.mongoChannelService.findById('656a7721a53ee5472936cb47');
    }

    @Post('create')
    async create(@Body() channel: CreateChannelDto, @Query('id') id:string){
        return await this.mongoChannelService.create(channel, id)
    }
}
