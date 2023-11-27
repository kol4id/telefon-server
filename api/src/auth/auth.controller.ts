import { Controller, Post, Body, Get, Query, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupUserDto } from './dto/signup.dto';
import { LoginUserDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
    constructor( private authService: AuthService ) {}

    @Post('/signup')
    signupUser(
        @Body() signupData: SignupUserDto
    ): Promise<{token: string}>{
        return this.authService.signupUser(signupData);
    }

    @Get('/login')
    loginUsers(
        @Query() loginData: LoginUserDto
    ): Promise<{token: string}>{
        return this.authService.loginUser(loginData);
    } 
}

