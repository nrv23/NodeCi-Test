const mongoose = require("mongoose");
const User = mongoose.model('User'); // se va crear una nueva instancia para crear usuarios por cada prueba
// de forma automatica

function newUser() {

    return new User({}).save(); // se crean nuevos usuarios
}

module.exports = newUser;