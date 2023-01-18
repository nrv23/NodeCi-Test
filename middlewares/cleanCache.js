const { clearHash } = require("../services/cache");


async function clearCache(req,res,next) {

    try {

        /*  


            el parametro next es el llamado a la siguiente funcion dentro de la manejador de la ruta.
            como la funcion que se ejecuta en el next es asincrona devuelve una promesa por lo que se pone el await

            para esperar que se ejecute la promesa, si el registro es exitoso entrara en el try y borra el cache, si algo sale mal cae 
            cae en el catch y envia un mensaje de error

            La funcion next() devuelve un resultado dependiendo de el siguiente middlware devuelva

            basicamente llama y espera lo que devuelve la siguiente funcion para luego ejecutar el borrado de cache

        */

        await next(); 
        clearHash(req.user.id);
    
    } catch (error) {
        
        return res.status(500).send("Hubo un error");
    }
}

module.exports = {
    clearCache
}