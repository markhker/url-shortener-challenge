const mongoose = require('mongoose');
mongoose.Promise = global.Promise; // Use JavaScript promises
const { Mongo } = require('../environment');

const uri = `mongodb://${Mongo.USER}:${Mongo.PASS}@${Mongo.HOST}/${Mongo.NAME}`;

const db = mongoose.createConnection(uri);

module.exports = db;
