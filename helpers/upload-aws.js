const AWS = require("aws-sdk");
const { accessKeyId, secretAccessKey } = require("../config/dev");
const fs = require("fs");

const s3 = new AWS.S3({
    accessKeyId,
    secretAccessKey
});


const getSignedUrl = (user,Key) => {
    return new Promise((resolve, reject) => {

        s3.getSignedUrl('putObject', {
            Bucket: 'bucket-blogs-test',
            ContentType: 'image/jpeg',
            Key
        }, (err, url) => { // la url que genera es donde se va guardar esa imagen en el bucket de amazpn s3
            if (err) {
                throw err;
            }

            resolve({
                url, Key
            })
        });
    })
}

const uploadFileS3 = async (Key, imagePath) => {

    const blob = fs.readFileSync(imagePath);

    const uploadedImage = await s3.upload({
        Bucket: "bucket-blogs-test",
        Key,
        Body: blob,
        }).promise();

    return uploadedImage.Location;

}

module.exports = {
    getSignedUrl,
    uploadFileS3
};