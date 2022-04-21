import mongoose, { Mongoose } from "mongoose";
import {
  ChannelSettings,
  GuildSettings,
  MongoHandlerConfig,
  UserSettings,
} from "../typings";
import Logger from "../utils/Logger";
import guild from "../schemas/guild";
import channel from "../schemas/channel";
import user from "../schemas/user";

class MongoHandler {
  mongo: typeof mongoose;
  config: MongoHandlerConfig;
  Logger: Logger;
  guild: typeof guild;
  channel: typeof channel;
  user: typeof user;
  constructor(config: MongoHandlerConfig, Logger: Logger) {
    this.mongo = mongoose;
    this.config = config;
    this.Logger = Logger;
    this.guild = guild;
    this.channel = channel;
    this.user = user;
  }

  async connect() {
    await this.mongo.connect(this.config.uri);
  }

  // users
  async getUserSettings(userId: string): Promise<UserSettings | undefined> {
    const data = await this.user.findOne({ id: userId });
    return data
      ? {
          id: data.id,
          registered: data.registered,
          language: data.language,
        }
      : undefined;
  }

  async createUserSettings(
    userId: string,
    {
      lang = "en",
      registered = new Date().getTime(),
    }: { lang?: string; registered?: number } = {}
  ): Promise<UserSettings> {
    const data = await this.user.create({
      id: userId,
      language: lang,
      registered: registered,
    });
    return {
      id: data.id,
      registered: data.registered,
      language: data.language,
    };
  }

  async deleteUserSettings(userId: string): Promise<void> {
    await this.user.deleteOne({ id: userId });
    return;
  }

  // guilds
  async getGuildSettings(guildId: string): Promise<GuildSettings | undefined> {
    const data = await this.guild.findOne({ id: guildId });
    return data
      ? {
          id: data.id,
          registered: data.registered,
          prefix: data.prefix,
          premium: data.premium,
          adminroles: data.adminroles,
          modroles: data.modroles,
        }
      : undefined;
  }

  async createGuildSettings(
    guildId: string,
    {
      registered = new Date().getTime(),
      prefix = "%",
      premium = false,
      adminroles = [],
      modroles = [],
    }: {
      registered?: number;
      prefix?: string;
      premium?: boolean;
      adminroles?: Array<string>;
      modroles?: Array<string>;
    } = {}
  ): Promise<GuildSettings> {
    const data = await this.guild.create({
      id: guildId,
      registered: registered,
      prefix: prefix,
      premium: premium,
      adminroles: adminroles,
      modroles: modroles,
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

  async deleteGuildSettings(guildId: string): Promise<void> {
    await this.guild.deleteOne({ id: guildId });
    return;
  }

  // channels
  async getChannelSettings(
    channelId: string
  ): Promise<ChannelSettings | undefined> {
    const data = await this.channel.findOne({ id: channelId });
    return data
      ? {
          id: data.id,
          guild: data.guild,
          registered: data.registered,
          limit: data.limit,
          mode: data.mode,
          ignore: data.ignore,
          filters: data.filters,
          regex: data.regex,
          filterUsage: data.filterUsage,
        }
      : undefined;
  }

  async createChannelSettings(
    channelId: string,
    guild: string,
    {
      registered = new Date().getTime(),
      limit = 0,
      mode = 0,
      ignore = [],
      filters = [],
      regex = null,
      filterUsage = "one",
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
    const data = await this.channel.create({
      id: channelId,
      guild: guild,
      registered: registered,
      limit: limit,
      mode: mode,
      ignore: ignore,
      filters: filters,
      regex: regex,
      filterUsage: filterUsage,
    });
    return {
      id: data.id,
      guild: data.guild,
      registered: data.registered,
      limit: data.limit,
      mode: data.mode,
      ignore: data.ignore,
      filters: data.filters,
      regex: data.regex,
      filterUsage: data.filterUsage,
    };
  }

  async deleteChannelSettings(channelId: string): Promise<void> {
    await this.channel.deleteOne({ id: channelId });
    return;
  }
}

export default MongoHandler;
