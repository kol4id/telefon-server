import { Injectable, NotFoundException, ServiceUnavailableException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "./shemas/user.schema";
import { Model } from "mongoose";
import { UserDto } from "./dto/user.dto";
import { LoginUserDto } from "src/auth/dto/login.dto";
import { SignupUserDto } from "src/auth/dto/signup.dto";
import { AuthUserDto } from "src/auth/dto/auth-user.dto";



@Injectable()
export class MongoUserService {
    constructor(@InjectModel(User.name) private userModel: Model<User>){}

    async findById(id: string): Promise<UserDto>{
        const user = await this.userModel.findById(id)
        if(!user){
            throw new NotFoundException("There is no such user");
        }
        const userData: UserDto = {
            id: String(user._id),
            name: user.name, 
            subscriptions: user.subscriptions, 
            email: user.email
        }

        return userData;
    }

    async findByIdAuth(id: string): Promise<LoginUserDto>{
        const user = await this.userModel.findById(id)
        if(!user){
            throw new NotFoundException("There is no such user");
        }
        const userData: LoginUserDto = {
            email: user.email,
            password: user.password,
        }

        return userData;
    }

    async findByEmail(email: string): Promise<UserDto>{
        const user =  await this.userModel.findOne({email})
        if(!user){
            throw new NotFoundException("There is no such user");
        }
        const userData: UserDto = {
            id: String(user._id),
            name: user.name, 
            subscriptions: user.subscriptions, 
            email: user.email
        }

        return userData;
    }

    async findByEmailAuth(email: string): Promise<AuthUserDto>{
        const user =  await this.userModel.findOne({email})
        if(!user){
            throw new NotFoundException("Invalid email");
        }
        const userData: AuthUserDto = {
            id: String(user._id),
            name: user.name, 
            password: user.password, 
            email: user.email
        }

        return userData;
    }

    async isExistById(id: string): Promise<boolean>{
        const user = await this.userModel.findById(id)
        if(!user){ return false }
        return true;
    }

    async isExistByEmail(email: string): Promise<boolean>{
        const user = await this.userModel.findOne({email})
        if(!user){ return false }
        return true;
    }

    async create(user: SignupUserDto): Promise<{id: string}>{
        const {name, email, password} = user;
        const userData = await this.userModel.create({
            name,
            email,
            password,
        })

        if (!userData){ throw new ServiceUnavailableException("Something go wrong while creating new user") }
        return {id: String(userData._id)};
    }

    async updateById(user: UserDto): Promise<boolean>{
        const userData = await this.userModel.findByIdAndUpdate(user.id, user, {
            runValidators: true,
        })

        if(!userData){ return false }
        return true;
    }
}