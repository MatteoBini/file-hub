const express = require('express');
const router = express.Router();

const bcrypt = require("bcrypt");

const { pool } = require(`../dbConfig`);

router.use(express.urlencoded({ extended: true }));

router.get("/get", (req, res) => {
    pool.query(
        `SELECT * FROM users WHERE password<>'';`,
        (err, results) => {
            if (err) { throw err; }
            return res.json({ results });
        }
    );

});

router.post("/create", (req, res) => {
    const { username, password } = req.body;

    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            console.log(err);
            let message = encodeURIComponent("User creation gone wrong");
            res.redirect('/admin?errorMessage=' + message);
        } else {
            pool.query(
                `INSERT INTO users (username, password) VALUES (?, ?);`,
                [username, hash],
                (error) => {
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

    pool.query(
        'INSERT INTO user_logs (user_id, operation) VALUES (?, ?);',
        [req.user.id, `Created user ${username}`],
        (error, results) => {
            if (error) {
            console.error(error);
            }
        }
    );
});

router.get("/delete/:id", (req, res) => {
    const deleteUserId = req.params.id;

    let message = null;
    pool.query(
        `UPDATE users SET password = '' WHERE id = ?;`,
        [deleteUserId],
        (err) => {
            if (err) {
                message = encodeURIComponent("User not deleted successfully");
            }
        }
    );

    pool.query(
        'INSERT INTO user_logs (user_id, operation) VALUES (?, ?);',
        [req.user.id, `Deleted user ${deleteUserId}`],
        (err) => {
          if (err) {
            console.error(err);
            message = encodeURIComponent("User not deleted successfully");
          }
        }
    );

    if (message != null) {
        return res.redirect('/admin?errorMessage=' + message);
    } else {
        message = encodeURIComponent("User deleted successfully");
        return res.redirect('/admin?successMessage=' + message);
    }
});

router.get("/deleted", (req, res) => {
    pool.query(
        `SELECT * FROM users WHERE password="";`,
        (err, results) => {
            if (err) { throw err; }
            return res.json({ "logs": results });
        }
    );

});

router.get("/:id", (req, res) => {
    pool.query(
        `SELECT * FROM user_logs WHERE user_id = ?;`,
        [req.params.id],
        (err, results) => {
            if (err) { throw err; }
            return res.render("user.ejs", { logs: results });
        }
    );

});

module.exports = router;