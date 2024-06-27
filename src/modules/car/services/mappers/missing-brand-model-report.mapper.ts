import { MissingBrandModelReportEntity } from '../../../../database/entities/missing-brand-model-report.entity';
import { UserEntity } from '../../../../database/entities/user.entity';
import { ReportMissingBrandModelResDto } from '../../dto/res/report-missing-brand-model.res.dto';
import { UserMapper } from '../../../user/services/user.mapper';

export class MissingBrandModelReportMapper {
  public static toDto(
    report: MissingBrandModelReportEntity,
    user: UserEntity,
  ): ReportMissingBrandModelResDto {
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
      user: UserMapper.toPrivateResponseDTO(user)
    };
  }
}
