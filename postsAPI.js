import express from 'express';
import fetch from 'node-fetch';
const router = express.Router();

router.get('/', (req, res) => {
  console.log('--- [Notice] - API /api/posts CALLED')
  let urlpara = new URL('http://ab.c' + req.url); // Possible node limitation, new URL throws errors unless has http://xx.x in the url (Is just filler, to extract the req.url correctly)
  let params = new URLSearchParams(urlpara.search) // Without this ?tags always returns as null
  let getTags = params.get('tags')
  let getSort = params.get('sortBy')
  let getDir = params.get('direction')

  try {
    if (getTags) {
      if (getDir == null) {
        // Default Direction (ASC)
        sortErrChk('asc')
      }
      else if (getDir == 'asc' || getDir == 'desc') {
        // Carry the Direction On
        sortErrChk(getDir)
      } else {
        // Incorrect Direction THROW ERROR
        return sendError('direction');
      }
      function sortErrChk(dirInfo) {
        if (getSort == null) {
          // Default to ID
          getPosts(getTags, 'id', dirInfo, function (reJson) {
            res.status(200).json({ "posts": reJson })
          });
        }
        else if (getSort == 'likes' || getSort == 'reads' || getSort == 'id' || getSort == 'popularity') {
          // Continue, Else Goto Error
          getPosts(getTags, getSort, dirInfo, function (reJson) {
            res.status(200).json({ "posts": reJson })
          });
        }
        else {
          return sendError('sortBy');
        }
      }
    }
    else if (getTags == null && getTags != "") {
      // No Tags Given TRHOW ERROR
      return sendError('tags');
    }
  } catch (error) {
    console.error(error);
    res.status(404).json({ "error": "fetal error" })
  }


  function sendError(type) {
    console.log("--- [ERROR] - Error Detected; Sending Error Reponse to Client -- Error Type: " + type)
    if (type == 'sortBy') { res.status(400).json({ "error": "sortBy parameter is invalid" }); }
    if (type == 'direction') { res.status(400).json({ "error": "sortBy parameter is invalid" }); }
    if (type == 'tags') { res.status(400).json({ "error": "Tags parameter is required" }); }
  }
});

// This function, Takes the input tags, (plus sortby and dir) 
// Seperates the tags, and grabs each json obj with said tag, once it has checked for duplicates it then executes a sortBy / Direction
function getPosts(inputTags, sortBy, direction, reJson) {
  console.log("--- [Notice] - Started Query; Grab data Based on Tag(s): " + inputTags)
  let outputEntries = new Array()
  var TagsSplit = inputTags.split(',');
  console.log("--- [Notice] - Checking for Duplicates; ")
  let indexLoop = 0
  TagsSplit.forEach((tagEl, i, array) => { // For each tag given, try to grab data from fetch, then add it to outputEntries (checking for Duplicate ID's)
    fetchData(tagEl, function (result) {
      dupCheck(result)
    });
    function dupCheck(curRaw) {
      if (curRaw != null && curRaw != '') { // Verify the Data returned is valid, before trying to add it
        let curResult = curRaw // this had .posts in it before because each search would send it in a [posts: array ]
        // Filter Data in Array, Verify no entry has a duplicate
        for (let key in curResult) {
          if (outputEntries.filter(e => e.id == curResult[key].id).length > 0) {
            console.log("--- [Notice] - Duplicate ID Found: #" + curResult[key].id + " -- Not adding to Output Data");
          }
          else {
            //console.log("--- [Notice] - No Duplicate found - Adding to Obj");
            outputEntries.push(curResult[key])
          }
        }
        // Check if each Tag Json has been retrieved, once done, run the callback reJson once sortTags has finished
        if (indexLoop === array.length - 1) {
          reJson(sortTags(outputEntries, sortBy, direction))
        }
        indexLoop++
      }
    }
  })
}

// This organizes the output Entries provided, and arranges it based on information provided, returns the sorted Array/ Obj
function sortTags(outputEntries, sortBy, direction) {
  // Gets rid of excess brackets
  let arryRaw = new Array(outputEntries)
  let arrySort = arryRaw[0]

  console.log("--- [Notice] - Sorting Output Data; By: " + sortBy + " and by Direction: " + direction)
  // Sort based on sortBy input, and direction
  arrySort.sort(function (a, b) {
    switch (sortBy) {
      case 'likes':
        var likeDir = (direction === 'asc') ? a.likes - b.likes : b.likes - a.likes
        return likeDir
      case 'id':
        var idDir = (direction == 'asc') ? a.id - b.id : b.id - a.id
        return idDir
      case 'reads':
        var readsDir = (direction == 'asc') ? a.reads - b.reads : b.reads - a.reads
        return readsDir
      case 'popularity':
        var popDir = (direction == 'asc') ? a.popularity - b.popularity : b.popularity - a.popularity
        return popDir
    }
  });
  return arrySort
}


