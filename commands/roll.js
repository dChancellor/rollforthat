const {
  SlashCommandBuilder,
  SlashCommandSubcommandGroupBuilder,
  SlashCommandSubcommandBuilder,
} = require("@discordjs/builders");

const addDiceSlashCommand = (sides) => {
  return new SlashCommandSubcommandBuilder()
    .setName(`d${sides}`)
    .setDescription(`Rolls a ${sides} sided dice`)
    .addIntegerOption((option) => option.setName("count").setDescription("The number of dice to roll"));
};

const addCheckSlashCommand = (check) => {
  return new SlashCommandSubcommandBuilder()
    .setName(check)
    .setDescription(`Rolls a ${check} check`)
    .addStringOption((option) =>
      option.setName("reason").setDescription(`The reason for the ${check} check`).setRequired(true)
    )
    .addUserOption((option) => option.setName("against").setDescription("The user to roll against"));
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("roll")
    .setDescription("Rolls a dice")
    .addSubcommandGroup(
      new SlashCommandSubcommandGroupBuilder()
        .setName("check")
        .setDescription("Rolls a check")
        .addSubcommand(addCheckSlashCommand("strength"))
        .addSubcommand(addCheckSlashCommand("dexterity"))
        .addSubcommand(addCheckSlashCommand("constitution"))
        .addSubcommand(addCheckSlashCommand("intelligence"))
        .addSubcommand(addCheckSlashCommand("wisdom"))
        .addSubcommand(addCheckSlashCommand("charisma"))
        .addSubcommand(addCheckSlashCommand("athletics"))
        .addSubcommand(addCheckSlashCommand("acrobatics"))
        .addSubcommand(addCheckSlashCommand("sleight-of-hand"))
        .addSubcommand(addCheckSlashCommand("stealth"))
        .addSubcommand(addCheckSlashCommand("arcana"))
        .addSubcommand(addCheckSlashCommand("history"))
        .addSubcommand(addCheckSlashCommand("investigation"))
        .addSubcommand(addCheckSlashCommand("nature"))
        .addSubcommand(addCheckSlashCommand("religion"))
        .addSubcommand(addCheckSlashCommand("animal-handling"))
        .addSubcommand(addCheckSlashCommand("insight"))
        .addSubcommand(addCheckSlashCommand("medicine"))
        .addSubcommand(addCheckSlashCommand("perception"))
        .addSubcommand(addCheckSlashCommand("survival"))
        .addSubcommand(addCheckSlashCommand("deception"))
        .addSubcommand(addCheckSlashCommand("intimidation"))
        .addSubcommand(addCheckSlashCommand("performance"))
        .addSubcommand(addCheckSlashCommand("persuasion"))
    )
    .addSubcommandGroup(
      new SlashCommandSubcommandGroupBuilder()
        .setName("dice")
        .setDescription("Rolls a N sided dice")
        .addSubcommand(addDiceSlashCommand(2))
        .addSubcommand(addDiceSlashCommand(4))
        .addSubcommand(addDiceSlashCommand(6))
        .addSubcommand(addDiceSlashCommand(8))
        .addSubcommand(addDiceSlashCommand(10))
        .addSubcommand(addDiceSlashCommand(20))
        .addSubcommand(addDiceSlashCommand(100))
    ),
  async execute(interaction) {
    if (interaction.options._group === "check") commandCheck(interaction);
    if (interaction.options._group === "dice") commandDice(interaction);
  },
};

const rollDice = (numberOfSides) => {
  return Math.ceil(Math.random() * numberOfSides);
};

const commandCheck = async (interaction) => {
  let rollResult = rollDice(20);
  await interaction.reply(`${rollResult}`);
};
const commandDice = async (interaction) => {
  const numberOfDice = interaction.options.getInteger("count") || 1;
  if (numberOfDice > 5) return interaction.reply("Stop trying to break the system and select fewer than 5 dice");
  const numberOfSides = interaction.options.getSubcommand().slice(1);
  let response = "**```";
  for (let i = 0; i < numberOfDice; i++) {
    response += `Roll #${i + 1}: ${rollDice(numberOfSides)} \n`;
  }
  response += "```**";
  await interaction.reply(response);
};
