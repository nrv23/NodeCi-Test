
const { Buffer } = require("safe-buffer");
const KeyGrip = require("keygrip");
const { cookieKey } = require("../../config/keys");
const keygrip = new KeyGrip([cookieKey]);

function newSession(user) {

    const sessionObject = {
        passport: {
            user: user._id.toString() // es una propiedad de mongodb que no es un string y por eso se debe convertir a string
        }
    }
    // generar la informacion de la cookie 
    const session = Buffer.from(JSON.stringify(sessionObject)).toString('base64');
    const sessionSigned = keygrip.sign("session=" + session);
    console.log({ session, sessionSigned, cookieKey });

    return { sessionSigned, session };
}


module.exports = newSession;