const express = require('express');
const router = express.Router();

const multer = require(`multer`);
const path = require(`path`);
const fs = require(`fs`);
const { pool } = require(`../dbConfig`);
const utils = require(`./../utils`);

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

router.get("/get", async (req, res) => {
    try {
        const results = await pool.promise().query("SELECT * FROM Files;");
        res.json({ results });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred" });
    }
});

router.get("/:FileName", async (req, res) => {
    const fileName = req.params.FileName;
    const files = await utils.getFiles();

    for (let f of files) {
        if (f.FileName == fileName) {
            console.log(`Viewed file ${fileName}`);
            const filePath = path.join(__dirname, `../uploads/${fileName}`);
            return res.sendFile(filePath);
        }
    }

    let message = encodeURIComponent('File not found');
    res.redirect('/?errorMessage=' + message);
});

router.post('/create', upload.single('file'), (req, res) => {
    const { filename, size, mimetype } = req.file;
    const { folderID } = req.body;
    const userID = req.user.id;

    const insertFileQuery = `
      INSERT INTO Files (FileName, FileSize, FileType, UserID, FolderID)
      VALUES (?, ?, ?, ?, ?);
    `;

    let fileID;
    pool.query(insertFileQuery, [filename, size, mimetype, userID, folderID], function (err) {
        if (err) {
            console.error(err);
            return res.status(500).send('Error uploading file');
        }

        fileID = this.lastID;
    });

    pool.query(
        'INSERT INTO user_logs (user_id, operation) VALUES (?, ?)',
        [req.user.id, `Created ${fileID} (if undefined created a file)`],
        (error, results) => {
            if (error) {
                console.error(error);
            }
        }
    );

    let message = encodeURIComponent('File uploaded successfully');
    res.redirect('/?successMessage=' + message);
});

router.get("/delete/:FileName", async (req, res) => {
    const fileName = req.params.FileName;
    const files = await utils.getFiles();

    let message;

    if (req.user.username == "admin") {
        // Admin can delete everything

        for (let f of files) {
            if (f.FileName == fileName) {
                const filePath = path.join(__dirname, `../uploads/${fileName}`);
                fs.unlinkSync(filePath);
                console.log(`Deleted file ${fileName}`);
                pool.query(
                    'DELETE FROM Files WHERE FileName=?',
                    [fileName],
                    (error) => {
                        if (error) {
                            console.error(error);
                        }
                    }
                );
                pool.query(
                    'INSERT INTO user_logs (user_id, operation) VALUES (?, ?)',
                    [req.user.id, `Deleted ${req.params.id}`],
                    (error) => {
                        if (error) {
                            console.error(error);
                        }
                    }
                );

                message = encodeURIComponent('File deleted successfully');
            }
        }
    } else {
        // Every owner can delete their own stuff
        pool.query(
            'SELECT FileName FROM Files WHERE UserID = ?;',
            [req.user.id],
            (error, results) => {
                if (error) {
                    console.error(error);
                }
                results.forEach(async (f) => {
                    if (f.FileName == fileName) {
                        const filePath = path.join(__dirname, `../uploads/${fileName}`);
                        fs.unlinkSync(filePath);
                        console.log(`Deleted file ${fileName}`);
                        pool.query(
                            'DELETE FROM Files WHERE FileName=?',
                            [fileName],
                            (error) => {
                                if (error) {
                                    console.error(error);
                                }
                            }
                        );
                        pool.query(
                            'INSERT INTO user_logs (user_id, operation) VALUES (?, ?)',
                            [req.user.id, `Deleted ${req.params.id}`],
                            (error) => {
                                if (error) {
                                    console.error(error);
                                }
                            }
                        );

                        message = encodeURIComponent('File deleted successfully');
                    }
                });
            }
        );
    }

    if (message === undefined) {
        message = encodeURIComponent("You can delete only your own files.");
        return res.redirect('/?errorMessage=' + message);
    } else {
        return res.redirect('/?successMessage=' + message);
    }
});

module.exports = router;