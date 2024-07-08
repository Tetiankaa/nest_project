import { MigrationInterface, QueryRunner } from 'typeorm';
import { ECurrency } from '../entities/enums/currency.enum';

export class insertInitialData20240801000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "brands" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" text NOT NULL, CONSTRAINT "UQ_96db6bbbaa6f23cad26871339b6" UNIQUE ("name"), CONSTRAINT "PK_b0c437120b624da1034a81fc561" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "models" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" text NOT NULL, "brand_id" uuid NOT NULL, CONSTRAINT "PK_ef9ed7160ea69013636466bf2d5" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TYPE "public"."currencies_value_enum" AS ENUM('USD', 'EUR', 'UAH')`);
    await queryRunner.query(`CREATE TABLE "currencies" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "value" "public"."currencies_value_enum" NOT NULL, CONSTRAINT "PK_d528c54860c4182db13548e08c4" PRIMARY KEY ("id"))`);
    await queryRunner.query(`ALTER TABLE "models" ADD CONSTRAINT "FK_f2b1673c6665816ff753e81d1a0" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);

    await queryRunner.query(`
      INSERT INTO brands (id, name, "createdAt", "updatedAt") VALUES
      (uuid_generate_v4(), 'BMW', now(), now()),
      (uuid_generate_v4(), 'Lanos', now(), now());
    `);

    const bmw = await queryRunner.query(`SELECT id FROM brands WHERE name = 'BMW'`);
    const lanos = await queryRunner.query(`SELECT id FROM brands WHERE name = 'Lanos'`);

    await queryRunner.query(`
      INSERT INTO models (id, name, brand_id, "createdAt", "updatedAt") VALUES
      (uuid_generate_v4(), 'X5', '${bmw[0].id}', now(), now()),
      (uuid_generate_v4(), 'Daewoo', '${lanos[0].id}', now(), now());
    `);

    await queryRunner.query(`
          INSERT INTO currencies (id, value) VALUES 
          (uuid_generate_v4(), '${ECurrency.UAH}'), 
          (uuid_generate_v4(), '${ECurrency.USD}'), 
          (uuid_generate_v4(), '${ECurrency.EUR}');
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "models"`);
    await queryRunner.query(`DROP TABLE "brands"`);
    await queryRunner.query(`DELETE FROM models WHERE name IN ('X5', 'Daewoo')`);
    await queryRunner.query(`DELETE FROM brands WHERE name IN ('BMW', 'Lanos')`);
    await queryRunner.query(`DROP TABLE "currencies"`);
    await queryRunner.query(`DROP TYPE "public"."currencies_value_enum"`);
    await queryRunner.query(`
          DELETE FROM currencies WHERE value IN ('${ECurrency.UAH}', '${ECurrency.USD}', '${ECurrency.EUR}');
        `);
  }
}
