const db = require("../db/database");

module.exports = {
  data: {
    name: "encounter",
  },
  async execute(client) {
    createCouncilThread(client);
  },
};

const createCouncilThread = async (client) => {
  let channel = client.channels.cache.get("855185482748657734");
  let newThread = await channel.threads.create({
    name: "Encounter!",
    autoArchiveDuration: 60,
    type: "GUILD_PUBLIC_THREAD",
    reason: `A random encounter has occurred!`,
  });
  const thread = client.channels.cache.get(newThread.id);
  let players = await db.getAllPlayers();
  await Promise.all(
    players.map(({ discordID }) => {
      thread.members.add(discordID);
    })
  );
  await thread.send("This feature hasn't been implemented yet..so everyone is awarded 100xp!");
  await Promise.all(
    players.map(({ discordID }) => {
      db.addXP(discordID, 100, "The Council", "Successful encounter");
    })
  );
};
