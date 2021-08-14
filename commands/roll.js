const Jumble = require("jumble-words");
const jumble = new Jumble();
const db = require("../db/database");
const { rollDice } = require("./utils/helper");

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
    .addUserOption((option) => option.setName("target").setDescription("The user to roll against"));
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
  async execute(interaction, client) {
    let channel = client.channels.cache.get(interaction.channel.id);
    if (interaction.options._group === "check") commandCheck(interaction, channel, client);
    if (interaction.options._group === "dice") commandDice(interaction);
  },
};

const generateSpell = () => {
  let random = jumble.generate(3);
  let spell = random.reduce((str, word) => {
    return (str += ` ${word.jumble} . .`);
  }, ". . .");
  return (spell += "!");
};

const createCouncilThread = async (interaction, channel, client) => {
  const instigator = interaction.user;
  const target = interaction.options.getUser("target");
  const reason = interaction.options.getString("reason");
  const guildIsPremium = interaction.member.guild.premiumSubscriptionCount > 15;
  let newThread = await channel.threads.create({
    name: "Council Meeting",
    autoArchiveDuration: 1440,
    type: guildIsPremium ? "GUILD_PRIVATE_THREAD" : "GUILD_PUBLIC_THREAD",
    reason: `${instigator.username} has targeted ${target.username} ${reason}`,
  });
  const spell = generateSpell();
  const thread = client.channels.cache.get(newThread.id);
  let council = await db.getAllUsersExceptEncounterMembers([instigator.id, target?.id]);
  await Promise.all(
    council.map(({ discordID }) => {
      thread.members.add(discordID);
    })
  );
  await thread.send(spell);
  if (target)
    await thread.send(
      `This council has been summoned to make a decision. ${instigator.username} has targeted ${target.username} ${reason}. Tread carefully and think wisely. Summon me once you have come to a consensus!`
    );
  if (!target)
    await thread.send(
      `This council has been summoned to make a decision. ${instigator.username} is attempting ${reason}.  Tread carefully and think wisely. Summon me once you have come to a consensus!`
    );

  return newThread.id;
};

const commandCheck = async (interaction, channel, client) => {
  if (interaction.channel.isThread()) return interaction.reply("The council does not approve your foolishness.");
  const instigator = interaction.user;
  const target = interaction.options.getUser("target");
  const reason = interaction.options.getString("reason");
  let encounterID = await createCouncilThread(interaction, channel, client);
  await db.createNewEncounter({
    type: "check",
    checkType: interaction.options.getSubcommand(),
    originalChannelID: interaction.channel.id,
    encounterID,
    instigator,
    target,
    reason,
  });
  await interaction.reply(`Convening the council . . .`);
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
