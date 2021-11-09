import { Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { UsersModule } from '../users/users.module';
import { AuthenticationController } from './authentication.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { EmailConfirmationModule } from '../emailConfirmation/emailConfirmation.module';
import { LocalStrategy } from './guards/local.strategy';
import { JwtStrategy } from './guards/jwt-strategy';
import { JwtRefreshTokenStrategy } from './guards/jwt-refresh-token.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    ConfigModule,
    JwtModule.register({}),
    EmailConfirmationModule
  ],
  providers: [AuthenticationService, LocalStrategy, JwtStrategy, JwtRefreshTokenStrategy],
  controllers: [AuthenticationController],
  exports: [AuthenticationService]
})
export class AuthenticationModule {}
