import { BadRequestException, Injectable, NotFoundException, ServiceUnavailableException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "./shemas/user.schema";
import { Model } from "mongoose";
import { UserDto } from "../user/dto/user.dto";
import { SignupUserDto } from "src/auth/dto/auth.dto";
import { AuthUserDto } from "src/auth/dto/auth.dto";
import idProjection from "./mongo-projection-id-config";

const userProjection = {
    userName: 1,
    firstName: 1,
    lastName: 1,
    email: 1,
    photoUrl: 1,
    subscriptions: 1,
    favorite: 1,
    blacklist: 1,
    lastReads: 1,
    lastLogin: 1,
    personalChannel: 1,
    ...idProjection,
}

const authProjection = {
    ...userProjection,
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
    ){}

    async findById(id: string): Promise<UserDto>{
        const user = await this.userModel.findById(id, userProjection).lean();
        if(!user){
            throw new NotFoundException(`There is no such user ${id}`);
        }

        return user as any as UserDto;
    }

    async findByIdNoLean(id: string): Promise<UserDto>{
        const user = await this.userModel.findById(id, userProjection).exec();
        if(!user){
            throw new NotFoundException(`There is no such user ${id}`);
        }

        return user as any as UserDto;
    }

    async findByUsername(username: string): Promise<UserDto>{
        const user = this.userModel.findOne({userName: username});
        return user as any as UserDto;
    }

    async findManyByUsername(subString: string, limit: number): Promise<UserDto[]>{
        const regex = new RegExp(subString, 'i');
        const users = this.userModel.find({userName: {$regex: regex}}, userProjection).limit(limit).lean();
        return users as any as UserDto[];
    }

    async findManyByName(subString: string, limit: number): Promise<UserDto[]>{
        const regex = new RegExp(subString, 'i');
        const usersByName = this.userModel.find({
            $or: [
                { firstName: { $regex: regex } },
                { lastName: { $regex: regex } }
            ]
        }, userProjection).limit(limit).lean();
        return usersByName as any as UserDto[];
    }

    async findByIdAuth(id: string): Promise<AuthUserDto>{
        const user = await this.userModel.findById(id, authProjection).lean();
        if(!user){
            throw new NotFoundException(`There is no such user ${id}`);
        }
        
        return user as any as AuthUserDto;
    }

    async findByEmail(email: string): Promise<UserDto>{
        const user =  await this.userModel.findOne({email}, userProjection).lean();
        if(!user){
            throw new NotFoundException(`There is no such user ${email}`);
        }

        return user as any as UserDto;
    }

    async findByEmailAuth(email: string): Promise<AuthUserDto>{
        const user =  await this.userModel.findOne({email}, authProjection).lean();
        if(!user){
            throw new NotFoundException(`There is no such user ${email}`);
        }

        return user as any as AuthUserDto;
    }

    async isExistById(id: string): Promise<boolean>{
        const user = await this.userModel.findById(id, userProjection).lean();
        if(!user){ return false }
        return true;
    }

    async isExistByEmail(email: string): Promise<boolean>{
        const user = await this.userModel.findOne({email}, userProjection).lean()
        if(!user){ return false }
        return true;
    }

    async create(user: SignupUserDto): Promise<UserDto>{
        const data = await this.userModel.create(user);
        const userData = await this.findById(data._id);
        // this.StringifyId(userData);
        if (!userData){ throw new ServiceUnavailableException("Something go wrong while creating new user") }
        return userData as any as UserDto;
    }

    async update(user: UserDto): Promise<UserDto>{
        const userData = await this.userModel.findByIdAndUpdate(user.id, user, {
            ...defaultOptions,
            projection: userProjection,
        })

        this.StringifyId(userData);
        console.log(userData)
        // this.StringifyId(userData);
        if(!userData){ throw new ServiceUnavailableException("Something go wrong while updating user") }
        return userData as any as UserDto;
    }

    async addSubscription(userId: string, channelId: string): Promise<UserDto>{
        const user = await this.userModel.findById(userId).lean().exec();
        if (user.subscriptions.includes(channelId)){
            throw new BadRequestException("already subscribed");           
        }

        const oldsubs = user.subscriptions;
        user.subscriptions = [...oldsubs, channelId]
        const userData = await this.userModel.findByIdAndUpdate(userId, user, {
            ...defaultOptions,
            projection: userProjection,
            new: true
        }).lean().exec()     
        return userData as any as UserDto
    }

    async addDmChat(userId: string, channelId: string, chatId: string): Promise<UserDto>{
        const user = await this.userModel.findById(userId);
        if (!user.dmChats){
            user.dmChats = new Map<string, string>;
        }
        user.dmChats.set(channelId, chatId);
        return this.userModel.findByIdAndUpdate(userId, {$set: {dmChats: user.dmChats}});
    }

    async getLastReads (userId: string, channelId: string): Promise<UserDto> {
        const user = await this.userModel.findById(userId, userProjection).lean();
        
        return user as any as UserDto;
    }

    async updateSchema (): Promise<void> {
        await this.userModel.updateMany({}, {$set: {photoUrl: '', favorite: [], blacklist: [], lastReads: {}}})
    }

    async updateLastLogin (userId: string): Promise<UserDto>{
       const updated = this.userModel.findByIdAndUpdate(userId, {lastLogin: Date.now()}, {projection: userProjection}).lean();
       return updated as any as UserDto;
    }

    // async updateLastReads (userId: string, channelId: string , lastMessageNum: number) {
    //     const query = {userId: userId, channelId: channelId}
    //     await this.lastReadModel.findOneAndUpdate(query, {lastMessageNum}, {
    //         ...defaultOptions,
    //         projection: userProjection,
    //     })
    // }

    private StringifyId(user: any){
        const users = Array.isArray(user) ? user : [user];
        users.forEach((user)=>{
            user.id = user._id.toString()
            delete user._id;
            delete user.password;
        })
    } 
}