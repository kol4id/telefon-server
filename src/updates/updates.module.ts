import { Module } from '@nestjs/common';
import { UserModule } from 'src/user/user.module';
import { UpdatesController } from './updates.controller';

@Module({
    imports: [
        UserModule
    ],
    controllers: [UpdatesController],
})
export class UpdatesModule {}
