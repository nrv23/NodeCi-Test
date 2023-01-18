
//configurar el tiempo de espera de las pruebas de jest

jest.setTimeout(10000);
require("../models/User");
const mongoose = require("mongoose");
const keys = require("../config/keys");

// conectar a mongodb para crear nuevos usuarios en el sessionfactory
mongoose.Promise = global.Promise;
mongoose.connect(keys.mongoURI,{ useMongoClient: true })