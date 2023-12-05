import { Controller, Get } from '@nestjs/common';
import { MongoUserService } from 'src/mongo/mongo-user.service';

@Controller('traini')
export class TrainiController {
    constructor(private mongoUserService: MongoUserService ){}

    @Get()
    async traini(){
        this.mongoUserService.findById('656a76704a5e300b8da9409e')
    }
}
