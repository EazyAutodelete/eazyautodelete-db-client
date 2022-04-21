import RedisHandler from "./RedisHandler";
import MongoHandler from "./MongoHandler";
import {
  ChannelSettings,
  DatabaseHandlerConfig,
  GuildSettings,
  UserSettings,
} from "../typings";
import Logger from "../utils/Logger";

export default class DatabaseHandler {
  connected: boolean;
  Logger: Logger;
  mongo: MongoHandler;
  redis: RedisHandler;
  config: DatabaseHandlerConfig;
  constructor(config: DatabaseHandlerConfig, Logger: Logger) {
    this.connected = false;
    this.Logger = Logger;
    this.mongo = new MongoHandler(config.mongo, this.Logger);
    this.redis = new RedisHandler(config.redis, this.Logger);
    this.config = config;
  }

  // Connects the databases
  async connect() {
    await this.mongo.connect();
    await this.redis.connect();

    this.connected = true;

    this.Logger.info("🧰 Databases connected", "DATA");
  }

  // user
  // Gets settings from a user
  async getUserSettings(userId: string): Promise<UserSettings> {
    let redisData = await this.redis.getHashfields(`user_${userId}`);
    if (redisData?.id) {
      return {
        id: redisData.id,
        registered: parseInt(redisData.registered),
        language: redisData.language,
      };
    }
    let data =
      (await this.mongo.getUserSettings(userId)) ||
      (await this.mongo.createUserSettings(userId));

    let formattedData = {
      id: data.id,
      registered: data.registered,
      language: data.language,
    };

    await this.redis.setHash(`user_${userId}`, formattedData);
    return formattedData;
  }

  // Creates settings for a user
  async createUserSettings(
    userId: string,
    {
      lang = "de",
      registered = new Date().getTime(),
    }: { lang?: string; registered?: number } = {}
  ): Promise<UserSettings> {
    let data = await this.mongo.createUserSettings(userId, {
      lang,
      registered,
    });

    await this.redis.setHash(`user_${userId}`, {
      id: data.id,
      registered: data.registered,
      language: data.language,
    });

    return {
      id: data.id,
      registered: data.registered,
      language: data.language,
    };
  }

  // Deletes the settings from an user
  async deleteUserSettings(userId: string) {
    await this.redis.deleteKey(`user_${userId}`);
    await this.mongo.deleteUserSettings(userId);
  }

  // Updates the settings from an useer
  async updateUserSettings(
    userId: string,
    { lang, registered }: { lang?: string; registered?: number } = {}
  ): Promise<UserSettings> {
    let data = await this.mongo.getUserSettings(userId);
    if (!data)
      return await this.mongo.createUserSettings(userId, { lang, registered });

    await this.deleteUserSettings(userId);
    return await this.createUserSettings(userId, {
      lang: lang || data.language,
      registered: registered || data.registered,
    });
  }

  // Deletes the redis cache from an user
  async deleteUserCache(userId: string): Promise<void> {
    await this.redis.deleteKey(`user_${userId}`);
  }

  // Updates the redis cache from an user
  async updateUserCache(userId: string): Promise<void> {
    let data =
      (await this.mongo.getUserSettings(userId)) ||
      (await this.mongo.createUserSettings(userId));

    await this.redis.setHash(`user_${userId}`, {
      id: data.id,
      registered: data.registered,
      language: data.language,
    });
  }

  // guilds
  // Gets the settings from a guild
  async getGuildSettings(guildId: string): Promise<GuildSettings> {
    let redisData = await this.redis.getHashfields(`guild_${guildId}`);
    if (redisData?.id) {
      return {
        id: redisData.id,
        registered: parseInt(redisData.registered),
        prefix: redisData.prefix,
        premium: JSON.parse(redisData.premium),
        adminroles:
          redisData.adminroles === "null"
            ? []
            : redisData.adminroles.split("_"),
        modroles:
          redisData.modroles === "null" ? [] : redisData.modroles.split("_"),
      };
    }

    let data =
      (await this.mongo.getGuildSettings(guildId)) ||
      (await this.mongo.createGuildSettings(guildId));

    await this.redis.setHash(`guild_${guildId}`, {
      id: data.id,
      registered: data.registered,
      prefix: data.prefix,
      premium: data.premium,
      adminroles: `${
        data.adminroles?.length >= 1 ? data.adminroles.join("_") : null
      }`,
      modroles: `${
        data.modroles?.length >= 1 ? data.modroles.join("_") : null
      }`,
    });
    return {
      id: data.id,
      registered: data.registered,
      prefix: data.prefix,
      premium: data.premium,
      adminroles: data.adminroles,
      modroles: data.modroles,
    };
  }

