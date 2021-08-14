require("dotenv").config();

const discordToken = process.env.ROLLFORTHAT_DISCORD_TOKEN;

const uri = `mongodb://${process.env.MONGO_USERNAME}:${encodeURIComponent(process.env.MONGO_PASSWORD)}@${
  process.env.MONGO_HOST
}:${process.env.MONGO_PORT}/${process.env.ROLLFORTHAT_MONGO_DB}?authSource=admin`;

module.exports = { discordToken, uri };
