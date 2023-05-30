const express = require('express');
const router = express.Router();

const multer = require(`multer`);
const utils = require(`./../utils`);
const path = require(`path`);
const fs = require(`fs`);

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, "uploads");
    },
    filename: (req, file, callback) => {
        const fileName = `${(new Date().toJSON().slice(0, 19))}_${file.originalname}`;
        console.log(`Created file ${fileName}`)
        callback(null, fileName);
    }
});

const upload = multer({ storage: storage });

router.get("/:id", (req, res) => {
    const fileName = req.params.id;
    const files = utils.getFiles();

    for (let f of files) {
        if (f == fileName) {
            console.log(`Viewed file ${fileName}`);
            const filePath = path.join(__dirname, `../uploads/${fileName}`);
            return res.sendFile(filePath);
        }
    }

    let message = encodeURIComponent('File not found');
    res.redirect('/?errorMessage=' + message);
});

router.post("/create", upload.single("file" /* name of file in form */), (req, res) => {
    const { folderName } = req.body;

    if (folderName) {
        const folderPath = `uploads/${folderName}`;

        if (!fs.existsSync(folderPath)) { // Check if the folder already exists
            fs.mkdirSync(folderPath, { recursive: true });
            console.log(`Created folder ${folderPath}`);
        } else {
            console.log(`Folder ${folderPath} already exists.`);
        }
    }

    let message = encodeURIComponent('File uploaded successfully');
    res.redirect('/?successMessage=' + message);
});

router.get("/delete/:id", (req, res) => {
    const fileName = req.params.id;
    const files = utils.getFiles();

    for (let f of files) {
        if (f == fileName) {
            const filePath = path.join(__dirname, `../uploads/${fileName}`);
            fs.unlinkSync(filePath);
            console.log(`Deleted file ${fileName}`);
            let message = encodeURIComponent('File deleted successfully');
            return res.redirect('/?successMessage=' + message);
        }
    }

    let message = encodeURIComponent("File not found");
    res.redirect('/?errorMessage=' + message);
});

module.exports = router;