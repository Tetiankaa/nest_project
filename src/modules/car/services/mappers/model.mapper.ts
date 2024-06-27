import { ModelEntity } from '../../../../database/entities/model.entity';
import { ModelResDto } from '../../dto/res/model.res.dto';

export class ModelMapper {
  public static toDto(model: ModelEntity): ModelResDto {
    return {
      id: model.id,
      name: model.name,
    };
  }

 public static toListDto(models: ModelEntity[]): ModelResDto[] {
    return models.map(model => this.toDto(model));
  }
}
