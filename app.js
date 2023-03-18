const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const AWS = require("aws-sdk");
let multer = require("multer");

const bucketName = process.env.bucketName;

const awsConfig = {
    accessKeyId: process.env.AccessKey,
    secretAccessKey: process.env.SecretKey,
    region: process.env.region,
};

const S3 = new AWS.S3(awsConfig);

const PORT = 2000;

const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let upload = multer();

const uploadToS3 = (fileData, name) => {
    return new Promise((resolve, reject) => {
        const params = {
            Bucket: bucketName,
            Key: Date.now() + "_" + name,
            Body: fileData,
        };
        S3.upload(params, (err, data) => {
            if (err) {
                console.log(err);
                return reject(err);
            }
            console.log(data);
            return resolve(data);
        });
    });
};
app.post("/upload", upload.single("file"), async (req, res) => {
    console.log(req.file);
    if (req.file) {
        await uploadToS3(req.file.buffer, req.file.originalname);
    }

    res.send({
        msg: "uploaded succesfully",
    });
});


app.post("/upload-multiple", upload.array("files", 3), async (req, res) => {
    // console.log(req.files);

    if (req.files && req.files.length > 0) {
        for (var i = 0; i < req.files.length; i++) {
            // console.log(req.files[i]);
            await uploadToS3(req.files[i].buffer, req.files[i].originalname);
        }
    }

    res.send({
        msg: "Successfully uploaded " + req.files.length + " files!",
    });
});

app.listen(PORT, () => console.log("server is running on " + PORT));