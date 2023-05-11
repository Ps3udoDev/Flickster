import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1683691453503 implements MigrationInterface {
  name = 'Init1683691453503';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "image_url" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "image_url" SET NOT NULL`,
    );
  }
}
