import { BadRequestException, Injectable, NotFoundException, ServiceUnavailableException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "./shemas/user.schema";
import { Model } from "mongoose";
import { UserDto } from "./dto/user.dto";
import { LoginUserDto } from "src/auth/dto/login.dto";
import { SignupUserDto } from "src/auth/dto/signup.dto";
import { AuthUserDto } from "src/auth/dto/auth-user.dto";
import { LastRead} from "./shemas/lastRead.schema";

const userProjection = {
    _id: 0,
    id: '$_id',
    name: 1,
    email: 1,
    subscription: 1
}

const authProjection = {
    _id: 0,
    id: '$_id',
    name: 1,
    email: 1,
    password: 1,
}

const defaultOptions = {
    runValidators: true,
    new: true,
    lean: true,
}

@Injectable()
export class UserRepository {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(LastRead.name) private lastReadModel: Model<LastRead>
    ){}

    async findById(id: string): Promise<UserDto>{
        const user = await this.userModel.findById(id, userProjection);
        if(!user){
            throw new NotFoundException(`There is no such user ${id}`);
        }

        return user as any as UserDto;
    }

    async findByIdAuth(id: string): Promise<AuthUserDto>{
        const user = await this.userModel.findById(id, authProjection);
        if(!user){
            throw new NotFoundException(`There is no such user ${id}`);
        }
        
        return user as any as AuthUserDto;
    }

    async findByEmail(email: string): Promise<UserDto>{
        const user =  await this.userModel.findOne({email}, userProjection);
        if(!user){
            throw new NotFoundException(`There is no such user ${email}`);
        }

        return user as any as UserDto;
    }

    async findByEmailAuth(email: string): Promise<AuthUserDto>{
        const user =  await this.userModel.findOne({email}, authProjection);
        if(!user){
            throw new NotFoundException(`There is no such user ${email}`);
        }

        return user as any as AuthUserDto;
    }

    async isExistById(id: string): Promise<boolean>{
        const user = await this.userModel.findById(id, userProjection);
        if(!user){ return false }
        return true;
    }

    async isExistByEmail(email: string): Promise<boolean>{
        const user = await this.userModel.findOne({email}, userProjection)
        if(!user){ return false }
        return true;
    }

    async create(user: SignupUserDto): Promise<UserDto>{
        const userData = await this.userModel.create({...user});

        if (!userData){ throw new ServiceUnavailableException("Something go wrong while creating new user") }
        return ;
    }

    async update(user: UserDto): Promise<UserDto>{
        const userData = await this.userModel.findByIdAndUpdate(user.id, user, {
            ...defaultOptions,
            projection: userProjection,
        })

        if(!userData){ throw new ServiceUnavailableException("Something go wrong while updating user") }
        return userData as any as UserDto;
    }

    async addSubscription(userId: string, channelId: string): Promise<boolean>{
        const user = await this.userModel.findById(userId);
        if (user.subscriptions.includes(channelId)){
            throw new BadRequestException("already subscribed");           
        }

        const userData = await this.userModel.findByIdAndUpdate(userId, {$push:{subscriptions: channelId}}, {
            ...defaultOptions,
            projection: userProjection,
        })       

        if(userData){
            return true
        }
        return false
    }

    async getLastReads (userId: string, channelId: string) {
        const query = {userId: userId, channelId: channelId};
        const lastReads = await this.lastReadModel.findOne(query);
        if(!lastReads){
            return 
        }
        return lastReads
    }

    async updateLastReads (userId: string, channelId: string , lastMessageNum: number) {
        const query = {userId: userId, channelId: channelId}
        await this.lastReadModel.findOneAndUpdate(query, {lastMessageNum})
    }
}