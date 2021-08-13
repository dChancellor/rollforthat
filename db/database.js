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
  async createNewPlayer() {
    const players = this.db.collection("players");
    return players.insertOne({ id: 1, name: "Player 1" }).then((res) => res);
  }
  async createNewEncounter(encounter) {
    const encounters = this.db.collection("encounters");
    return encounters.insertOne(encounter).then((res) => res);
  }
}

let db = new Database(uri);

module.exports = db;
