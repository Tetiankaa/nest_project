import { ConfigStaticService } from '../../../../configs/config.static';
import { ImageEntity } from '../../../../database/entities/image.entity';
import { ImageResDto } from '../../dto/res/image.res.dto';

export class ImageMapper {
  public static toDtoList(images: ImageEntity[]): ImageResDto[] {
    return images.map((image) => this.toDto(image));
  }
  public static toDto(image: ImageEntity): ImageResDto {
    const bucketUrl = ConfigStaticService.get().aws.bucketUrl;
    return {
      id: image.id,
      url: `${bucketUrl}/${image.name}`,
    };
  }
}