  // Creates settings for a guild
  async createGuildSettings(
    guildId: string,
    {
      registered,
      prefix,
      premium,
      adminroles,
      modroles,
    }: {
      registered?: number;
      prefix?: string;
      premium?: boolean;
      adminroles?: Array<string>;
      modroles?: Array<string>;
    }
  ): Promise<GuildSettings> {
    let data = await this.mongo.createGuildSettings(guildId, {
      registered,
      prefix,
      premium,
      adminroles,
      modroles,
    });

    await this.redis.setHash(`guild_${guildId}`, {
      id: data.id,
      registered: data.registered,
      prefix: data.prefix,
      premium: data.premium,
      adminroles: `${
        data.adminroles?.length >= 1 ? data.adminroles.join("_") : null
      }`,
      modroles: `${
        data.modroles?.length >= 1 ? data.modroles.join("_") : null
      }`,
    });

    return {
      id: data.id,
      registered: data.registered,
      prefix: data.prefix,
      premium: data.premium,
      adminroles: data.adminroles,
      modroles: data.modroles,
    };
  }

  // Deletes settings from a guild
  async deleteGuildSettings(guildId: string): Promise<void> {
    await this.redis.deleteKey(`guild_${guildId}`);
    await this.mongo.deleteGuildSettings(guildId);
  }

  // Updates settings from a guild
  async updateGuildSettings(
    guildId: string,
    {
      registered,
      prefix,
      premium,
      adminroles,
      modroles,
    }: {
      registered?: number;
      prefix?: string;
      premium?: boolean;
      adminroles?: Array<string>;
      modroles?: Array<string>;
    } = {}
  ): Promise<GuildSettings> {
    let data = await this.mongo.getGuildSettings(guildId);
    if (!data)
      return await this.createGuildSettings(guildId, {
        registered,
        prefix,
        premium,
        adminroles,
        modroles,
      });

    await this.deleteGuildSettings(guildId);

    return await this.createGuildSettings(guildId, {
      registered: registered || data.registered,
      prefix: prefix || data.prefix,
      premium: premium || data.premium,
      adminroles: adminroles || data.adminroles,
      modroles: modroles || data.modroles,
    });
  }

  async deleteGuildCache(guildId: string): Promise<void> {
    await this.redis.deleteKey(`guild_${guildId}`);
  }

  async updateGuildCache(guildId: string): Promise<void> {
    let data =
      (await this.mongo.getGuildSettings(guildId)) ||
      (await this.mongo.createGuildSettings(guildId));

    await this.redis.setHash(`guild_${guildId}`, {
      id: data.id,
      registered: data.registered,
      prefix: data.prefix,
      premium: data.premium,
      adminroles: `${
        data.adminroles?.length >= 1 ? data.adminroles.join("_") : null
      }`,
      modroles: `${
        data.modroles?.length >= 1 ? data.modroles.join("_") : null
      }`,
    });
  }

  // channels
  async getChannelSettings(
    channelId: string,
    guild: string
  ): Promise<ChannelSettings> {
    let redisData = await this.redis.getHashfields(`channel_${channelId}`);

    if (redisData?.id)
      return {
        id: redisData.id,
        guild: redisData.guild,
        registered: parseInt(redisData.registered),
        limit: isNaN(parseInt(redisData.limit)) ? 0 : parseInt(redisData.limit), // Zeit in ms oder Nachrichten Anzahl
        mode: parseInt(redisData.mode),
        ignore: redisData.ignore === "null" ? [] : redisData.ignore.split("_"),
        filters:
          redisData.filters === "null"
            ? []
            : redisData.filters.split("_").map((x) => parseInt(x)),
        regex: redisData.regex === "null" ? null : new RegExp(redisData.regex),
        filterUsage: redisData.filterUsage,
      };

    let data =
      (await this.mongo.getChannelSettings(channelId)) ||
      (await this.mongo.createChannelSettings(channelId, guild));

    await this.redis.setHash(`channel_${channelId}`, {
      id: data.id,
      guild: data.guild,
      registered: data.registered,
      limit: data.limit, // Zeit in ms oder Nachrichten Anzahl
      mode: data.mode,
      ignore: data.ignore.length >= 1 ? `${data.ignore.join("_")}` : "null",
      filters: data.filters.length >= 1 ? `${data.filters.join("_")}` : "null",
      regex: `${data.regex}`,
      filterUsage: data.filterUsage,
    });

    return {
      id: data.id,
      guild: data.guild,
      registered: data.registered,
      limit: data.limit, // Zeit in ms oder Nachrichten Anzahl
      mode: data.mode,
      ignore: data.ignore,
      filters: data.filters,
      regex: data.regex,
      filterUsage: data.filterUsage,
    };
  }

