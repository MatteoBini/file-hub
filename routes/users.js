const express = require('express');
const router = express.Router();

const bcrypt = require("bcrypt");

const utils = require(`../utils`);
const { pool } = require(`../dbConfig`);

router.use(express.urlencoded({ extended: true }));

router.get("/:id", (req, res) => {
    pool.query(
        `SELECT * FROM user_logs WHERE user_id = ?;`,
        [req.params.id],
        (err, results) => {
            if (err) {  throw err;  }
            console.log(results)
            return res.render("user.ejs", { logs: results });
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
    pool.query(
        `DELETE FROM users WHERE id = ?;`,
        [req.params.id],
        (err) => {
            if (err) {
                let message = encodeURIComponent("User not deleted successfully");
                return res.redirect('/admin?errorMessage=' + message); 
            }
        }
    );

    pool.query(
        'INSERT INTO user_logs (user_id, operation) VALUES (?, ?);',
        [req.user.id, `Deleted user ${req.params.id}`],
        (error, results) => {
          if (error) {
            console.error(error);
          }
        }
    );

    let message = encodeURIComponent("User deleted successfully");
    res.redirect('/admin?successMessage=' + message);
});

module.exports = router;