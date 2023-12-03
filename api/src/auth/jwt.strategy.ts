import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { User } from "./schemas/user.schema";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){
    constructor(
        @InjectModel(User.name) private userModel: Model<User>
    ){
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_SECRET
        })
    }

    async validate(payload){
        const {id} = payload;
        const userData = await this.userModel.findById(id);
        if (!userData){
            throw new UnauthorizedException('Login first');  
        }

        const userObj = userData.toObject({ getters: true })
        const user = {id, ...userObj};
        console.log(user.subscriptions)
        return user
    }
}