  async createChannelSettings(
    channelId: string,
    guild: string,
    {
      registered,
      limit,
      mode,
      ignore,
      filters,
      regex,
      filterUsage,
    }: {
      registered?: number;
      limit?: number;
      mode?: number;
      ignore?: Array<string>;
      filters?: Array<number>;
      regex?: RegExp | null;
      filterUsage?: string;
    } = {}
  ): Promise<ChannelSettings> {
    let data = await this.mongo.createChannelSettings(channelId, guild, {
      registered,
      limit,
      mode,
      ignore,
      filters,
      regex,
      filterUsage,
    });

    await this.redis.setHash(`channel_${channelId}`, {
      id: data.id,
      guild: data.guild,
      registered: data.registered,
      limit: data.limit, // Zeit in ms oder Nachrichten Anzahl
      mode: data.mode,
      ignore: data.ignore.length >= 1 ? `${data.ignore.join("_")}` : null,
      filters: data.filters.length >= 1 ? `${data.filters.join("_")}` : null,
      regex: `${data.regex}`,
      filterUsage: data.filterUsage,
    });

    return {
      id: data.id,
      guild: data.guild,
      registered: data.registered,
      limit: data.limit, // Zeit in ms oder Nachrichten Anzahl
      mode: data.mode,
      ignore: data.ignore,
      filters: data.filters,
      regex: data.regex,
      filterUsage: data.filterUsage,
    };
  }

  async deleteChannelSettings(channelId: string): Promise<void> {
    await this.redis.deleteKey(`channel_${channelId}`);
    await this.mongo.deleteChannelSettings(channelId);
  }

  async updateChannelSettings(
    channelId: string,
    guild: string,
    {
      registered,
      limit,
      mode,
      ignore,
      filters,
      regex,
      filterUsage,
    }: {
      registered?: number;
      limit?: number;
      mode?: number;
      ignore?: Array<string>;
      filters?: Array<number>;
      regex?: RegExp | null;
      filterUsage?: string;
    }
  ): Promise<ChannelSettings> {
    let data = await this.mongo.getChannelSettings(channelId);
    if (!data)
      return await this.createChannelSettings(channelId, guild, {
        registered,
        limit,
        mode,
        ignore,
        filters,
        regex,
        filterUsage,
      });

    await this.deleteChannelSettings(channelId);

    return await this.createChannelSettings(channelId, guild, {
      registered: registered || data.registered,
      limit: limit || data.limit,
      mode: mode || data.mode,
      ignore: ignore || data.ignore,
      filters: filters || data.filters,
      regex: regex || data.regex,
      filterUsage: filterUsage || data.filterUsage,
    });
  }

  async deleteChannelCache(channelId: string): Promise<void> {
    await this.redis.deleteKey(`channel_${channelId}`);
  }

  async updateChannelCache(channelId: string, guild: string): Promise<void> {
    let data =
      (await this.mongo.getChannelSettings(channelId)) ||
      (await this.mongo.createChannelSettings(channelId, guild));

    await this.redis.setHash(`channel_${channelId}`, {
      id: data.id,
      guild: data.guild,
      registered: data.registered,
      limit: data.limit,
      mode: data.mode,
      ignore: data.ignore.length >= 1 ? `${data.ignore.join("_")}` : null,
      filters: data.filters.length >= 1 ? `${data.filters.join("_")}` : null,
      regex: `${data.regex}`,
      filterUsage: data.filterUsage,
    });
  }
}
