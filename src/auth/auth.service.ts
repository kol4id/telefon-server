import { Injectable, UnauthorizedException } from '@nestjs/common';;
import * as bcrypt from 'bcrypt'
import { SignupUserDto } from './dto/signup.dto';
import { LoginUserDto } from './dto/login.dto';
import { FastifyReply } from 'fastify';
import { UserDto } from 'src/mongo/dto/user.dto';
import { UserRepository } from 'src/mongo/mongo-user.service';
import { TokenService } from 'src/token/token.service';

@Injectable()
export class AuthService {
    constructor(
        private mongoUserService: UserRepository,
        private tokenService: TokenService,
    ){}

    async signupUser(signupData: SignupUserDto, response: FastifyReply): Promise<any>{
        console.log(signupData)
        const {email, password} = signupData;

        if (await this.mongoUserService.isExistByEmail(email)){
            throw new UnauthorizedException("user already exist");
        }
        
        const salt = bcrypt.genSaltSync(Number(process.env.SALT_ROUNDS));
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const newUser: SignupUserDto = {...signupData, password: hashedPassword};
        const user = await this.mongoUserService.create(newUser)

        const tokens = await this.tokenService.GetTokensAsync(String(user.id))

        response.setCookie('accessToken', tokens.access, {
            sameSite: 'none',
            httpOnly: true,
            path: '/',
            signed: true,
            secure: true,
            expires: new Date(Date.now() + 3600000 * 24 * 1)
        })

        response.setCookie('refreshToken', tokens.refresh, {
            sameSite: 'none',
            httpOnly: true,
            path: '/',
            signed: true,
            secure: true,
            expires: new Date(Date.now() + 3600000 * 24 * 14)
        })

        return user.id;
    }

    async loginUser(loginData: LoginUserDto, response: FastifyReply): Promise<any>{
        console.log(loginData)
        const {email, password} = loginData;
        
        const user = await this.mongoUserService.findByEmailAuth(email)

        const isPasswordMatch = await bcrypt.compare(password, user.password)
        if (!isPasswordMatch){
            throw new UnauthorizedException("invalid email or password");
        }

        const tokens = await this.tokenService.GetTokensAsync(String(user.id))
        response.setCookie('accessToken', tokens.access, {
            sameSite: 'none',
            httpOnly: true,
            path: '/',
            signed: true,
            secure: true,
            expires: new Date(Date.now() + 3600000 * 24 * 1)
        })

        response.setCookie('refreshToken', tokens.refresh, {
            sameSite: 'none',
            httpOnly: true,
            path: '/',
            signed: true,
            secure: true,
            expires: new Date(Date.now() + 3600000 * 24 * 14)
        })

        return user.id;
    }

    async refreshUser(userData: UserDto, response: FastifyReply): Promise<any>{        
        console.log(userData)
        const tokens = await this.tokenService.GetTokensAsync(userData.id)
        
        response.setCookie('accessToken', tokens.access, {
            sameSite: 'none',
            httpOnly: true,
            path: '/',
            signed: true,
            secure: true,
            expires: new Date(Date.now() + 3600000 * 24 * 1)
        })

        response.setCookie('refreshToken', tokens.refresh, {
            sameSite: 'none',
            httpOnly: true,
            path: '/',
            signed: true,
            secure: true,
            expires: new Date(Date.now() + 3600000 * 24 * 14)
        })
        
        return userData.id;
    }

}
