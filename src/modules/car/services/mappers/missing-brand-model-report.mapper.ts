import { MissingBrandModelReportEntity } from '../../../../database/entities/missing-brand-model-report.entity';
import { UserEntity } from '../../../../database/entities/user.entity';
import { PaginationResDto } from '../../../pagination/dto/res/pagination.res.dto';
import { UserMapper } from '../../../user/services/user.mapper';
import { MissingBrandModelReportResDto } from '../../dto/res/missing-brand-model-report.res.dto';

export class MissingBrandModelReportMapper {
  public static toDto(
    report: MissingBrandModelReportEntity,
    user: UserEntity,
  ): MissingBrandModelReportResDto {
    return {
      id: report.id,
      brand: report.brand,
      model: report.model,
      email: report.email,
      fullName: report.fullName,
      notes: report.notes,
      isResolved: report.isResolved,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
      user: UserMapper.toPrivateResponseDTO(user),
    };
  }
  public static toListDto(
    result: PaginationResDto<MissingBrandModelReportEntity>,
  ): PaginationResDto<MissingBrandModelReportResDto> {
    return {
      data: result.data.map((report) => this.toDto(report, report.user)),
      totalCount: result.totalCount,
      limit: result.limit,
      page: result.page,
    };
  }
}
