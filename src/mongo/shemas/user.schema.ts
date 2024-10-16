import { Optional } from "@nestjs/common";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Document } from "mongoose"

@Schema({
    timestamps: true
})
export class User extends Document{   
    @Prop()
    userName: string;

    @Prop()
    @Optional()
    firstName: string;

    @Prop()
    @Optional()
    lastName: string;

    @Prop({unique: [true, 'Duplicate email entered']})
    email: string;

    @Prop()
    password: string;
    
    @Prop()
    @Optional()
    photoUrl: string;

    @Prop()
    @Optional()
    subscriptions: string[];

    @Prop({type: Map})
    @Optional()
    dmChats: Map<string, string>

    @Prop()
    @Optional()
    favorite: string[];

    @Prop()
    @Optional()
    blacklist: string[];

    @Prop({type: Map})
    @Optional()
    lastReads: Map<string, number>;

    @Prop()
    @Optional()
    lastLogin: Date;

    @Prop()
    @Optional()
    personalChannel: string;
}
export const UserSchema = SchemaFactory.createForClass(User)
