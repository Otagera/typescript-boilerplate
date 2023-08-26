/* eslint-disable @typescript-eslint/naming-convention */
import { WorkersAPIEnvironment, MainAPIEnvironment } from './types';

export abstract class IConfigService {
  ENV: string;

  LOG_LEVEL: string;
  pino: {
    timeZone: string;
  };
  database: {
    host: string;
    port: number;
    user: string;
    pass: string;
  };

  redis: {
    url: string;
    port: number;
    ttl: number;
  };

  awsConfig: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    url: string;
  };

  mongodb: {
    connectionString: string;
    pinoConnectionString: string;
  };

  mainAPI: MainAPIEnvironment;

  workersAPI: WorkersAPIEnvironment;

  ipToken: string;
  ipInfoUrl: string;
  ipInfoTimeOut: string;
}
