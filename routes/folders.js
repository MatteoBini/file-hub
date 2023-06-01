const express = require('express');
const router = express.Router();

const { pool } = require(`../dbConfig`);

// Warning!!!! IS public
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
    const { parentID, folderName } = req.body;
    const userID = req.user.id;

    pool.query(
        "INSERT INTO Folders (FolderName, ParentFolderID, UserID) VALUES (?, ?, ?)",
        [folderName, parentID, userID],
        (error, results) => {
            if (error) {
                console.error(error);
                let message = encodeURIComponent('Err');
                return res.redirect('/?errorMessage=' + message);
            }
        }
    );

    pool.query(
        "INSERT INTO user_logs (user_id, operation) VALUES (?, ?)",
        [userID, `Created ${folderName} in ${parentID}`],
        (error, results) => {
            if (error) {
                console.error(error);
                let message = encodeURIComponent('Err');
                return res.redirect('/?errorMessage=' + message);
            }
        }
    );

    let message = encodeURIComponent('Folder created successfully');
    return res.redirect('/?successMessage=' + message);
});

router.post("/delete", (req, res) => {
    const { folderID } = req.body;
    const userID = req.user.id;

    if (userID != 1) { // user is not ADMIN
        let message = encodeURIComponent('Only admin can delete folders');
        return res.redirect('/?errorMessage=' + message);
    }

    pool.query(
        "DELETE FROM Folders WHERE FolderID=?",
        [folderID],
        (error, results) => {
            if (error) {
                console.error(error);
                let message = encodeURIComponent('Err');
                return res.redirect('/?errorMessage=' + message);
            }
        }
    );

    pool.query(
        "INSERT INTO user_logs (user_id, operation) VALUES (?, ?)",
        [userID, `Deleted ${folderID}`],
        (error, results) => {
            if (error) {
                console.error(error);
                let message = encodeURIComponent('Err');
                return res.redirect('/?errorMessage=' + message);
            }
        }
    );

    let message = encodeURIComponent('Folder deleted successfully');
    return res.redirect('/?successMessage=' + message);
});

module.exports = router;