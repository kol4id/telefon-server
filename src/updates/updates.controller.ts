import { Controller, Patch, Query } from '@nestjs/common';
import { UserService } from 'src/user/user.service';

@Controller('updates')
export class UpdatesController {
    constructor(private userService: UserService){}

    @Patch()
    async Update(
        @Query('password') password: string,
    ): Promise<void> {
        this.userService.patch(password);
    }
}
