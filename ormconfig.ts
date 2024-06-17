import * as path from 'node:path';

import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';

import getter from './src/configs/configs';

dotenv.config({ path: './environments/local.env' });
const databaseConfig = getter().database;
export default new DataSource({
  type: 'postgres',
  host: databaseConfig.host,
  port: databaseConfig.port,
  username: databaseConfig.username,
  password: databaseConfig.password,
  database: databaseConfig.db_name,
  entities: [
    path.join(process.cwd(), 'src', 'database', 'entities', '*.entity.ts'),
  ],
  migrations: [
    path.join(process.cwd(), 'src', 'database', 'migrations', '*.ts'),
  ],
  synchronize: false,
});
