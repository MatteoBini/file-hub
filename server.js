const express = require(`express`);
const multer = require(`multer`);
const bodyParser = require('body-parser');
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const path = require(`path`);

const utils = require(`./utils`);
const { pool } = require(`./dbConfig`);
const initializePassport = require("./passportConfig");
const usersRoutes = require('./routes/users');
const filesRoutes = require('./routes/files');
const foldersRoutes = require('./routes/folders');

const app = express();

const PORT = process.env.PORT || 8000;

initializePassport(passport);

app.set("view engine", "ejs");
app.set('case sensitive routing', true);

app.use(flash());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'static')));
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
    session({
        secret: "ugo",
        resave: false,
        saveUninitialized: false
    })
);
app.use(passport.initialize());
app.use(passport.session());
app.use('/users', usersRoutes);
app.use('/files', filesRoutes);
app.use('/folders', foldersRoutes);

app.get("/", async (req, res) => {
    let data = {
        files: await utils.getFiles(),
        successMessage: req.query.successMessage,
        infoMessage: req.query.infoMessage,
        warningMessage: req.query.warningMessage,
        errorMessage: req.query.errorMessage
    }

    if (req.isAuthenticated()) {
        data.folders = await utils.getFolders(),
        res.render("home.ejs", data);
    } else {
        res.render("login.ejs", data);
    }
});

app.get("/admin", async (req, res) => {
    if (req.isAuthenticated()) {
        if (req.user.username == "admin") {
                return res.render("admin.ejs", { 
                    files: await utils.getFiles(), 
                    successMessage: req.query.successMessage,
                    infoMessage: req.query.infoMessage,
                    warningMessage: req.query.warningMessage,
                    errorMessage: req.query.errorMessage,
                    users: await utils.getUsers()
            }
            );
        } else {
            let message = encodeURIComponent('Only admin can access');
            res.redirect('/?warningMessage=' + message);            
        }
    } else {
        let message = encodeURIComponent('You must be authenticated');
        res.redirect('/?errorMessage=' + message);
    }
});

app.post(
    "/login",
    passport.authenticate("local", {
        successRedirect: "/?successMessage=Login successful",
        failureRedirect: "/?errorMessage=Login wrong",
        failureFlash: true
    })
);

app.get("/logout", (req, res) => {
    req.logout(function(err){
        if (err) { return next(err); }
    });
    let message = encodeURIComponent("You have successfully logged out");
    res.redirect('/?successMessage=' + message);
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
