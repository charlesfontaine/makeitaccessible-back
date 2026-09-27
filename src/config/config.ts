import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  connectionString: string;
}

if (!process.env.CONNECTION_STRING)
  throw new Error('CONNECTION_STRING is missing');

const config: Config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  connectionString: process.env.CONNECTION_STRING
}

export default config;