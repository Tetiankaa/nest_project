import { ApiProperty } from '@nestjs/swagger';

import { EAccountType } from '../../../../database/entities/enums/account-type.enum';
import { EUserRole } from '../../../../database/entities/enums/user-role.enum';
import { DealershipResDto } from '../../../dealership/dto/res/dealership.res.dto';
import { IsOptional } from 'class-validator';

export class BaseUserResDto {
  @ApiProperty({
    example: '121324354678976543fdg',
    description: 'The id of the User',
  })
  id: string;

  @ApiProperty({
    example: 'Ivan',
    description: 'The first name of the User',
  })
  public readonly firstName: string;

  @ApiProperty({
    example: 'Ivanov',
    description: 'The last name of the User',
  })
  public readonly lastName: string;

  @ApiProperty({
    example: 'test@gmail.com',
    description: 'The email of the User',
  })
  public readonly email: string;

  @ApiProperty({
    example: '+380 12 345 67 89',
    description: 'The phone of the User',
  })
  public readonly phone: string;

  @ApiProperty({
    example: 'BUYER',
    description: 'The role of the User',
  })
  public readonly role: EUserRole;

  @ApiProperty({
    example: 'BASIC',
    description: 'The account type of the User',
  })
  public readonly accountType: EAccountType;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'The date and time when the user account was created.',
  })
  public readonly createdAt: Date;

  @ApiProperty({
    example: '2024-01-01T12:00:00.000Z',
    description: 'The date and time when the user account was last updated.',
  })
  public readonly updatedAt: Date;

  @ApiProperty({
    type: DealershipResDto,
    description: 'The dealership information associated with the user',
    required: false,
  })
  @IsOptional()
  public readonly dealership?: DealershipResDto;
}
