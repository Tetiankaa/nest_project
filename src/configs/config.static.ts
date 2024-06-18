import * as process from 'node:process';

import * as dotenv from 'dotenv';

import configs from './configs';
import { Configs } from './configs.type';

class ConfigStatic {
  public get(): Configs {
    return configs();
  }
}

const environment = process.env.APP_ENVIRONMENT || 'local';
dotenv.config({ path: `environments/${environment}.env` });
const ConfigStaticService = new ConfigStatic();
export { ConfigStaticService };
