const AWS = require("aws-sdk");
const { accessKeyId, secretAccessKey } = require("../config/dev");
const uuid = require("uuid");
const requireLogin = require("../middlewares/requireLogin");
const s3 = new AWS.S3({
    accessKeyId,
    secretAccessKey
});

module.exports = app => {

    app.get('/api/upload',requireLogin, async (req, res) => {

        const Key = `${req.user.id}/${uuid()}.jpeg`; //va generar el nombre del archivo de forma dinamica, 
        // se agregar el id de usuario para indicar al bucket de amazon s3 que use ese idusuario como una carpeta
        // para ordenar las imagenes por usuario
        
        s3.getSignedUrl('putObject',{
            Bucket: 'bucket-blogs-test',
            ContentType: 'image/jpeg',
            Key
        },(err, url) => { // la url que genera es donde se va guardar esa imagen en el bucket de amazpn s3
            if(err) {
                return res.status(500).send("Hubo un error");
            }
            console.log({url,Key})
            return res.send({url,Key});
        });
    });


    return app;
}