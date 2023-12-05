import { Controller, Post, Body, Get, Query, Param} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupUserDto } from './dto/signup.dto';
import { LoginUserDto } from './dto/login.dto';
import { FastifyReply } from 'fastify';
import { Req, Res, UseGuards } from '@nestjs/common/decorators';
import { CookieRefreshGuard } from './cookie-refresh.guard';

@Controller('auth')
export class AuthController {
    constructor( private authService: AuthService ) {}

    @Post('/signup')
    async signupUser(
        @Body() signupData: SignupUserDto,
        @Res({ passthrough: true }) response: FastifyReply,
    ): Promise<void>{
    
        return this.authService.signupUser(signupData, response);
    }

    @Get('/login')
    async loginUsers(
        @Query() loginData: LoginUserDto,
        @Res({ passthrough: true }) response: FastifyReply,
    ): Promise<void>{
    
        return await this.authService.loginUser(loginData, response);
    }
    
    @Get('/refresh')
    @UseGuards(CookieRefreshGuard)
    async refreshUsers(
        @Req() res,
        @Res({ passthrough: true }) response: FastifyReply,
    ): Promise<void>{
 
        return await this.authService.refreshUser(res.user, response);
    }
}

