const express = require(`express`);
const multer = require(`multer`);
const bodyParser = require('body-parser');
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");

const path = require(`path`);
const fs = require(`fs`);

const utils = require(`./utils`);
const { pool } = require(`./dbConfig`);
const initializePassport = require("./passportConfig");

const app = express();

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, "uploads");
    },
    filename: (req, file, callback) => {
        const fileName = `${(new Date().toJSON().slice(0,19))}_${
                                file.originalname}`;
        console.log(`Created file ${fileName}`)
        callback(null, fileName);
    }
});


const upload = multer({ storage: storage });

const PORT = process.env.PORT || 8000;

initializePassport(passport);
app.use(express.json());
app.use(express.static(path.join(__dirname, 'static')));
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json())
app.use(
    session({
        secret: "ugo",
        resave: false,
        saveUninitialized: false
    })
);
app.use(passport.initialize());
app.use(passport.session());
app.set("view engine", "ejs");
app.set('case sensitive routing', true);

app.post("/", upload.single("file" /* name of file in form*/), (req, res) => {
    const { folderName } = req.body;

    if (folderName){
        const folderPath = `uploads/${folderName}`;

        if (!fs.existsSync(folderPath)) { // Check if the folder already exists
            fs.mkdirSync(folderPath, { recursive: true });
            console.log(`Created folder ${folderPath}`);
        } else {
            console.log(`Folder ${folderPath} already exists.`);
        }
    }
    
    res.render("index.ejs", {
        files: utils.getFiles(), 
        successMessage: "File uploaded successfully" 
    });
});

app.get("/", (req, res) => {
    res.render("index.ejs", { 
        files: utils.getFiles(),
        successMessage: req.query.successMessage,
        infoMessage: req.query.infoMessage,
        warningMessage: req.query.warningMessage,
        errorMessage: req.query.errorMessage
    });
});

app.get("/admin", (req, res) => {
    res.render("admin.ejs", { 
        files: utils.getFiles(),
        successMessage: req.query.successMessage,
        infoMessage: req.query.infoMessage,
        warningMessage: req.query.warningMessage,
        errorMessage: req.query.errorMessage
    });
});


app.get("/files/:id", (req, res) => {
    const fileName = req.params.id;

    const files = utils.getFiles();

    for (let f of files) {
        if (f == fileName) {
            console.log(`Serving file ${fileName}`)
            const filePath = path.join(__dirname, `uploads/${fileName}`);
            return res.sendFile(filePath);
        }
    }

    let message = encodeURIComponent('File not found');
    res.redirect('/?errorMessage=' + message);
});

app.get("/delete/:id", (req, res) => {
    const fileName = req.params.id;

    const files = utils.getFiles();

    for (let f of files) {
        if (f == fileName) {
            const filePath = path.join(__dirname, `uploads/${fileName}`);
            fs.unlinkSync(filePath);
            console.log(`Deleted file ${fileName}`);
            let message = encodeURIComponent('File deleted successfully');
            return res.redirect('/?successMessage=' + message);
        }
    }

    let message = encodeURIComponent('File not found');
    res.redirect('/?errorMessage=' + message);
});


// Test the connection to the database
pool.getConnection((err, connection) => {
    if (err) {
        console.log("Error connecting to the database", err);
    } else {
        console.log("Connected to the MySQL database");
        connection.release();
    }
});

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
