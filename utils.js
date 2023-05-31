// https://stackoverflow.com/questions/5697061/how-to-manage-multiple-js-files-server-side-with-node-js

const path = require(`path`);
const fs = require(`fs`);
const axios = require(`axios`);

const { pool } = require(`./dbConfig`);

(function() {

    module.exports.getFiles = function() {
        let files = fs.readdirSync(path.join(__dirname, "uploads"));
        return files;
    }

    module.exports.getFolders = async function() {
        function createFolderStructure(folders) {
            const folderMap = {};
            const rootFolders = [];
          
            // Create a map of folders using the FolderID as the key
            for (const folder of folders) {
              folderMap[folder.FolderID] = {
                ...folder,
                Subfolders: [] // Initialize the Subfolders array
              };
            }
          
            // Build the folder structure by assigning subfolders to their parent folders
            for (const folder of folders) {
              if (folder.ParentFolderID === null) {
                // If the folder has no parent, it is a root folder
                rootFolders.push(folderMap[folder.FolderID]);
              } else {
                // If the folder has a parent, add it as a subfolder to the parent folder
                folderMap[folder.ParentFolderID].Subfolders.push(folderMap[folder.FolderID]);
              }
            }
          
            return rootFolders;
          }
          

        try {
            const response = await axios.get('http://localhost:8000/folders/get');
        
            const data = response.data;

            return createFolderStructure(data.results[0]);
        } catch (error) {
            console.error(error);
            return { error: 'An error occurred' };
        }
    }

}());
