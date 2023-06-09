const LocalStrategy = require("passport-local").Strategy;
const { pool } = require("./dbConfig");
const bcrypt = require("bcrypt");

function initialize(passport) {
    const authenticateUser = (username, password, done) => {
        pool.query(
            `SELECT * FROM users WHERE username = ?`,
            [username],
            (err, results) => {
                if (err) {  throw err;  }

                if (results.length > 0) {
                    const user = results[0];

                    bcrypt.compare(password, user.password, (err, isMatch) => {
                        if (err) {
                            console.log(err);
                        }
                        if (isMatch) {
                            return done(null, user);
                        } else {
                            return done(null, false);
                        }
                    });
                } else {
                    return done(null, false);
                }
            }
        );
    };

    passport.use(
        new LocalStrategy(
            { usernameField: "username", passwordField: "password" },
            authenticateUser
        )
    );

    // Stores user details inside session. serializeUser determines which data of the user
    // object should be stored in the session. The result of the serializeUser method is attached
    // to the session as req.session.passport.user = {}. Here for instance, it would be (as we provide
    //   the user id as the key) req.session.passport.user = {id: 'xyz'}
    passport.serializeUser((user, done) => done(null, user.id));

    // In deserializeUser that key is matched with the in memory array / database or any data resource.
    // The fetched object is attached to the request object as req.user
    passport.deserializeUser((id, done) => {
        pool.query(`SELECT * FROM users WHERE id = ?`, [id], (err, results) => {
            if (err) {
                return done(err);
            }
            return done(null, results[0]);
        });
    });

    console.log("Passport initialized");
}

module.exports = initialize;