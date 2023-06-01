// https://stackoverflow.com/questions/5697061/how-to-manage-multiple-js-files-server-side-with-node-js

const fs = require(`fs`);
const axios = require(`axios`);

(function () {

    // Given the json collected from folder API (/folders/get) returns a 
    // better-indexed array of objects which better rappresents the virtual
    // file system
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

        // Build the folder structure by assigning subfolders to their 
        // parent folders
        for (const folder of folders) {
            if (folder.ParentFolderID === null) { // If has a parent
                rootFolders.push(folderMap[folder.FolderID]);
            } else {
                folderMap[folder.ParentFolderID].Subfolders.push(
                    folderMap[folder.FolderID]
                );
            }
        }

        return rootFolders;
    }

    module.exports.getFiles = async function () {
        try {
            const response = await axios.get('http://localhost:8000/files/get');
            const data = response.data;
            
            return data.results[0];
        } catch (error) {
            console.error(error);
            return { error: 'An error occurred' };
        }
    }

    module.exports.getFolders = async function () {
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
