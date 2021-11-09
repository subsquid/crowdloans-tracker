const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class auctiontest1636483768161 {
    name = 'auctiontest1636483768161'

    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "parachain_leases" ("id" character varying NOT NULL, "para_id" integer NOT NULL, "lease_range" text NOT NULL, "first_lease" integer NOT NULL, "last_lease" integer NOT NULL, "latest_bid_amount" numeric NOT NULL, "active_for_auction" text, "winning_amount" numeric, "extra_amount" numeric, "won_bid_from" text, "num_block_won" integer, "winning_result_block" integer, "has_won" boolean NOT NULL, "parachain_id" character varying NOT NULL, "auction_id" character varying, CONSTRAINT "PK_fda8294c956880bda2771666a91" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_d1ccf431430ad6ce759c972ddb" ON "parachain_leases" ("parachain_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_7237948a5f4178c1272c69f242" ON "parachain_leases" ("auction_id") `);
        await queryRunner.query(`CREATE TABLE "contribution" ("id" character varying NOT NULL, "account" text NOT NULL, "amount" numeric NOT NULL, "block_num" integer NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "parachain_id" character varying NOT NULL, "fund_id" character varying NOT NULL, CONSTRAINT "PK_878330fa5bb34475732a5883d58" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_676bed3b91141b1f2f4dde1cf2" ON "contribution" ("parachain_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_df5e763df749a70ec9d9762838" ON "contribution" ("fund_id") `);
        await queryRunner.query(`CREATE TABLE "crowdloan" ("id" character varying NOT NULL, "depositor" text NOT NULL, "verifier" text, "cap" numeric NOT NULL, "raised" numeric NOT NULL, "lock_expired_block" integer NOT NULL, "block_num" integer, "first_slot" integer NOT NULL, "last_slot" integer NOT NULL, "status" text NOT NULL, "lease_expired_block" integer, "dissolved_block" integer, "updated_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "is_finished" boolean, "won_auction_id" text, "parachain_id" character varying NOT NULL, CONSTRAINT "PK_19a05e349701577c8c1679ae84d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_005883fcd4519fa5ae88706b3a" ON "crowdloan" ("parachain_id") `);
        await queryRunner.query(`CREATE TABLE "chronicle" ("id" character varying NOT NULL, "cur_auction_id" character varying, "cur_block_num" integer, "cur_lease" integer, "cur_lease_start" integer, "cur_lease_end" integer, CONSTRAINT "PK_1cfaa3cc7527bef31f9c85700f4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_f00a0560b45ec136d79e34d80b" ON "chronicle" ("cur_auction_id") `);
        await queryRunner.query(`CREATE TABLE "parachain" ("id" character varying NOT NULL, "para_id" integer NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "creation_block" integer, "deregistered" boolean NOT NULL, "deposit" numeric NOT NULL, "manager" text NOT NULL, "active_fund_id" character varying, "latest_bid_id" character varying, "chronicle_id" character varying, CONSTRAINT "PK_0f6ac85862a6ca7c8873f699b61" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_09ac4bf23537e5ed0338e00162" ON "parachain" ("active_fund_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_0cdb65f05cd1f552b7d8440189" ON "parachain" ("latest_bid_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_84af721a534ead61258d44fe10" ON "parachain" ("chronicle_id") `);
        await queryRunner.query(`CREATE TABLE "bid" ("id" character varying NOT NULL, "winning_auction" integer, "block_num" integer NOT NULL, "is_crowdloan" boolean NOT NULL, "amount" numeric NOT NULL, "first_slot" integer NOT NULL, "last_slot" integer NOT NULL, "bidder" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "auction_id" character varying NOT NULL, "parachain_id" character varying NOT NULL, "fund_id" character varying, CONSTRAINT "PK_ed405dda320051aca2dcb1a50bb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_9e594e5a61c0f3cb25679f6ba8" ON "bid" ("auction_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_930058fc447bce976650cf08f6" ON "bid" ("parachain_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_1d89857ddf5ad51e46e929c86b" ON "bid" ("fund_id") `);
        await queryRunner.query(`CREATE TABLE "auction" ("id" character varying NOT NULL, "block_num" integer NOT NULL, "status" text NOT NULL, "lease_start" integer, "slots_start" integer NOT NULL, "lease_end" integer, "slots_end" integer NOT NULL, "closing_start" integer NOT NULL, "closing_end" integer NOT NULL, "result_block" integer, "ongoing" boolean NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_9dc876c629273e71646cf6dfa67" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "auction_parachain" ("id" character varying NOT NULL, "block_num" integer NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "first_slot" integer NOT NULL, "last_slot" integer NOT NULL, "auction_id" character varying NOT NULL, "parachain_id" character varying NOT NULL, CONSTRAINT "PK_f405bf3c601f7e5f97d9b1abd94" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_bcdc4b1c157f29429b97a35809" ON "auction_parachain" ("auction_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_09813e8f090426a27be8f78949" ON "auction_parachain" ("parachain_id") `);
        await queryRunner.query(`CREATE TABLE "crowdloan_sequence" ("id" character varying NOT NULL, "cur_index" integer NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "block_num" integer NOT NULL, CONSTRAINT "PK_52c7e654f01224a6592dee9e0b6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "parachain_leases" ADD CONSTRAINT "FK_d1ccf431430ad6ce759c972ddb1" FOREIGN KEY ("parachain_id") REFERENCES "parachain"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "parachain_leases" ADD CONSTRAINT "FK_7237948a5f4178c1272c69f2429" FOREIGN KEY ("auction_id") REFERENCES "auction"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "contribution" ADD CONSTRAINT "FK_676bed3b91141b1f2f4dde1cf28" FOREIGN KEY ("parachain_id") REFERENCES "parachain"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "contribution" ADD CONSTRAINT "FK_df5e763df749a70ec9d97628383" FOREIGN KEY ("fund_id") REFERENCES "crowdloan"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "crowdloan" ADD CONSTRAINT "FK_005883fcd4519fa5ae88706b3a5" FOREIGN KEY ("parachain_id") REFERENCES "parachain"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chronicle" ADD CONSTRAINT "FK_f00a0560b45ec136d79e34d80b0" FOREIGN KEY ("cur_auction_id") REFERENCES "auction"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "parachain" ADD CONSTRAINT "FK_09ac4bf23537e5ed0338e001622" FOREIGN KEY ("active_fund_id") REFERENCES "crowdloan"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "parachain" ADD CONSTRAINT "FK_0cdb65f05cd1f552b7d8440189d" FOREIGN KEY ("latest_bid_id") REFERENCES "bid"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "parachain" ADD CONSTRAINT "FK_84af721a534ead61258d44fe10c" FOREIGN KEY ("chronicle_id") REFERENCES "chronicle"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bid" ADD CONSTRAINT "FK_9e594e5a61c0f3cb25679f6ba8d" FOREIGN KEY ("auction_id") REFERENCES "auction"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bid" ADD CONSTRAINT "FK_930058fc447bce976650cf08f67" FOREIGN KEY ("parachain_id") REFERENCES "parachain"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bid" ADD CONSTRAINT "FK_1d89857ddf5ad51e46e929c86b5" FOREIGN KEY ("fund_id") REFERENCES "crowdloan"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "auction_parachain" ADD CONSTRAINT "FK_bcdc4b1c157f29429b97a35809c" FOREIGN KEY ("auction_id") REFERENCES "auction"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "auction_parachain" ADD CONSTRAINT "FK_09813e8f090426a27be8f789498" FOREIGN KEY ("parachain_id") REFERENCES "parachain"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "auction_parachain" DROP CONSTRAINT "FK_09813e8f090426a27be8f789498"`);
        await queryRunner.query(`ALTER TABLE "auction_parachain" DROP CONSTRAINT "FK_bcdc4b1c157f29429b97a35809c"`);
        await queryRunner.query(`ALTER TABLE "bid" DROP CONSTRAINT "FK_1d89857ddf5ad51e46e929c86b5"`);
        await queryRunner.query(`ALTER TABLE "bid" DROP CONSTRAINT "FK_930058fc447bce976650cf08f67"`);
        await queryRunner.query(`ALTER TABLE "bid" DROP CONSTRAINT "FK_9e594e5a61c0f3cb25679f6ba8d"`);
        await queryRunner.query(`ALTER TABLE "parachain" DROP CONSTRAINT "FK_84af721a534ead61258d44fe10c"`);
        await queryRunner.query(`ALTER TABLE "parachain" DROP CONSTRAINT "FK_0cdb65f05cd1f552b7d8440189d"`);
        await queryRunner.query(`ALTER TABLE "parachain" DROP CONSTRAINT "FK_09ac4bf23537e5ed0338e001622"`);
        await queryRunner.query(`ALTER TABLE "chronicle" DROP CONSTRAINT "FK_f00a0560b45ec136d79e34d80b0"`);
        await queryRunner.query(`ALTER TABLE "crowdloan" DROP CONSTRAINT "FK_005883fcd4519fa5ae88706b3a5"`);
        await queryRunner.query(`ALTER TABLE "contribution" DROP CONSTRAINT "FK_df5e763df749a70ec9d97628383"`);
        await queryRunner.query(`ALTER TABLE "contribution" DROP CONSTRAINT "FK_676bed3b91141b1f2f4dde1cf28"`);
        await queryRunner.query(`ALTER TABLE "parachain_leases" DROP CONSTRAINT "FK_7237948a5f4178c1272c69f2429"`);
        await queryRunner.query(`ALTER TABLE "parachain_leases" DROP CONSTRAINT "FK_d1ccf431430ad6ce759c972ddb1"`);
        await queryRunner.query(`DROP TABLE "crowdloan_sequence"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_09813e8f090426a27be8f78949"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bcdc4b1c157f29429b97a35809"`);
        await queryRunner.query(`DROP TABLE "auction_parachain"`);
        await queryRunner.query(`DROP TABLE "auction"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1d89857ddf5ad51e46e929c86b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_930058fc447bce976650cf08f6"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9e594e5a61c0f3cb25679f6ba8"`);
        await queryRunner.query(`DROP TABLE "bid"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_84af721a534ead61258d44fe10"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0cdb65f05cd1f552b7d8440189"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_09ac4bf23537e5ed0338e00162"`);
        await queryRunner.query(`DROP TABLE "parachain"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f00a0560b45ec136d79e34d80b"`);
        await queryRunner.query(`DROP TABLE "chronicle"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_005883fcd4519fa5ae88706b3a"`);
        await queryRunner.query(`DROP TABLE "crowdloan"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_df5e763df749a70ec9d9762838"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_676bed3b91141b1f2f4dde1cf2"`);
        await queryRunner.query(`DROP TABLE "contribution"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7237948a5f4178c1272c69f242"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d1ccf431430ad6ce759c972ddb"`);
        await queryRunner.query(`DROP TABLE "parachain_leases"`);
    }
}
