import { Injectable, Logger } from '@nestjs/common';
import { UserDto, UserExternalDto } from 'src/user/dto/user.dto';
import { UserRepository } from 'src/mongo/mongo-user.service';
import * as bcrypt from 'bcrypt';
import { MessageDto } from 'src/messages/dto/message.dto';
import { ChannelRepository } from 'src/mongo/mongo-channel.service';

@Injectable()
export class UserService {
    constructor(
        private userRepository: UserRepository,
        private channelRepository: ChannelRepository
    ){}

    private logger = new Logger(UserService.name);

    async getUser(userId: string): Promise<UserDto>{
        return await this.userRepository.findById(userId);
    }

    async getManyUsersByUserSubs(user: UserDto): Promise<UserDto[]>{
        return this.userRepository.findManyByChannels(user.subscriptions);
    }

    async getMany(usersIds: string[]): Promise<UserExternalDto[]>{
        return this.userRepository.findManyById(usersIds);
    } 

    async patch(password: string = ''): Promise<void>{
        const isPasswordMatch = await bcrypt.compare(password, process.env.ADMIN_PASS);
        if (!isPasswordMatch) return

        this.userRepository.updateSchema();
    }

    async updateLastRead(user: UserDto, message: MessageDto): Promise<UserDto>{
        const updatedUser = user;
        updatedUser.lastReads[message.chatId] = message.createdAt;
        return await this.userRepository.update(updatedUser);
    }

    async update(user: UserDto): Promise<UserDto>{
        const DEFAULT_BLANK_PHOTO_URL = "https://res.cloudinary.com/dz57wrthe/image/upload/v1730298719/blank.jpg";
        const newUser: UserDto = {...user, photoUrl: user.photoUrl ?? DEFAULT_BLANK_PHOTO_URL}
        const updated = await this.userRepository.update(newUser);
        this.logger.debug(user)
        const title = updated.firstName + (updated.lastName == "" ? "" : ` ${updated.lastName}`); 
        this.channelRepository.findByCreatorAndUpdate(updated.id, {
            title: title,
            channelName: updated.userName,
            imgUrl: updated.photoUrl,
        })
        return updated
    }

    //(user.firstName + ' ' + lastName)

    async isUsernameExist(userName: string): Promise<boolean>{
        const user = await this.userRepository.findByUsername(userName);
        if (user) return true;
        return false;
    }

    async updateLastLogin(userId: string): Promise<UserDto>{
        return await this.userRepository.updateLastLogin(userId)
    }

    async updatePhoto(src: string, user: UserDto): Promise<UserDto>{
        const updated = await this.userRepository.update({...user, photoUrl: src});
        this.channelRepository.findByCreatorAndUpdate(user.id, {imgUrl: updated.photoUrl});
        return updated; 
    }

}
