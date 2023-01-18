const mongoose = require('mongoose');
const {getSignedUrl,uploadFileS3} = require('../helpers/upload-aws');
const { clearCache } = require('../middlewares/cleanCache');
const requireLogin = require('../middlewares/requireLogin');
const uploadFile = require('../middlewares/upload');
const Blog = mongoose.model('Blog');
const uuid = require("uuid");

module.exports = app => {
  app.get('/api/blogs/:id', requireLogin, async (req, res) => {

    try {


      const blog = await Blog.findOne({
        _user: req.user.id,
        _id: req.params.id
      }).cache({key: req.user.id});

      res.send(blog);
    } catch (error) {
      return res.status(500).send("Hubo un error")
    }
  });

  app.get('/api/blogs', requireLogin, async (req, res) => {

    const blogs = await Blog.find({ _user: req.user.id }).cache({key: req.user.id}); // con la implementacion interna del cache, se puede cachear cualquier consulta por separado
    //el parametro key que recibe .cache es para diferenciar el cache por cada usuario 
    res.send(blogs); // se envia la respuesta y luego se guarda en cache 
  });

  app.post('/api/blogs', requireLogin,uploadFile,clearCache, async (req, res) => {

    try {

      const Key = `${req.user.id}/${uuid()}.jpeg`; //va generar el nombre del archivo de forma dinamica, 
        // se agregar el id de usuario para indicar al bucket de amazon s3 que use ese idusuario como una carpeta
        // para ordenar las imagenes por usuario

      const signedUrlResponse = await getSignedUrl(req.user.id,Key);
      console.log({signedUrlResponse});
      
      const uploadedResponse = await uploadFileS3(Key,req.file.path)
      console.log({uploadedResponse});
      return;
      
      const { title, content } = req.body;      
      const blog = new Blog({
        title,
        content,
        _user: req.user.id
      });

      await blog.save();
      res.send(blog);
    } catch (err) {

      res.status(400).send( err);
    }
  });
};
