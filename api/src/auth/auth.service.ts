import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User} from './schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt';
import { SignupUserDto } from './dto/signup.dto';
import { LoginUserDto } from './dto/login.dto';
import { FastifyReply } from 'fastify';

@Injectable()
export class AuthService {
    constructor(@InjectModel(User.name) 
        private userModel: Model<User>,
        private jwtService: JwtService,
    ){}

    async getAccessTokenAsync(id: string): Promise<string>{
        return await this.jwtService.signAsync(
            {id},
            {
                secret: process.env.JWT_SECRET,
                expiresIn: process.env.JWT_EXPIRED,
            }
        )
    }

    async getRefreshTokenAsync(id: string): Promise<string>{
        return await this.jwtService.signAsync(
            {id},
            {
                secret: process.env.JWT_REFRESH_SECRET,
                expiresIn: process.env.JWT_REFRESH_EXPIRED,
            }
        )
    }

    async signupUser(signupData: SignupUserDto, response: FastifyReply): Promise<{token: string}>{
        const {name, email, subscriptions, password} = signupData;

        if (await this.userModel.findOne({email})){
            throw new UnauthorizedException("user already exist");
        }
        
        const salt = bcrypt.genSaltSync(Number(process.env.SALT_ROUNDS));
        const hashedPassword = await bcrypt.hash(password, salt);
 
        const user = await this.userModel.create({
            name,
            email,
            subscriptions,
            password: hashedPassword
        })

        const token = this.jwtService.sign({ id: user._id})

        return {token}
    }

    async loginUser(loginData: LoginUserDto, response: FastifyReply): Promise<{token: string}>{
        const {email, password} = loginData;
        
        const user = await this.userModel.findOne({email})
        if (!user){
            throw new UnauthorizedException("invalid email or password");
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password)
        if (!isPasswordMatch){
            throw new UnauthorizedException("invalid email or password");
        }

        const token = this.jwtService.sign({ id: user._id})
        response.setCookie('accessToken', token, {
            httpOnly: true,
            signed: true,
        })
        return {token}
    }

    // async loginUser(loginData: LoginUserDto): Promise<{token: string}>{
    //     const {email, password} = loginData;
        
    //     const user = await this.userModel.findOne({email})
        
    //     if (!user){
    //         throw new UnauthorizedException("invalid email or password");
    //     }
        
    //     const isPasswordMatch = await bcrypt.compare(password, user.password)
    //     if (!isPasswordMatch){
    //         throw new UnauthorizedException("invalid email or password");
    //     }
            
    //     const token = this.jwtService.sign({ id: user._id})
    //     return {token}
    // }

}
