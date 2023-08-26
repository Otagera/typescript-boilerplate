export interface MainAPIEnvironment {
  port: number;
}

export interface WorkersAPIEnvironment {
  port: number;
}

export enum MainAPI {
  PORT = 'PORT',
}

export enum WorkersAPI {
  PORT = 'WORKERS_API_PORT',
}
