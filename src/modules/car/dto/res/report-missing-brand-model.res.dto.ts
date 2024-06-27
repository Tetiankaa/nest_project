import { ApiProperty } from '@nestjs/swagger';
import { PrivateUserResDto } from '../../../user/dto/res/private-user-res.dto';

export class ReportMissingBrandModelResDto {
  @ApiProperty({
    example: '1a2b3c4d-5e6f-7g8h-9i0j',
    description: 'Unique identifier for the report',
  })
  public readonly id: string;

  @ApiProperty({
    example: '1a2b3c4d-5e6f-7g8h-9i0j',
    description: 'The user who reported',
  })
  public readonly user: PrivateUserResDto;

  @ApiProperty({
    example: 'BMW',
    description: 'The brand that is missing',
  })
  public readonly brand: string;

  @ApiProperty({
    example: 'X5',
    description: 'The model that is missing',
  })
  public readonly model: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'Email address of the user who reported',
  })
  public readonly email: string;

  @ApiProperty({
    example: 'Ivan Ivanov',
    description: 'Full name of the user who reported',
    required: false
  })
  public readonly fullName?: string;

  @ApiProperty({
    example: 'The brand and model are missing from the list.',
    description: 'Additional notes provided by the user',
    required: false
  })
  public readonly notes?: string;

  @ApiProperty({
    example: false,
    description: 'Whether the report has been resolved or not'
  })
  public readonly isResolved: boolean;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'The date and time when the report was created.',
  })
  public readonly createdAt: Date;

  @ApiProperty({
    example: '2024-01-01T12:00:00.000Z',
    description: 'The date and time when the report was last updated.',
  })
  public readonly updatedAt: Date;
}
