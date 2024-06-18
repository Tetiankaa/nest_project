import { MigrationInterface, QueryRunner } from 'typeorm';

export class InsertInitialData1718696000000 implements MigrationInterface {
  name = 'InsertInitialData1718696000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            INSERT INTO "brands" ("id", "name") VALUES
            (uuid_generate_v4(), 'BMW'),
            (uuid_generate_v4(), 'Daewoo')
        `);

    await queryRunner.query(`
            WITH brand_ids AS (
                SELECT "id", "name" FROM "brands"
            )
            INSERT INTO "models" ("id", "name", "brand_id") VALUES
            (uuid_generate_v4(), 'X5', (SELECT "id" FROM brand_ids WHERE "name" = 'BMW')),
            (uuid_generate_v4(), 'Lanos', (SELECT "id" FROM brand_ids WHERE "name" = 'Daewoo'))
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "models" WHERE "name" IN ('Corolla', 'Camry', 'Mustang')`);
    await queryRunner.query(`DELETE FROM "brands" WHERE "name" IN ('Toyota', 'Ford')`);
  }
}
