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
  