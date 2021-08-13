const { SlashCommandBuilder, SlashCommandSubcommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("council")
    .setDescription("Rolls a dice")
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("decision")
        .setDescription("Submit the council's decision")
        .addIntegerOption((option) => option.setName("decision").setDescription("The required DC").setRequired(true))
    ),
  async execute(interaction, client) {
    console.log("The council has convened");
  },
};
