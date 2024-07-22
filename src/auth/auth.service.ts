import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { SignupUserDto } from './dto/auth.dto';
import { LoginUserDto } from './dto/auth.dto';
import { FastifyReply } from 'fastify';
import { UserDto } from 'src/user/dto/user.dto';
import { UserRepository } from 'src/mongo/mongo-user.service';
import { TokenService } from 'src/token/token.service';
import { CookieSerializeOptions } from '@fastify/cookie';
import { AuthUserDto } from './dto/auth.dto';
import { ChannelRepository } from 'src/mongo/mongo-channel.service';
;

@Injectable()
export class AuthService {
    constructor(
        private userRepository: UserRepository,
        private channelRepository: ChannelRepository,
        private tokenService: TokenService,
    ){}
    private readonly logger = new Logger(AuthService.name);

    async signupUser(signupData: SignupUserDto, response: FastifyReply): Promise<UserDto>{
        this.logger.debug('signupUser')
        if (await this.userRepository.isExistByEmail(signupData.email)){
            throw new UnauthorizedException("user already exist");
        }
        
        const salt: Promise<string> = bcrypt.genSalt(Number(process.env.SALT_ROUNDS));
        const hashedPassword: string = await bcrypt.hash(signupData.password, await salt);
        
        const newUser: SignupUserDto = {...signupData, password: hashedPassword};
        const user: UserDto = await this.userRepository.create(newUser);

        //NOTE(@kol4id): creating new channel for new user
        //so user and channel logic separeted
        this.channelRepository.createEmpty(user.id);

        const tokens = await this.tokenService.GetTokensAsync(String(user.id))

        this.setCookie(response, tokens);

        return user;
    }

    async loginUser(loginData: LoginUserDto, response: FastifyReply): Promise<UserDto>{
        this.logger.debug('loginUser')
        const user: AuthUserDto = await this.userRepository.findByEmailAuth(loginData.email)
        const isPasswordMatch = await bcrypt.compare(loginData.password, user.password)
        if (!isPasswordMatch){
            throw new UnauthorizedException("invalid email or password");
        }

        const tokens = await this.tokenService.GetTokensAsync(String(user.id))
        this.setCookie(response, tokens);

        delete (user.password);
        return user;
    }

    async refreshUser(userData: UserDto, response: FastifyReply): Promise<UserDto>{    
        this.logger.debug('refreshUser')    
        const tokens = await this.tokenService.GetTokensAsync(userData.id)
        
        this.setCookie(response, tokens);

        return userData;
    }

    private setCookie(response: FastifyReply, tokens: {access: string, refresh: string}){
        response.setCookie('accessToken', tokens.access, {
            ...this.cookieOptions,
            expires: new Date(Date.now() + 3600000 * 24 * 1)
        })
        response.setCookie('refreshToken', tokens.refresh, {
            ...this.cookieOptions,
            expires: new Date(Date.now() + 3600000 * 24 * 7)
        })
    }

    private cookieOptions: CookieSerializeOptions = {
        sameSite: 'none',
        httpOnly: true,
        path: '/',
        signed: true,
        secure: true,
    }
}
