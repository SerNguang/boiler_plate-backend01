import { UsersService } from './users.service';
import { Controller, Post, Delete, Req, UploadedFile, UseGuards, UseInterceptors, Get, Query, Param, Put, Body, Res } from '@nestjs/common';

import RequestWithUser from '../authentication/requestWithUser.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import JwtAuthenticationGuard from 'src/authentication/guards/jwt-authentication.guard';
import { map, Observable, of, tap } from 'rxjs';
import { Pagination } from 'nestjs-typeorm-paginate';
import User from './models/user.entity';
import { hasRoles } from 'src/authentication/decorators/roles.decorator';
import { UserRole } from './models/user.interface';
import { JwtAuthGuard } from 'src/authentication/guards/jwt-guard';
import { RolesGuard } from 'src/authentication/guards/roles.guard';
import { UserIsUserGuard } from 'src/authentication/guards/UserIsUser.guard';
import path, { join } from 'path';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';

export const storage = {
  storage: diskStorage({
      destination: './uploads/profileimages',
      filename: (req, file, cb) => {
          const filename: string = path.parse(file.originalname).name.replace(/\s/g, '') + uuidv4();
          const extension: string = path.parse(file.originalname).ext;

          cb(null, `${filename}${extension}`)
      }
  })

}


@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  @Post('avatar')
  @UseGuards(JwtAuthenticationGuard)
  @UseInterceptors(FileInterceptor('file'))
  async addAvatar(@Req() request: RequestWithUser, @UploadedFile() file: Express.Multer.File) {
    return this.usersService.addAvatar(request.user.id, file.buffer, file.originalname);
  }

  @Delete('avatar')
  @UseGuards(JwtAuthenticationGuard)
  async deleteAvatar(@Req() request: RequestWithUser) {
    return this.usersService.deleteAvatar(request.user.id);
  }


  @Get()
  index(
      @Query('page') page: number = 1,
      @Query('limit') limit: number = 10,
      @Query('username') username: string
  ): Observable<Pagination<User>> {
      limit = limit > 100 ? 100 : limit;

      // if (username === null || username === undefined) {
          return this.usersService.paginate({ page: Number(page), limit: Number(limit), route: 'http://localhost:3000/api/users' });
      // } else {
      //     return this.usersService.paginateFilterByUsername(
      //         { page: Number(page), limit: Number(limit), route: 'http://localhost:3000/api/users' },
      //         { username }
      //     )
      // }
  }

  @hasRoles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  deleteOne(@Param('id') id: string): Observable<any> {
      return this.usersService.deleteOne(Number(id));
  }

  @UseGuards(JwtAuthGuard, UserIsUserGuard)
  @Put(':id')
  updateOne(@Param('id') id: string, @Body() user: User): Observable<any> {
      return this.usersService.updateOne(Number(id), user);
  }

  @hasRoles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':id/role')
  updateRoleOfUser(@Param('id') id: string, @Body() user: User): Observable<User> {
      return this.usersService.updateRoleOfUser(Number(id), user);
  }

}