let exmple_data1 = [ // tech
  { "author": "Bryson Bowers", "authorId": 6, "id": 85, "likes": 25, "popularity": 0.18, "reads": 16861, "tags": ["tech"] },
  { "author": "Jon Abbott", "authorId": 4, "id": 46, "likes": 89, "popularity": 0.96, "reads": 79298, "tags": ["culture", "tech"] },
  { "author": "Adalyn Blevins", "authorId": 11, "id": 37, "likes": 107, "popularity": 0.55, "reads": 35946, "tags": ["tech", "health", "history"] },
  { "author": "Lainey Ritter", "authorId": 1, "id": 76, "likes": 122, "popularity": 0.01, "reads": 75771, "tags": ["tech", "health", "politics"] },
  { "author": "Lainey Ritter", "authorId": 1, "id": 82, "likes": 140, "popularity": 0.09, "reads": 3201, "tags": ["tech"] },
  { "author": "Jon Abbott", "authorId": 4, "id": 43, "likes": 149, "popularity": 0.07, "reads": 77776, "tags": ["science", "tech"] },
  { "author": "Elisha Friedman", "authorId": 8, "id": 13, "likes": 230, "popularity": 0.31, "reads": 64058, "tags": ["design", "tech"] },
  { "author": "Rylee Paul", "authorId": 9, "id": 84, "likes": 233, "popularity": 0.65, "reads": 17854, "tags": ["politics", "tech", "history"] },
  { "author": "Adalyn Blevins", "authorId": 11, "id": 89, "likes": 251, "popularity": 0.6, "reads": 75503, "tags": ["politics", "startups", "tech", "history"] },
  { "author": "Trevon Rodriguez", "authorId": 5, "id": 14, "likes": 311, "popularity": 0.67, "reads": 25644, "tags": ["tech", "history"] },
  { "author": "Elisha Friedman", "authorId": 8, "id": 25, "likes": 365, "popularity": 0.12, "reads": 32949, "tags": ["politics", "tech"] },
  { "author": "Trevon Rodriguez", "authorId": 5, "id": 77, "likes": 407, "popularity": 0.21, "reads": 664, "tags": ["politics", "startups", "tech", "science"] },
  { "author": "Trevon Rodriguez", "authorId": 5, "id": 58, "likes": 466, "popularity": 0.1, "reads": 17389, "tags": ["science", "tech"] },
  { "author": "Kinley Crosby", "authorId": 10, "id": 35, "likes": 868, "popularity": 0.2, "reads": 66926, "tags": ["tech"] },
  { "author": "Trevon Rodriguez", "authorId": 5, "id": 93, "likes": 881, "popularity": 0.41, "reads": 73964, "tags": ["tech", "history"] },
  { "author": "Zackery Turner", "authorId": 12, "id": 24, "likes": 940, "popularity": 0.74, "reads": 89299, "tags": ["culture", "tech", "politics"] },
  { "author": "Rylee Paul", "authorId": 9, "id": 1, "likes": 960, "popularity": 0.13, "reads": 50361, "tags": ["tech", "health"] },
  { "author": "Tia Roberson", "authorId": 2, "id": 59, "likes": 971, "popularity": 0.21, "reads": 36154, "tags": ["politics", "tech"] },
  { "author": "Jaden Bryant", "authorId": 3, "id": 18, "likes": 983, "popularity": 0.09, "reads": 33952, "tags": ["tech", "history"] },
  { "author": "Jon Abbott", "authorId": 4, "id": 95, "likes": 985, "popularity": 0.42, "reads": 55875, "tags": ["politics", "tech", "health", "history"] }
]


