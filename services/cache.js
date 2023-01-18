const mongoose = require("mongoose");
const redis = require("redis");
const util = require("util");
const { is_json } = require("../utils/json_string");
const keys = require("../config/keys");
const redisUrl = keys.regisUrl; // se crea un servidor redis donde se va guardar en caché los selects de bds
const client = redis.createClient(redisUrl); // crear una una instancia de redis cliente para guardar los datos en el servidor de redis
const exec = mongoose.Query.prototype.exec; // guarda en una variable, la funcion exec de mongoose
client.hget = util.promisify(client.hget); // devolver en promesa el resultado del cache

// por default se usa el puerto 6379
// util.promisify convierte a promesa cualquier funcion
// client.flushall() va borrrar todos los datos de cache
// util.promisify convierte en promesa a cualquier funcion
/*
// revisar si hay datos en redis relacionado con la consulta entrante
const blogsCached = await client.get(req.user.id); // aqui se va usar como parametro la identificacion del cliente
// devuelve null o undefined si no encuentra nada en cache
console.log({blogsCached});
//si ya hay datos relacionados en redis entonces se devuelven al response
if (blogsCached) return res.send(JSON.parse(blogsCached));

// sino, se busca en mongodb y se devuelve al response, y se actualiza el servidor de redis
const blogs = await Blog.find({ _user: req.user.id });
res.send(blogs); // se envia la respuesta y luego se guarda en cache
client.set(req.user.id,JSON.stringify(blogs)); */

mongoose.Query.prototype.cache = function(options = {}) {
    console.log(options)
    this.useCache = true; // una bandera para indicar de forma separada a cada query, si se va usar cache o no
    this.hashKey = JSON.stringify(options.key || ''); // el options.key es la llave que va guardar todo el cache por usuario por lo que no se puede repetir
    return this; // para poder ser llamada en la ejecucion de un query de mongo como cualquier otra funcion
    
    /*
        Por ejemplo se podria hacer algo como esto 
        db.restaurants.find( { rating: { $lt: 5 } } ).cache().limit(5)

    */
}

mongoose.Query.prototype.exec = async function () { // se va a sobreescribir la funcion exec de mongoose para saber si lo que se busca 
            // existe en redis

    try {

        if(!this.useCache) return exec.apply(this,arguments); // ejecutar la consulta pura de mongodb sin usar el cache
        
        // this hace referencia a la informacion de la consulta entrante, por lo que el modelo que toma es el modelo
        // de forma dinamica que se va a usar para consultar mongodb. Si existen datos para una consulta determinada en
        // redis, entonces los datos se parsean y se envian como parametros a una nueva instancia del modelo a consultar y se 
        // devuelve como si fuera una respuesta de mongodb
        // this.getQuery() devuelve el query que se va enviar a mongodb como un objeto literal JSON

        const key = Object.assign({}, this.getQuery(), {
            collection: this.mongooseCollection.name
        }); // despues del primer argumento, cada argumento separado por coma es una propiedad del objeto a crear 

        //key se le asgina el objeto del query que va ser enviado a mongodb, se le agrega una propiedad collection 
        // para saber a cual coleccion se va consultar y de ahi se envia a redis para saber si con esa llave ya existe un valor
        // comprobar si el 'key' entrante existe en redis
        const cacheValue = await client.hget(this.hashKey,JSON.stringify(key));
        
        if (cacheValue) {
            console.log("REDIS SERVICE");
            //const doc = new this.model(is_json(cacheValue)); // genera una nueva instancia del modelo
            const doc = is_json(cacheValue);
            
            return Array.isArray(doc) // saber si lo que devuelve es un array
                ? doc.map(d => new this.model(d)) // al mapear, devuelve un objeto por cada iteracion y al final devuelve el array completo de respuesta
                : new this.model(is_json(cacheValue)); // devuelve solo una instacia simsple del modelo a consultar, como un objeto literal

            //return doc; 
        }

        console.log("MONGODB SERVICE");
        const result = await exec.apply(this, arguments);
        client.hset(this.hashKey,JSON.stringify(key),JSON.stringify(result),'EX',10); // expirar en 10 segundos
        return result;

    } catch (error) {
        throw error;
    }
}

module.exports = {
    clearHash(key) {
      client.del(JSON.stringify(key)); // borrar caché usado la propiedad del nivel mas alto
    }
  }