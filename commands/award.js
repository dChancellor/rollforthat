const { SlashCommandBuilder, SlashCommandSubcommandBuilder } = require("@discordjs/builders");
const db = require("../db/database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("award")
    .setDescription("Gives another player something")
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("xp")
        .setDescription("Submit the council's decision")
        .addUserOption((option) => option.setName("target").setDescription("The recipient").setRequired(true))
        .addIntegerOption((option) => option.setName("xp").setDescription("The amount of XP").setRequired(true))
        .addStringOption((option) =>
          option.setName("reason").setDescription("The reason they earned this xp").setRequired(true)
        )
    ),
  async execute(interaction) {
    if (interaction.options.getSubcommand() === "xp") awardXP(interaction);
  },
};

const awardXP = async (interaction) => {
  let giver = interaction.user;
  let target = interaction.options.getUser("target");
  let xp = interaction.options.getInteger("xp");
  let reason = interaction.options.getString("reason");
  await db.addXP(target.id, xp, giver, reason);
  interaction.reply(`You have awarded ${target.username} ${xp} experience!`);
};
