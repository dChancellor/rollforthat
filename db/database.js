const { MongoClient } = require("mongodb");
const { uri } = require("../config");

class Database {
  constructor(uri) {
    this.uri = uri;
    this.connection;
    this.db;
    this.currentStatus = false;
  }

  async connect(databaseName) {
    this.connection = await MongoClient.connect(this.uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    this.db = await this.connection.db(databaseName);
    this.currentStatus = true;
  }

  async disconnect() {
    return this.connection.close();
  }
  async status() {
    return this.db.serverConfig.isConnected();
  }
  async createNewEncounter(encounter) {
    const encounters = this.db.collection("encounters");
    return encounters.insertOne({ ...encounter, date: new Date() }).then((res) => res);
  }
  async getEncounter(id) {
    const encounters = this.db.collection("encounters");
    return encounters.findOne({ encounterID: id });
  }
  async getAllPlayers() {
    const players = this.db.collection("players");
    return players.find().project({ _id: 0, discordID: 1 }).toArray();
  }
  async getAllUsersExceptEncounterMembers(excludedIds) {
    const players = this.db.collection("players");
    let allPlayers = await players.find().project({ _id: 0, discordID: 1 }).toArray();
    return allPlayers.filter((player) => !excludedIds.includes(player.discordID));
  }
  async addXP(target, xp, giver, reason) {
    console.log(target);
    const players = this.db.collection("players");
    const encounters = this.db.collection("encounters");
    await players.updateOne({ discordID: target }, { $inc: { xp: xp } });
    return encounters.insertOne({ type: "xp", target, xp, giver, reason, date: new Date() });
  }
  async getUserAbilityScore(player, ability) {
    const players = this.db.collection("players");
    const { stats } = await players.findOne({ discordID: player }, { _id: 0, stats: 1 });
    return stats[ability];
  }
}

let db = new Database(uri);

module.exports = db;
