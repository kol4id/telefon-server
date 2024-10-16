import { Body, Controller, Get, Logger, Put, Query, Req, UseGuards } from '@nestjs/common';
import { CookieAccessGuard } from 'src/auth/cookie-access.guard';
import { UserDto } from 'src/user/dto/user.dto';
import { UserService } from './user.service';
import { FastifyRequest } from 'fastify/types/request';
import { HandleMultipart } from 'src/utils/fastify-multipart-toBuffer';
import { MediaService } from 'src/media/media.service';

@UseGuards(CookieAccessGuard)
@Controller('user')
export class UserController {
    constructor(
        private userService: UserService,
        private mediaService: MediaService
    ){}

    private logger = new Logger(CookieAccessGuard.name);

    @Get()
    async GetUser(
        @Query('userId') userId: string,
        @Req() req
    ): Promise<UserDto>{
        return await this.userService.getUser(userId);
    }

    @Get('self')
    async Self(@Req() req): Promise<UserDto>{
        return req.user;
    }

    @Get('username')
    async isUsernameExist(@Query('username') username: string){
        //NOTE(@kol4id): check for username valid
        //so if username exist userNameValid return false
        //there we need !not 
        return await this.userService.isUsernameExist(username);
    }

    @Put('update')
    async UpdateUser(
        @Body() userData: UserDto
    ): Promise<UserDto>{
        this.logger.debug('userUpdate')
        return await this.userService.update(userData);
    }

    @Put('photo')
    async UpdatePhoto(
        @Req() request: FastifyRequest,
        @Req() req
    ): Promise<UserDto>{
        const file: Buffer = await HandleMultipart(request);
        const url: string = await this.mediaService.create(file);
        return await this.userService.updatePhoto(url, req.user);
    }
}
