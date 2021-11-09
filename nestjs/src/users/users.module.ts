import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FilesModule } from '../files/files.module';
import { UsersController } from './users.controller';
import { StripeModule } from '../stripe/stripe.module';
import User from './models/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    FilesModule,
    StripeModule
  ],
  providers: [UsersService],
  exports: [UsersService],
  controllers: [UsersController]
})
export class UsersModule {}
