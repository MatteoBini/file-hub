// https://stackoverflow.com/questions/5697061/how-to-manage-multiple-js-files-server-side-with-node-js

const path = require(`path`);
const fs = require(`fs`);

const { pool } = require(`./dbConfig`);

(function() {

    module.exports.getFiles = function() {
        let files = fs.readdirSync(path.join(__dirname, "uploads"));
        return files;
    }

}());
