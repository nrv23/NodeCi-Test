const multer = require("multer");
const uuid = require("uuid");
const uploadFile = async (req, res, next) => {

	const configMulter = {
		limits: { fileSize: req.usuario ? 1024 * 1024 * 10 : 1000000 },//10 megas para personas que tienen cuenta, 1 mega para cuenras gratis
		storage: fileStorage = multer.diskStorage({
			destination: (req, file, cb) => {
				cb(null, __dirname + '/../img')
			},
			filename: (req, file, cb) => {
				//const ext = file.mimetype.split('/')[1];
				const ext = file.originalname.substring(file.originalname.lastIndexOf('.'), file.originalname.length);
				cb(null, `${uuid()}${ext}`)
			}
		})
	}

	const upload = multer(configMulter).single("file");

	upload(req, res, async (error) => {

		if (error) {
			console.log(error);
			if (error.code === 'LIMIT_FILE_SIZE') {
				return res.status(400).json({
					msg: 'Debe subir un archivo menos pesado'
				})
			} else {
				return res.status(500).send("Ocurrió un error")
			}
		}

		return next();

	})
}


module.exports = uploadFile