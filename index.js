const { Client, Collection, Intents } = require("discord.js");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { discordToken } = require("./config.js");
const fs = require("fs");

const db = require("./db/database");
db.connect().then(() => {
  console.log("Connected!");
});
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
client.commands = new Collection();

const commands = [];
const commandFiles = fs.readdirSync("./commands").filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
  client.commands.set(command.data.name, command);
}

// const rest = new REST({ version: "9" }).setToken(discordToken);

// (async () => {
//   try {``
//     console.log("Started refreshing application (/) commands.");

//     await rest.put(Routes.applicationGuildCommands("875453249547817011", "685350733410992128"), { body: commands });

//     console.log("Successfully reloaded application (/) commands.");
//   } catch (error) {
//     console.error(error);
//   }
// })();

client.once("ready", () => {
  console.log("Ready!");
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;
  if (!client.commands.has(interaction.commandName)) return;
  const isThread = interaction.channel.isThread();
  try {
    if (isThread && interaction.commandName === "council") {
      await client.commands.get(interaction.commandName).execute(interaction, client);
    } else if (interaction.commandName != "council") {
      await client.commands.get(interaction.commandName).execute(interaction, client);
    } else if (!isThread && interaction.commandName === "council") {
      await interaction.reply({
        content: "You are not currently in council and therefore have no right to make decisions.",
        ephemeral: true,
      });
    }
  } catch (error) {
    console.error(error);
    return interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
  }
});

client.login(discordToken);
