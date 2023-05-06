import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1682797556605 implements MigrationInterface {
  name = 'Init1682797556605';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "token" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'NORMAL'`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "is_active" SET DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "is_active" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "token" SET NOT NULL`,
    );
  }
}
