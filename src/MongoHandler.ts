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
import { DataManager } from "discord.js";

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
  async getUserSettings(userId: string): Promise<UserSettings | null> {
    const data: UserSettings | null = await this.user.findOne({ id: userId });
    return data
      ? {
          id: data.id,
          registered: data.registered,
          language: data.language,
        }
      : null;
  }

  async updateUserSettings(
    userId: string,
    { lang, registered }: { lang?: string; registered?: number } = {}
  ): Promise<UserSettings> {
    const data: UserSettings =
      (await this.user.findOne({ id: userId })) ||
      (await this.user.create({
        id: userId,
        language: lang,
        registered,
      }));
    const updatedData = await this.user.findOneAndUpdate(
      { id: userId },
      {
        $set: {
          language: lang || data.language,
          registered: registered || data.registered,
        },
      }
    );
    return {
      id: updatedData.id,
      registered: updatedData.registered,
      language: updatedData.language,
    };
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
  async getGuildSettings(guildId: string): Promise<GuildSettings | null> {
    const data: GuildSettings | null = await this.guild.findOne({
      id: guildId,
    });
    return data
      ? {
          id: data.id,
          registered: data.registered,
          prefix: data.prefix,
          premium: data.premium,
          adminroles: data.adminroles,
          modroles: data.modroles,
        }
      : null;
  }

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
    const data: GuildSettings =
      (await this.guild.findOne({ id: guildId })) ||
      (await this.guild.create({
        id: guildId,
        registered,
        prefix,
        premium,
        adminroles,
        modroles,
      }));
    const updatedData = await this.guild.findOneAndUpdate(
      { id: guildId },
      {
        $set: {
          registered: registered || data.registered,
          prefix: prefix || data.prefix,
          premium: premium || data.prefix,
          adminroles: adminroles || data.adminroles,
          modroles: modroles || data.modroles,
        },
      },
      { new: true }
    );
    return {
      id: updatedData.id,
      registered: updatedData.registered,
      prefix: updatedData.prefix,
      premium: updatedData.premium,
      adminroles: updatedData.adminroles,
      modroles: updatedData.modroles,
    };
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
  async getChannelSettings(channelId: string): Promise<ChannelSettings | null> {
    const data: ChannelSettings | null = await this.channel.findOne({
      id: channelId,
    });
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
      : null;
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
    } = {}
  ): Promise<ChannelSettings> {
    const data: ChannelSettings =
      (await this.channel.findOne({ id: channelId, guild: guild })) ||
      (await this.channel.create({
        id: channelId,
        guild: guild,
        registered: registered,
        limit: limit,
        mode: mode,
        ignore: ignore,
        filters: filters,
        regex: regex,
        filterUsage: filterUsage,
      }));
    const updatedData = await this.channel.findOneAndUpdate(
      { id: channelId, guild: guild },
      {
        $set: {
          registered: registered || data.registered,
          limit: limit || data.limit,
          mode: mode || data.mode,
          ignore: ignore || data.ignore,
          filters: filters || data.filters,
          regex: regex || data.regex,
          filterUsage: filterUsage || data.filterUsage,
        },
      },
      { new: true }
    );
    return {
      id: updatedData.id,
      guild: updatedData.guild,
      registered: updatedData.registered,
      limit: updatedData.limit,
      mode: updatedData.mode,
      ignore: updatedData.ignore,
      filters: updatedData.filters,
      regex: updatedData.regex,
      filterUsage: updatedData.filterUsage,
    };
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
