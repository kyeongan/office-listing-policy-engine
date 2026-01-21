import "reflect-metadata";
import { DataSource, Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";

@Entity()
export class Street {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column("float")
    avg_price!: number;

    @OneToMany(() => Building, building => building.street)
    buildings!: Building[];
}

@Entity()
export class Building {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    on_market!: boolean;

    @Column()
    street_id!: number;

    @ManyToOne(() => Street, street => street.buildings)
    @JoinColumn({ name: "street_id" })
    street!: Street;

    @OneToMany(() => Office, office => office.building)
    offices!: Office[];
}

@Entity()
export class Office {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    occupied!: boolean;

    @Column()
    building_id!: number;

    @ManyToOne(() => Building, building => building.offices)
    @JoinColumn({ name: "building_id" })
    building!: Building;

    @OneToMany(() => RuleRecord, ruleRecord => ruleRecord.office)
    ruleRecords!: RuleRecord[];
}

@Entity()
export class RuleRecord {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    office_id!: number;

    @Column("text")
    criteria!: string;

    @ManyToOne(() => Office, office => office.ruleRecords)
    @JoinColumn({ name: "office_id" })
    office!: Office;
}

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USER || "user",
    password: process.env.DB_PASSWORD || "password",
    database: process.env.DB_NAME || "policy_engine_db",
    synchronize: true,
    logging: false,
    entities: [Street, Building, Office, RuleRecord],
    migrations: [],
    subscribers: [],
});

import logger from "../logger.js";
// ... (keep existing imports)

// ... (keep entity definitions)

// ... (keep AppDataSource definition)

const maxRetries = 5;
const retryDelay = 3000; // 3 seconds

export const connectDb = async () => {
  if (AppDataSource.isInitialized) {
    logger.info("Database already connected.");
    return;
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await AppDataSource.initialize();
      logger.info("Database connected successfully!");
      return; // Exit on successful connection
    } catch (error) {
      const errorCode = (error instanceof Error && 'code' in error) ? (error as any).code : 'UNKNOWN';
      logger.warn({ attempt, maxRetries, errorCode }, `Attempt to connect to the database failed.`);
      if (attempt === maxRetries) {
        logger.error({ error }, "All attempts to connect to the database failed. Exiting.");
        process.exit(1);
      }
      // Wait before the next retry
      await new Promise(res => setTimeout(res, retryDelay));
    }
  }
};
