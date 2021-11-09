import { Get, HttpException, HttpStatus, Injectable, InternalServerErrorException, Param, Post, Res, UploadedFile, UseGuards, UseInterceptors, Request } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Connection, In } from 'typeorm';

import CreateUserDto from './dto/createUser.dto';
import { FilesService } from '../files/files.service';
import * as bcrypt from 'bcrypt';
import StripeService from '../stripe/stripe.service';
import User from './models/user.entity';
import { from, map, Observable, of, switchMap, tap } from 'rxjs';
import {paginate, Pagination, IPaginationOptions} from 'nestjs-typeorm-paginate';
import { JwtAuthGuard } from 'src/authentication/guards/jwt-guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { join } from 'path';
import { storage } from './users.controller';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly filesService: FilesService,
    private connection: Connection,
    private stripeService: StripeService
  ) {}

  async updateMonthlySubscriptionStatus(
    stripeCustomerId: string, monthlySubscriptionStatus: string
  ) {
    return this.usersRepository.update(
      { stripeCustomerId },
      { monthlySubscriptionStatus }
    );
  }

  async getByEmail(email: string) {
    const user = await this.usersRepository.findOne({ email });
    if (user) {
      return user;
    }
    throw new HttpException('User with this email does not exist', HttpStatus.NOT_FOUND);
  }

  async getByIds(ids: number[]) {
    return this.usersRepository.find({
      where: { id: In(ids) },
    });
  }

  async getById(id: number) {
    const user = await this.usersRepository.findOne({ id });
    if (user) {
      return user;
    }
    throw new HttpException('User with this id does not exist', HttpStatus.NOT_FOUND);
  }

  async create(userData: CreateUserDto) {
    const stripeCustomer = await this.stripeService.createCustomer(userData.fullName, userData.email);

    const newUser = await this.usersRepository.create({
      ...userData,
      stripeCustomerId: stripeCustomer.id
    });
    await this.usersRepository.save(newUser);
    return newUser;
  }


  async addAvatar(userId: number, imageBuffer: Buffer, filename: string) {
    const user = await this.getById(userId);
    if (user.avatar) {
      await this.usersRepository.update(userId, {
        ...user,
        avatar: null
      });
      await this.filesService.deletePublicFile(user.avatar.id);
    }
    const avatar = await this.filesService.uploadPublicFile(imageBuffer, filename);
    await this.usersRepository.update(userId, {
      ...user,
      avatar
    });
    return avatar;
  }

  async deleteAvatar(userId: number) {
    const queryRunner = this.connection.createQueryRunner();
    const user = await this.getById(userId);
    const fileId = user.avatar?.id;
    if (fileId) {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      try {
        await queryRunner.manager.update(User, userId, {
          ...user,
          avatar: null
        });
        await this.filesService.deletePublicFileWithQueryRunner(fileId, queryRunner);
        await queryRunner.commitTransaction();
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw new InternalServerErrorException();
      } finally {
        await queryRunner.release();
      }
    }
  }

  async setCurrentRefreshToken(refreshToken: string, userId: number) {
    const currentHashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.usersRepository.update(userId, {
      currentHashedRefreshToken
    });
  }

  async getUserIfRefreshTokenMatches(refreshToken: string, userId: number) {
    const user = await this.getById(userId);

    const isRefreshTokenMatching = await bcrypt.compare(
      refreshToken,
      user.currentHashedRefreshToken
    );

    if (isRefreshTokenMatching) {
      return user;
    }
  }

  async markEmailAsConfirmed(email: string) {
    return this.usersRepository.update({ email }, {
      isEmailConfirmed: true
    });
  }


  async removeRefreshToken(userId: number) {
    return this.usersRepository.update(userId, {
      currentHashedRefreshToken: null
    });
  }

  findOne(id: number): Observable<User> {
    return from(this.usersRepository.findOne({id}, {relations: ['posts']})).pipe(
    //     map((user: User) => {
    //         const {password, ...result} = user;
    //         return result;
    //     } )
    )
  }

  findAll(): Observable<User[]> {
    return from(this.usersRepository.find()).pipe(
        map((users: User[]) => {
            users.forEach(function (v) {delete v.password});
            return users;
        })
    );
  }

  paginate(options: IPaginationOptions): Observable<Pagination<User>> {
    return from(paginate<User>(this.usersRepository, options)).pipe(
        map((usersPageable: Pagination<User>) => {
            usersPageable.items.forEach(function (v) {delete v.password});
            return usersPageable;
        })
    )
  }  

  deleteOne(id: number): Observable<any> {
    return from(this.usersRepository.delete(id));
  }

  updateOne(id: number, user: User): Observable<any> {
    delete user.email;
    delete user.password;
    delete user.role;

    return from(this.usersRepository.update(id, user)).pipe(
        switchMap(() => this.findOne(id))
    );
  }

  updateRoleOfUser(id: number, user: User): Observable<any> {
    return from(this.usersRepository.update(id, user));
  }

  findByMail(email: string): Observable<User> {
    return from(this.usersRepository.findOne({email}));
  }

  // paginateFilterByUsername(options: IPaginationOptions, user: User): Observable<Pagination<User>>{
  //   return from(this.usersRepository.findAndCount({
  //       skip: options.page * options.limit || 0,
  //       // take: options.limit || 10,
  //       // order: {id: "ASC"},
  //       // select: ['id', 'name', 'username', 'email', 'role'],
  //       // where: [
  //       //     { username: Like(`%${user.username}%`)}
  //       // ]
  //   })).pipe(
  //       map(([users, totalUsers]) => {
  //           const usersPageable: Pagination<User> = {
  //               items: users,
  //               links: {
  //                   first: options.route + `?limit=${options.limit}`,
  //                   previous: options.route + ``,
  //                   next: options.route + `?limit=${options.limit}&page=${options.page +1}`,
  //                   last: options.route + `?limit=${options.limit}&page=${Math.ceil(totalUsers / options.limit)}`
  //               },
  //               meta: {
  //                   currentPage: options.page,
  //                   itemCount: users.length,
  //                   itemsPerPage: options.limit,
  //                   totalItems: totalUsers,
  //                   totalPages: Math.ceil(totalUsers / options.limit)
  //               }
  //           };              
  //           return usersPageable;
  //       })
  //   )
// }


}
