const express = require('express');
const router = express.Router();

const { pool } = require(`../dbConfig`);

router.get("/get", async (req, res) => {
    try {
        const results = await pool.promise().query("SELECT * FROM Folders;");
        res.json({ results });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred" });
    }
});

router.post("/create", (req, res) => {
    const { folderParent, folderName } = req.body;

    pool.query(
        "INSERT INTO user_logs (FolderName, ParentFolderID) VALUES (?, ?)",
        [folderName, folderParent],
        (error, results) => {
            if (error) {
                console.error(error);
                let message = encodeURIComponent('Err');
                return res.redirect('/?errorMessage=' + message);
            }

            let message = encodeURIComponent('Folder created successfully');
            return res.redirect('/?successMessage=' + message);
        }
    );

});

module.exports = router;