let exmple_data2 = [ // science
  { "author": "Ahmad Dunn", "authorId": 7, "id": 45, "likes": 31, "popularity": 0.89, "reads": 63432, "tags": ["science", "history"] },
  { "author": "Jon Abbott", "authorId": 4, "id": 62, "likes": 135, "popularity": 0.83, "reads": 87712, "tags": ["culture", "science"] },
  { "author": "Jon Abbott", "authorId": 4, "id": 43, "likes": 149, "popularity": 0.07, "reads": 77776, "tags": ["science", "tech"] },
  { "author": "Lainey Ritter", "authorId": 1, "id": 33, "likes": 289, "popularity": 0.73, "reads": 31629, "tags": ["science"] },
  { "author": "Kinley Crosby", "authorId": 10, "id": 88, "likes": 371, "popularity": 0.35, "reads": 21916, "tags": ["culture", "science", "history"] },
  { "author": "Lainey Ritter", "authorId": 1, "id": 97, "likes": 382, "popularity": 0.83, "reads": 47484, "tags": ["politics", "science", "design", "culture"] },
  { "author": "Zackery Turner", "authorId": 12, "id": 6, "likes": 387, "popularity": 0.83, "reads": 50062, "tags": ["science", "startups"] },
  { "author": "Lainey Ritter", "authorId": 1, "id": 96, "likes": 395, "popularity": 0.44, "reads": 99575, "tags": ["science", "history"] },
  { "author": "Lainey Ritter", "authorId": 1, "id": 21, "likes": 406, "popularity": 0.81, "reads": 88797, "tags": ["science", "startups"] },
  { "author": "Trevon Rodriguez", "authorId": 5, "id": 77, "likes": 407, "popularity": 0.21, "reads": 664, "tags": ["politics", "startups", "tech", "science"] },
  { "author": "Adalyn Blevins", "authorId": 11, "id": 69, "likes": 425, "popularity": 0.56, "reads": 5149, "tags": ["science", "history"] },
  { "author": "Zackery Turner", "authorId": 12, "id": 91, "likes": 455, "popularity": 0.19, "reads": 90395, "tags": ["science", "health"] },
  { "author": "Trevon Rodriguez", "authorId": 5, "id": 58, "likes": 466, "popularity": 0.1, "reads": 17389, "tags": ["science", "tech"] },
  { "author": "Ahmad Dunn", "authorId": 7, "id": 7, "likes": 499, "popularity": 0.93, "reads": 95434, "tags": ["science", "health"] },
  { "author": "Rylee Paul", "authorId": 9, "id": 17, "likes": 527, "popularity": 0.88, "reads": 52454, "tags": ["science", "health"] },
  { "author": "Ahmad Dunn", "authorId": 7, "id": 100, "likes": 573, "popularity": 0.43, "reads": 89894, "tags": ["science", "design", "history"] },
  { "author": "Elisha Friedman", "authorId": 8, "id": 52, "likes": 602, "popularity": 0.26, "reads": 76359, "tags": ["science", "health"] }
]

let exmple_data3 = [ // design
  { "author": "Tia Roberson", "authorId": 2, "id": 38, "likes": 105, "popularity": 0.45, "reads": 45896, "tags": ["design", "history"] },
  { "author": "Elisha Friedman", "authorId": 8, "id": 13, "likes": 230, "popularity": 0.31, "reads": 64058, "tags": ["design", "tech"] },
  { "author": "Rylee Paul", "authorId": 9, "id": 73, "likes": 315, "popularity": 0.13, "reads": 8966, "tags": ["design"] },
  { "author": "Elisha Friedman", "authorId": 8, "id": 56, "likes": 319, "popularity": 0.49, "reads": 96864, "tags": ["design", "health", "culture"] },
  { "author": "Lainey Ritter", "authorId": 1, "id": 97, "likes": 382, "popularity": 0.83, "reads": 47484, "tags": ["politics", "science", "design", "culture"] },
  { "author": "Bryson Bowers", "authorId": 6, "id": 42, "likes": 452, "popularity": 0.08, "reads": 39721, "tags": ["design"] },
  { "author": "Jaden Bryant", "authorId": 3, "id": 51, "likes": 487, "popularity": 0.01, "reads": 98798, "tags": ["design", "startups", "tech"] },
  { "author": "Ahmad Dunn", "authorId": 7, "id": 28, "likes": 713, "popularity": 0.8, "reads": 89173, "tags": ["design"] },
  { "author": "Rylee Paul", "authorId": 9, "id": 41, "likes": 715, "popularity": 0.69, "reads": 47876, "tags": ["design", "health"] },
  { "author": "Elisha Friedman", "authorId": 8, "id": 4, "likes": 728, "popularity": 0.88, "reads": 19645, "tags": ["science", "design", "tech"] },
  { "author": "Kinley Crosby", "authorId": 10, "id": 75, "likes": 733, "popularity": 0.98, "reads": 94910, "tags": ["science", "design", "culture"] },
  { "author": "Adalyn Blevins", "authorId": 11, "id": 16, "likes": 749, "popularity": 0.29, "reads": 71754, "tags": ["design", "history"] },
  { "author": "Ahmad Dunn", "authorId": 7, "id": 11, "likes": 750, "popularity": 0.54, "reads": 6183, "tags": ["science", "design"] },
  { "author": "Tia Roberson", "authorId": 2, "id": 98, "likes": 934, "popularity": 0.5, "reads": 17307, "tags": ["design"] }
]


function fetchData(inputTag, callback) {
  if (inputTag == 'tech') { callback(exmple_data1) }
  if (inputTag == 'science') { callback(exmple_data2) }
  if (inputTag == 'design') { callback(exmple_data3) }
}


// // Use node-fetch to get the json file from the Provided API, Based on Singular Tag Provided from getPosts
// function fetchData(inputTag, callback) {
//   fetch('EXAMPLE FETCH.COM' + inputTag)
//     .then(res => res.json())
//     .then(EntryJson => {
//       //console.log("fetching : ", inputTag)
//       callback(EntryJson);
//     });
// }
export default router;