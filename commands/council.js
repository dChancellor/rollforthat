const { SlashCommandBuilder, SlashCommandSubcommandBuilder } = require("@discordjs/builders");
const { rollDice, determineAbilityScoreModifier } = require("./utils/helper");
const db = require("../db/database");

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
    let encounter = await db.getEncounter(interaction.channel.id);
    const abilityScore = await db.getUserAbilityScore(encounter.instigator.id, encounter.checkType);
    let rollModifier = determineAbilityScoreModifier(abilityScore);
    let result = rollDice(20) + rollModifier;
    interaction.reply("Thank you for your wise decision. The die has been cast.");
    if (result >= interaction.options.getInteger("decision")) {
      await db.addXP(encounter.instigator.id, 100, "The Council", "Successful check");
      await client.channels.cache.get(encounter.originalChannelID).send("You have been successful!");
    } else {
      await client.channels.cache
        .get(encounter.originalChannelID)
        .send("You have failed your check now reap the consequences!");
    }
    await client.channels.cache.get(encounter.encounterID).setArchived(true);
  },
};
