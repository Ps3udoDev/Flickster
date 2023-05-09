import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1683636256685 implements MigrationInterface {
  name = 'Init1683636256685';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "episodes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "title" character varying NOT NULL, "synopsis" character varying NOT NULL, "episode_number" integer NOT NULL, "duration" integer NOT NULL, "episode_url" character varying NOT NULL, "cover_url" character varying NOT NULL, "season_id" uuid, CONSTRAINT "PK_6a003fda8b0473fffc39cb831c7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "seasons" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "title" character varying NOT NULL, "season_number" integer NOT NULL, "relase_year" character varying NOT NULL, "trailler_url" character varying NOT NULL, "cover_url" character varying NOT NULL, "serie_id" uuid, CONSTRAINT "UQ_4c3dd31215ca61224818b54cd01" UNIQUE ("title"), CONSTRAINT "PK_cb8ed53b5fe109dcd4a4449ec9d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "series" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "title" character varying NOT NULL, "synopsis" character varying NOT NULL, "relase_year" character varying NOT NULL, "director" character varying NOT NULL, "clasification" character varying NOT NULL, "rating" integer NOT NULL, CONSTRAINT "UQ_47fcd3a25ef21a51ae03cf500d5" UNIQUE ("title"), CONSTRAINT "PK_e725676647382eb54540d7128ba" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "series_genres" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "serie_id" uuid, "genre_id" uuid, CONSTRAINT "PK_71e4f4fe99cfcc63023f61a6291" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "episodes" ADD CONSTRAINT "FK_8fc013f436d72d36ab6a5af746f" FOREIGN KEY ("season_id") REFERENCES "seasons"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "seasons" ADD CONSTRAINT "FK_f8e1a55592135b94fdd952ac6a5" FOREIGN KEY ("serie_id") REFERENCES "series"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "series_genres" ADD CONSTRAINT "FK_9938fd62ec4732c98673753fcfb" FOREIGN KEY ("serie_id") REFERENCES "series"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "series_genres" ADD CONSTRAINT "FK_76732559d297ad04639b3fc75a1" FOREIGN KEY ("genre_id") REFERENCES "genres"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "series_genres" DROP CONSTRAINT "FK_76732559d297ad04639b3fc75a1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "series_genres" DROP CONSTRAINT "FK_9938fd62ec4732c98673753fcfb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "seasons" DROP CONSTRAINT "FK_f8e1a55592135b94fdd952ac6a5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "episodes" DROP CONSTRAINT "FK_8fc013f436d72d36ab6a5af746f"`,
    );
    await queryRunner.query(`DROP TABLE "series_genres"`);
    await queryRunner.query(`DROP TABLE "series"`);
    await queryRunner.query(`DROP TABLE "seasons"`);
    await queryRunner.query(`DROP TABLE "episodes"`);
  }
}
