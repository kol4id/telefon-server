import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User} from './schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt';
import { SignupUserDto } from './dto/signup.dto';
import { LoginUserDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(@InjectModel(User.name) 
        private userModel: Model<User>,
        private jwtService: JwtService,
    ){}

    async signupUser(signupData: SignupUserDto): Promise<{token: string}>{
        const {name, email, password} = signupData;
        const salt = bcrypt.genSaltSync(Number(process.env.SALT_ROUNDS));
        const hashedPassword = await bcrypt.hash(password, salt);

        if (await this.userModel.findOne({email})){
            throw new UnauthorizedException("user already exist");
        }

        const user = await this.userModel.create({
            name,
            email,
            password: hashedPassword
        })

        const token = this.jwtService.sign({ id: user._id})

        return {token}
    }

    async loginUser(loginData: LoginUserDto): Promise<{token: string}>{
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
