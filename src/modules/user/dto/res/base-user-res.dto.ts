import { ApiProperty } from '@nestjs/swagger';
import { EUserRole } from '../../../../database/entities/enums/user-role.enum';
import { EAccountType } from '../../../../database/entities/enums/account-type.enum';

export class BaseUserResDto {
  @ApiProperty({
    example: '121324354678976543fdg',
    description: 'The id of the User',
  })
  id: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'The first name of the User',
  })
  public readonly firstName: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'The last name of the User',
  })
  public readonly lastName: string;

  @ApiProperty({
    example: 'test@.gmail.com',
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
}
