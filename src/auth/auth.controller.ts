import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupUserDto } from './dto/auth.dto';
import { LoginUserDto } from './dto/auth.dto';
import { FastifyReply } from 'fastify';
import { Req, Res, UseGuards } from '@nestjs/common/decorators';
import { CookieRefreshGuard } from './cookie-refresh.guard';
import { UserDto } from 'src/user/dto/user.dto';

@Controller('auth')
export class AuthController {
    constructor( private authService: AuthService ) {}

    @Post('/signup')
    async signupUser(
        @Body() signupData: SignupUserDto,
        @Res({ passthrough: true }) response: FastifyReply,
    ): Promise<any>{
    
        return this.authService.signupUser(signupData, response);
    }

    @Get('/login')
    async loginUsers(
        @Query() loginData: LoginUserDto,
        @Res({ passthrough: true }) response: FastifyReply,
    ): Promise<any>{
    
        return await this.authService.loginUser(loginData, response);
    }

    @Get('/logout')
    async logoutUsers(
        @Req() res,
        @Res({ passthrough: true }) response: FastifyReply,
    ): Promise<any>{
        return await this.authService.logoutUser(res.user, response);
    }
    
    @Get('/refresh')
    @UseGuards(CookieRefreshGuard)
    async refreshUsers(
        @Req() res,
        @Res({ passthrough: true }) response: FastifyReply,
    ): Promise<UserDto>{
        return await this.authService.refreshUser(res.user, response);
    }
}

