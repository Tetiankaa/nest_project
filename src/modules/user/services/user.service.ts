import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { IUserData } from '../../auth/interfaces/user-data.interface';
import { LoggerService } from '../../logger/logger.service';
import { UserRepository } from '../../repository/services/user.repository';
import { UpdateUserReqDto } from '../dto/req/update-user-req.dto';
import { PrivateUserResDto } from '../dto/res/private-user-res.dto';
import { UserMapper } from './user.mapper';
import { errorMessages } from '../../../common/constants/error-messages.constant';
import { EntityManager, Repository } from 'typeorm';
import { UserEntity } from '../../../database/entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    private readonly loggerService: LoggerService,
    private readonly userRepository: UserRepository,
  ) {}

  public async isEmailUniqueOrThrow(email: string, userRepository?: Repository<UserEntity>): Promise<void> {
    const user = await userRepository.findOneBy({ email });
    if (user)
      throw new ConflictException(errorMessages.EMAIL_ALREADY_EXISTS);
  }
  // public async getMe(userData: IUserData): Promise<PrivateUserResDto> {
  //   const { userId } = userData;
  //   const user = await this.userRepository.findOneBy({ id: userId });
  //   return UserMapper.toResponseDTO(user);
  // }
  // public async getById(id: string): Promise<PrivateUserResDto> {
  //   const user = await this.userRepository.findOneBy({ id });
  //   if (!user) {
  //     throw new NotFoundException('User was not found.');
  //   }
  //   return UserMapper.toResponseDTO(user);
  // }
  // public async updateMe(
  //   userData: IUserData,
  //   value: UpdateUserReqDto,
  // ): Promise<PrivateUserResDto> {
  //   const user = await this.userRepository.findOneBy({ id: userData.userId });
  //   const updatedUser = await this.userRepository.save({ ...user, ...value });
  //   return UserMapper.toResponseDTO(updatedUser);
  // }
  // public async follow(userData: IUserData, userId: string): Promise<void> {
  //   if (userData.userId === userId) {
  //     throw new ConflictException('You cannot follow yourself.');
  //   }
  //   const userToFollow = await this.userRepository.findOneBy({ id: userId });
  //   if (!userToFollow) {
  //     throw new NotFoundException('User not found.');
  //   }
  //   const existedFollow = await this.followRepository.findOneBy({
  //     follower_id: userData.userId,
  //     following_id: userId,
  //   });
  //   if (existedFollow) {
  //     throw new ConflictException('You are already following this user.');
  //   }
  //   await this.followRepository.save(
  //     this.followRepository.create({
  //       follower_id: userData.userId,
  //       following_id: userId,
  //     }),
  //   );
  // }
  // public async unfollow(userData: IUserData, userId: string): Promise<void> {
  //   if (userData.userId === userId) {
  //     throw new ConflictException('You cannot unfollow yourself.');
  //   }
  //   const userToUnfollow = await this.userRepository.findOneBy({ id: userId });
  //   if (!userToUnfollow) {
  //     throw new NotFoundException('User not found.');
  //   }
  //   const existedFollow = await this.followRepository.findOneBy({
  //     follower_id: userData.userId,
  //     following_id: userId,
  //   });
  //   if (!existedFollow) {
  //     throw new ConflictException(
  //       'You cant unfollow user you are not following',
  //     );
  //   }
  //   await this.followRepository.remove(existedFollow);
  // }
  // public async uploadAvatar(
  //   userData: IUserData,
  //   file: Express.Multer.File,
  // ): Promise<void> {
  //   const image = await this.fileStorageService.uploadFile(
  //     file,
  //     ContentTypeEnum.AVATAR,
  //     userData.userId,
  //   );
  //   await this.userRepository.update(userData.userId, { image });
  // }
  // public async deleteAvatar(userData: IUserData): Promise<void> {
  //   const user = await this.userRepository.findOneBy({ id: userData.userId });
  //
  //   if (user.image) {
  //     await this.fileStorageService.deleteFile(user.image);
  //     await this.userRepository.save(
  //       this.userRepository.merge(user, { image: null }),
  //     );
  //   }
  // }
}
