require('dotenv').config();

export const TOKEN = process.env.TOKEN as string;
export const MONGO = process.env.MONGO as string;
export const REDIS = {
  HOST: process.env.REDIS_HOST as string,
  PORT: process.env.REDIS_PORT as string,
};
