import { Injectable, Logger } from '@nestjs/common';
import { UserDto } from 'src/user/dto/user.dto';
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
        this.logger.debug(user)
        const updated = await this.userRepository.update(user);
        this.logger.debug(JSON.stringify(updated));
        const lastName = user.lastName == undefined ? " " : user.lastName 
        this.channelRepository.findByCreatorAndUpdate(user.id, {
            title: (user.firstName + ' ' + lastName),
            channelName: user.userName,
            imgUrl: user.photoUrl,
        })
        return updated
    }

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
