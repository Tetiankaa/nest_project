import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

import { TimeHelper } from '../../../common/helpers/time.helper';
import { Configs, OperationsConfig } from '../../../configs/configs.type';
import { EPostStatus } from '../../../database/entities/enums/post-status.enum';
import { PostEntity } from '../../../database/entities/post.entity';
import { PriceEntity } from '../../../database/entities/price.entity';
import { ExchangeRateService } from '../../exchange-rate/services/exchange-rate.service';
import { LoggerService } from '../../logger/services/logger.service';
import { PostService } from '../../post/services/post.service';
import { PriceService } from '../../post/services/price.service';
import { MissingBrandModelReportRepository } from '../../repository/services/missing-brand-model-report.repository';
import { PostRepository } from '../../repository/services/post.repository';

@Injectable()
export class CronService {
  private readonly operationsConfig: OperationsConfig;

  constructor(
    private readonly exchangeRateService: ExchangeRateService,
    private readonly loggerService: LoggerService,
    private readonly postService: PostService,
    private readonly priceService: PriceService,
    private readonly postRepository: PostRepository,
    private readonly missingBrandModelReportRepository: MissingBrandModelReportRepository,
    private readonly configService: ConfigService<Configs>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {
    this.operationsConfig =
      this.configService.get<OperationsConfig>('operations');
  }

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  public async fetchExchangeRate() {
    return await this.entityManager.transaction(async (entityManager) => {
      const start = Date.now();
      try {
        this.loggerService.log('fetching exchange rates started ' + start);

        await this.exchangeRateService.deleteAll(entityManager);
        const rates = await this.exchangeRateService.getFromApi();
        await this.exchangeRateService.save(rates, entityManager);
      } catch (e) {
        this.loggerService.error(e);
      } finally {
        const end = Date.now();
        this.loggerService.log('fetching exchange rates ended: ' + end);
        this.loggerService.log(`Taking time: ${end - start}ms`);
      }
    });
  }
  @Cron('* 5 8 * * *')
  public async updateCarPrices() {
    return await this.entityManager.transaction(async (entityManager) => {
      const start = Date.now();
      try {
        this.loggerService.log('updating car prices started ' + start);

        const priceRepository = entityManager.getRepository(PriceEntity);
        const postRepository = entityManager.getRepository(PostEntity);

        const rates = await this.exchangeRateService.getAll(entityManager);

        let page = 0;
        let hasMore = true;

        while (hasMore) {
          const posts = await postRepository.find({
            where: { status: EPostStatus.ACTIVE },
            skip: page * this.operationsConfig.batch_size,
            take: this.operationsConfig.batch_size,
            relations: ['car', 'car.price'],
          });

          if (posts.length === 0) {
            hasMore = false;
            continue;
          }
          for (const post of posts) {
            const calculatedPrices = await this.priceService.calculatePrices(
              post.car.enteredPrice,
              post.car.enteredCurrency,
              rates,
            );
            await entityManager.remove(PriceEntity, post.car.price);
            await this.priceService.savePrices(
              calculatedPrices,
              post.car.id,
              priceRepository,
            );
          }
          page++;
        }
      } catch (e) {
        this.loggerService.error(e);
      } finally {
        const end = Date.now();
        this.loggerService.log('updating car prices ended:  ' + end);
        this.loggerService.log(`Taking time: ${end - start}ms`);
      }
    });
  }
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  public async removeInactivePosts() {
    return await this.entityManager.transaction(async (entityManager) => {
      const start = Date.now();
      try {
        this.loggerService.log('removing inactive posts started ' + start);

        let page = 0;
        let hasMore = true;

        while (hasMore) {
          const posts = await this.postRepository.getPostsByDateAndStatus(
            TimeHelper.subtractByParams(30, 'days'),
            EPostStatus.NOT_ACTIVE,
            page * this.operationsConfig.batch_size,
            this.operationsConfig.batch_size,
          );

          if (posts.length === 0) {
            hasMore = false;
            continue;
          }
          for (const post of posts) {
            await this.postService.removePost(post, entityManager);
          }
          page++;
        }
      } catch (e) {
        this.loggerService.error(e);
      } finally {
        const end = Date.now();
        this.loggerService.log('removing inactive posts: ' + end);
        this.loggerService.log(`Taking time: ${end - start}ms`);
      }
    });
  }

  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  public async removeResolvedMissingBrandModelReports() {
    const start = Date.now();
    try {
      this.loggerService.log('removing resolved reports started ' + start);

      await this.missingBrandModelReportRepository.removeResolvedReports(
        TimeHelper.subtractByParams(90, 'days'),
      );
    } catch (e) {
      this.loggerService.error(e);
    } finally {
      const end = Date.now();
      this.loggerService.log('removing resolved reports: ' + end);
      this.loggerService.log(`Taking time: ${end - start}ms`);
    }
  }
}
