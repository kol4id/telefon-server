import { Controller, Post, Body, Get, Query, Param} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupUserDto } from './dto/signup.dto';
import { LoginUserDto } from './dto/login.dto';
import { FastifyReply } from 'fastify';
import { Res } from '@nestjs/common/decorators';

@Controller('auth')
export class AuthController {
    constructor( private authService: AuthService ) {}

    @Post('/signup')
    async signupUser(
        @Body() signupData: SignupUserDto,
        @Res({ passthrough: true }) response: FastifyReply,
    ): Promise<{token: string}>{
    
        return this.authService.signupUser(signupData, response);
    }

    @Get('/login')
    async loginUsers(
        @Query() loginData: LoginUserDto,
        @Res({ passthrough: true }) response: FastifyReply,
    ): Promise<{token: string}>{
    
        return await this.authService.loginUser(loginData, response);
    } 
}

