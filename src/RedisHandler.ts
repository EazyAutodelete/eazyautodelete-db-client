import ioredis, { Redis } from "ioredis";
import {
  ChannelSettings,
  GuildSettings,
  RedisHandlerConfig,
  UserSettings,
} from "../typings";
import Logger from "../utils/Logger";

export default class RedisHandler {
  config: RedisHandlerConfig;
  redis!: Redis;
  Logger: Logger;
  constructor(config: RedisHandlerConfig, Logger: Logger) {
    this.redis;
    this.config = config;
    this.Logger = Logger;
  }

  async connect(): Promise<void> {
    this.redis = new ioredis(this.config.port, this.config.host, {
      password: this.config.password,
    });
  }

  async getKey(key: string): Promise<string | null> {
    const data = await this.redis.get(key);
    return data;
  }

  async getHashfields(key: string): Promise<Record<string, string>> {
    const data = await this.redis.hgetall(key);
    return data;
  }

  async setHash(
    key: string,
    data: UserSettings | ChannelSettings | GuildSettings | any
  ): Promise<void> {
    const fields = Object.keys(data);
    if (fields.length > 1)
      await this.redis.hmset(key, ...fields.map(field => [field, data[field]]).flat());
    else await this.redis.hset(key, fields[0], data[fields[0]]);
  }

  async deleteKey(key: string): Promise<void> {
    await this.redis.del(key);
  }
}
