import { Controller, Get } from '@nestjs/common';
import { MongoChannelService } from 'src/mongo/mongo-channel.service';
import { MongoUserService } from 'src/mongo/mongo-user.service';

@Controller('traini')
export class TrainiController {
    constructor(
        private mongoUserService: MongoUserService,
        private mongoChannelService: MongoChannelService,
    ){}

    @Get()
    async traini(){
        const user = await this.mongoUserService.findById('656ba456d616847368ffc143');
        return this.mongoChannelService.findAllForUser(user);
    }
}
