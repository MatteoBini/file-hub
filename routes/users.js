const express = require('express');
const router = express.Router();

const bcrypt = require("bcrypt");

const utils = require(`../utils`);
const { pool } = require(`../dbConfig`);

router.use(express.urlencoded({ extended: true }));

router.get("/:id", (req, res) => {/*
    const files = utils.getFiles();

    for (let f of files) {
        if (f == fileName) {
            console.log(`Viewed file ${fileName}`);
            const filePath = path.join(__dirname, `../uploads/${fileName}`);
            return res.render(
                "admin.ejs",
                {
                    files: utils.getFiles,
                }
            );
        }
    }

    let message = encodeURIComponent('File not found');
    res.redirect('/?errorMessage=' + message);*/
});

router.post("/create", (req, res) => {

    const { username, password } = req.body;

    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            console.log(err);
            // Handle the error appropriately, e.g., return an error response
        } else {
            pool.query(
                `INSERT INTO users (username, password) VALUES (?, ?);`,
                [username, hash],
                (error, results) => {
                    if (error) {
                        console.log(error);
                        let message = encodeURIComponent("User creation gone wrong");
                        res.redirect('/admin?errorMessage=' + message);
              } else {
                let message = encodeURIComponent("User created successfully");
                res.redirect('/admin?successMessage=' + message);
              }
            }
          );
        }
    });
});

module.exports = router;