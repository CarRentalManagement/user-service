import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import CustomLogger from '@microservice-user/module-log/customLogger';

import { User } from '@microservice-user/entities';

import CreateUserDto from './dto/createUser.dto';
import UpdateUserDto from './dto/updateUser.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,

    private readonly logger: CustomLogger,
  ) {
    logger.setContext(UserService.name);
  }

  async getByEmail(email: string) {
    const user = await this.usersRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw {
        message: 'User with this email does not exist',
      };
    }

    return user;
  }

  async getById(id: number) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (user) {
      return user;
    }
    throw new HttpException(
      'User with this id does not exist',
      HttpStatus.NOT_FOUND,
    );
  }

  public async createUser(userData: CreateUserDto) {
    const { email, name } = userData;

    const newUser = new User();
    newUser.email = email;
    newUser.name = name;

    await this.usersRepository.save(newUser);
    return newUser;
  }

  public async updateUserById(userId: number, userData: UpdateUserDto) {
    let user = await this.getById(userId);

    await this.usersRepository.update(
      {
        id: userId,
      },
      {},
    );
    user = await this.getById(userId);

    return user;
  }
}
