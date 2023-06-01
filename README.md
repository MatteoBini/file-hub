# File hub

> Cloud based file system.

## APIs docs
| Router file | Endpoint | Data | Return type | 
|--|--|--|--|
| folders.js | /folders/get | Array of obj with (a virtual folder each one) | JSON
| folders.js | /folders/create | Create a virtual folder | Status OK
| folders.js | /folders/delete/:name | Delete a virtual folder | Status OK
| files.js | /files/get | Array of obj (each one a file) | JSON
| files.js | /files/create | Loads a file | Status OK
| folders.js | /files/delete/:name | Delete a virtual folder | Status OK

