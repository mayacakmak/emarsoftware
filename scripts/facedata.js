var newParameters;
var allUserData = null;
var currentUserData = null;
var currentUserPublicData = null;
var selectedUser = null;
var selectedFace = null;
var selectedFaceList = null;
var hasNewParams = true;
var isSetup = false;
var robotFaces = null;
var forceUpdateAll = false;

/* Function that needs to be called whenever the face preview needs to be renewed */
function updateFace() {
  console.log('???', allUserData, selectedUser, selectedFace);
  if (allUserData != null && selectedUser != null && selectedFace != null) {
    console.log('!!');
    if (selectedUser == Database.displayName && !isSetup){
      if (selectedFaceList === 'publicFaces') {
        newParameters = allUserData.find((element) => element.user === selectedUser && element.index === selectedFace);
      } else {
        newParameters = currentUserData.faces[selectedFace];
      }
    }
    else {
      newParameters = allUserData.find(
        (element) =>
          element.user === selectedUser && element.index === selectedFace
      );
    }
    if (!isSetup)
      Face.updateParameters(newParameters);
    
    if (hasNewParams) {
      updateFaceThumb(selectedUser, selectedFace);
      hasNewParams = false;
    }
  }
}

/* Callback function for when a current users' face parameter is changed */
function updateUserFaceList() {
  var myFaceList = document.getElementById("privateFaces");
  myFaceList.innerHTML = "";

  if (currentUserData != null && currentUserData.faces != undefined) {
    for (var i = 0; i < currentUserData.faces.length; i++) {
      var name = currentUserData.faces[i].name;
      if (name == undefined || name == '') name = '...';
      var thumbHTML =
        "<div class='deletable-thumb'> <div class='thumb-and-name'>";
      var imgSrc = getThumbImage(currentUserData.faces[i]);
      thumbHTML += "<img  class='face-thumb' ";
      thumbHTML += "src='" + imgSrc + "' ";
      thumbHTML +=
        'onclick=\'selectedFaceChanged(this, "' +
        Database.displayName +
        '",' +
        i +
        ", \"privateFaces\")'";
      thumbHTML += '><p>' + name + ' </p></div>';
      thumbHTML += "<div class='delete-x-button'><button type='button' ";
      thumbHTML +=
        "onclick='removeUserFace(" +
        i +
        ")' class='btn btn-secondary btn-circle-sm'>X</button></div>";
      thumbHTML += '</div>';

      myFaceList.innerHTML += thumbHTML;
    }
  }
}
  
/* Callback function to remove current user's face when the X button is clicked */
function removeFace(user, index, selector) {
  if (selector === 'privateFaces') {
    var newRobotFaces = currentUserData.faces;
    newRobotFaces.splice(index, 1);
    var dir = '/users/' + Database.displayName + "/robot/customAPI/states/";
    var dbRef = firebase.database().ref(dir);
    var updates = { faces: newRobotFaces };
    dbRef.update(updates);
    if (newRobotFaces.length > 0) {
      selectedUser = user;
      if (index === selectedFace) {
        selectedFace = index === 0 ? 0 : index - 1;
      } else if (selectedFace > index) {        
        selectedFace = selectedFace === 0 ? 0 : selectedFace - 1;
      }
      selectedFaceList = selector;
      updselectedFaceChanged(null, selectedUser, selectedFace, selectedFaceList);
    }
  } else if (selector === 'publicFaces') {
    var newPublicFaces = {};
    var count = 0;
    allUserData.forEach((element) => {
      if (element.user === user && element.index !== index) {
        newPublicFaces[count] = element;
        count++;
      }
    });
    var dir = '/users/' + Database.displayName + '/public/faces/';
    var dbRef = firebase.database().ref(dir);
    dbRef.set(newPublicFaces, function(error) {
      console.log('error', error);
    });
    selectedUser = null;
    selectedFace = null;
    selectedFaceList = null;
  }
}

/* Function to load all face data from the database UPDATED SO ONLY USERS/UID/PUBLIC*/
function updateAllUsersFaceList(snapshot) {
  // Load data only once in the beginning of each session
  if (allUserData == null || forceUpdateAll) {
    forceUpdateAll = false;
    allUserData = snapshot.val();
    var otherFaceList = document.getElementById('publicFaces');
    if (otherFaceList != undefined) {
      otherFaceList.innerHTML = '';
    }

    // allUserKeys.splice(currentUserIndex, 1);
    // allUserKeys.unshift(Database.displayName);
    var allUserKeys = Object.keys(allUserData);
    var currentUserIndex = allUserKeys.indexOf(Database.displayName);
    var updAllUserData = {};
    for (var j = 0; j < allUserKeys.length; j++) {
      var id = allUserKeys[j];

      // If setup, include the current user's faces at the beginning
      // if (id != Database.displayName || isSetup) {
      var userData = allUserData[id];

      if (userData.public) {
        var nUserConfigs = 0;
        var faces = userData.public.faces;
        if (faces != null && faces != undefined) nUserConfigs = faces.length;

        if (selectedUser == null && nUserConfigs > 0) selectedUser = id;
        updAllUserData[id] = {};
        updAllUserData[id]['faces'] = faces;
        for (i = 0; i < nUserConfigs; i++) {
          var name = faces[i].name;
          if (name == undefined || name == '') name = '...';
          var thumbHTML = "<div class='thumb-and-name'>";
          imgSrc = getThumbImage(faces[i]);
          thumbHTML += "<img  class='face-thumb' ";
          thumbHTML += "src='" + imgSrc + "' ";
          thumbHTML +=
            'onclick=\'selectedFaceChanged(this, "' +
            id +
            '",' +
            i +
            ', "publicFaces")\'>';
          thumbHTML += '<p>' + name + ' </p></div>';
          if (
            !currentUserPublicData.viewedFaces ||
            !currentUserPublicData.viewedFaces[id] ||
            !currentUserPublicData.viewedFaces[id].includes(i)
          ) {
            thumbHTML += "<div class='delete-x-button'><button type='button' "; 
            thumbHTML +=
              " class='btn btn-success btn-circle-sm'>!</button></div>";
            thumbHTML += '</div>';
          }

          if (otherFaceList != undefined) otherFaceList.innerHTML += thumbHTML;
          else myFaceList.innerHTML += thumbHTML;
        }
      }
      // }
    }
    allUserData = updAllUserData;
    var allFaceImgs = document.getElementsByClassName('face-thumb');
    selectedFaceChanged(allFaceImgs[0], selectedUser, 0, 'publicFaces');
    // renderAllUserFaceList(allUserData);
  }
}

function renderPublicFaces(snapshot) {
  console.log(snapshot.val());
  const updated = sortPublicFaces(snapshot.val());
  if (allUserData == null || updated.length !== allUserData.length)  {
    allUserData = updated;
    console.log(updated);
    renderUserFaceList(updated, 'publicFaces');
  } else {
    allUserData = updated;
    updselectedFaceChanged(document.getElementById(selectedUser + selectedFace + selectedFaceList), selectedUser, selectedFace, selectedFaceList);
  }
  updateFace();
  updateFaceEditor();
}

// function TEMPsortPublicFaces(snapshot) {
//   const keys = Object.keys(snapshot);
//   const faces = [];
//   keys.forEach((element) => {
//     element = snapshot[element];
//     if (element.customAPI && element.customAPI.states && element.customAPI.states.faces) {
//       element.customAPI.states.faces.forEach((face, index) => {
//         console.log(face);
//         faces.push({ ...face, user: element.name, index });
//       })
//     }
//   });
//   console.log(faces);
//   return faces;
// }

function renderPrivateFaces(faceData) {
  const updated = sortPrivateFaces(faceData.faces);
  updated.forEach((elem) => console.log(elem));
  if (currentUserData == null || currentUserData.faces == null || updated !== currentUserData.faces)  {
    if (currentUserData === null) {
      currentUserData = {};
    }
    currentUserData.faces = updated;  
    renderUserFaceList(updated, 'privateFaces');
  } else {
    currentUserData.faces = updated;  
    updselectedFaceChanged(document.getElementById(selectedUser + selectedFace + selectedFaceList), selectedUser, selectedFace, selectedFaceList);
  }

}

function sortPrivateFaces(faceData) {
  return faceData
    .sort((a, b) => {
      if (a.timestamp && b.timestamp) {
        return a.timestamp - b.timestamp;
      } else {
        return 1;
      }
    })
    .map((element, index) => {
      return { ...element, user: Database.displayName, index };
    });
}

function sortPublicFaces(allUserData) {
  const newFaces = [];
  const viewedFaces = [];
  const allUserKeys = Object.keys(allUserData);
  const group_id = allUserData[Database.displayName]['group_id'];
  for (var j = 0; j < allUserKeys.length; j++) {
    var id = allUserKeys[j];

    // If setup, include the current user's faces at the beginning
    // if (id != Database.displayName || isSetup) {
    var userData = allUserData[id];
    if (userData.public && userData['group_id'] && userData['group_id'] === group_id) {
      var nUserConfigs = 0;
      var faces = userData.public.faces;
      if (faces != null && faces != undefined) nUserConfigs = faces.length;

      // if (selectedUser == null && nUserConfigs > 0) selectedUser = id;
      // updAllUserData[id] = {};
      // updAllUserData[id]['faces'] = faces;
      for (i = 0; i < nUserConfigs; i++) {
        if (
          !currentUserPublicData ||
          !currentUserPublicData.viewedFaces ||
          !currentUserPublicData.viewedFaces[id] ||
          !currentUserPublicData.viewedFaces[id].includes(i)
        ) {
          newFaces.push({ ...faces[i], user: id, index: i });
        } else {
          viewedFaces.push({ ...faces[i], user: id, index: i });
        }
      }
    }
  }
  viewedFaces.sort((a,b) => {
    if (a.timestamp && b.timestamp) {
      return a.timestamp - b.timestamp;
    } else {
      return 1;
    }
  });;
  allUserData = [...newFaces, ...viewedFaces];
  return [...newFaces, ...viewedFaces];
}

/* Single function render all of the lists of faces */
function renderUserFaceList(faceData, faceList) {
  console.log('renderUserFaceList');
  var otherFaceList = document.getElementById(faceList);
  otherFaceList.innerHTML = '';
  faceData.forEach((element) => {
    var name = element.name;
    if (name == undefined || name == '') {
      name = '...';
    }
    var thumbHTML = "<div class='thumb-and-name'>";
    imgSrc = getThumbImage(element);
    thumbHTML += "<img  class='face-thumb' ";
    thumbHTML += "id='" + element.user + element.index + faceList + "' ";
    thumbHTML += "src='" + imgSrc + "' ";
    thumbHTML +=
      'onclick=\'updselectedFaceChanged(this, "' +
      element.user +
      '",' +
      element.index +
      ', "' + faceList + '")\'>';
    thumbHTML += '<p>' + name + ' </p></div>';
    if (
      faceList === "publicFaces" &&
      (!currentUserPublicData ||
      !currentUserPublicData.viewedFaces ||
      !currentUserPublicData.viewedFaces[element.user] ||
      !currentUserPublicData.viewedFaces[element.user].includes(element.index))
    ) {
      thumbHTML += "<div class='delete-x-button'><button type='button' ";
      thumbHTML += "id='notif" + element.user + element.index + "' ";
      thumbHTML +=
        " class='btn btn-success btn-circle-sm'>!</button></div>";
      thumbHTML += '</div>';
    }
    if (faceList === 'privateFaces' || element.user === Database.displayName) {
        thumbHTML += "<div class='delete-x-button'><button type='button' ";
        thumbHTML +=
          "onclick='removeFace(\"" +
          element.user + "\", " + element.index + " ,\"" + faceList + 
          "\")' class='btn btn-secondary btn-circle-sm'>X</button></div>";
        thumbHTML += '</div>';
    }
    otherFaceList.innerHTML += thumbHTML;
  });
  if (selectedUser === null || selectedFace === null || selectedFaceList === null) {
    if (faceData.length > 0) {
      selectedUser = faceData[0].user;
      selectedFace = faceData[0].index;
      selectedFaceList = faceList;
    }
  }
  console.log(selectedUser, selectedFace, selectedFaceList);
  updselectedFaceChanged(
    document.getElementById(selectedUser + selectedFace + selectedFaceList),
    selectedUser,
    selectedFace,
    selectedFaceList
  );
}

// TODO: Update for Woz
function updateRobotFaceList(snapshot) {
  var robotFaceList = document.getElementById("robotFaceList");
  if (robotFaceList != undefined)
    robotFaceList.innerHTML = "";

  robotFaces = snapshot.val();

  if (robotFaces != undefined) {
    
    for (var i = 0; i < robotFaces.length; i++) {

      var name = robotFaces[i].name;
      if (name == undefined || name == "")
        name = "..."
      var thumbHTML = "";
      if (isSetup)
        thumbHTML += "<div class='deletable-thumb'>";
      thumbHTML += "<div class='thumb-and-name'>";
      thumbHTML += "<img  class='face-thumb' ";
      thumbHTML += "src='" + robotFaces[i].thumb + "' ";
      if (!isSetup)
        thumbHTML += "onclick='selectedRobotFaceChanged(this, "+ i + ")'";
      thumbHTML += "><p>" + name + " </p></div>";
      if (isSetup) {
        thumbHTML += "<div class='delete-x-button'><button type='button' ";
        thumbHTML += "onclick='removeRobotFace(" + i + ")' class='btn btn-secondary btn-circle-sm'>X</button></div>"
        thumbHTML += "</div>";
      }
      
      robotFaceList.innerHTML += thumbHTML;
    }
  }
}

function selectedRobotFaceChanged(target, index) {
  var allFaceImgs = document.getElementsByClassName("face-thumb");
  for (var i=0; i<allFaceImgs.length; i++) {
    allFaceImgs[i].style.border = "5px transparent solid";
  }
  target.style.border = "5px #007bff solid";
  
  // var dir = "robots/" + currentRobot + "/state/";
  // var dbRef = firebase.database().ref(dir);
  // dbRef.update({ currentFace: index });
}


/* Callback function for when a different face is selected by the user through clicking a thumb*/
function selectedFaceChanged(target, user, index, selector, ignore = false) {
  hasNewParams = true;
  
  var allFaceImgs = document.getElementsByClassName("face-thumb");
  for (var i=0; i<allFaceImgs.length; i++) {
    allFaceImgs[i].style.border = "5px transparent solid";
  }
  target.style.border = "5px #007bff solid";
  
  selectedUser = user;
  selectedFace = index;
  selectedFaceList = selector;
  if (!isSetup){
    updateFace();
    updateFaceEditor();
  }
  if (selector === 'publicFaces' && !ignore) {
    faceViewed(target, user, index, selector);
  }
}

/* Updated callback for when a different face is selected by the user through clicking a thumb */
function updselectedFaceChanged(target, user, index, selector) {
  console.log('selectedChanged', user, index, selector, target);
  hasNewParams = true;

  var allFaceImgs = document.getElementsByClassName("face-thumb");
  for (var i=0; i<allFaceImgs.length; i++) {
    allFaceImgs[i].style.border = "5px transparent solid";
  }
  if (target === null || target === undefined) {
    document.getElementById(user + index + selector).style.border = '5px #007bff solid';
  } else {
    target.style.border = "5px #007bff solid";
  }
  var notif = document.getElementById('notif' + user + index);
  if (notif) {
    notif.setAttribute('style', 'display: none;');
  }
  
  selectedUser = user;
  selectedFace = index;
  selectedFaceList = selector;

  updateFace();
  updateFaceEditor();
  if (selector === 'publicFaces') faceViewed(target, user, index, selector);
}

/* Callback function for when the current face is renamed, to update the database accordingly*/
function faceRenamed() {
  if (selectedUser == Database.displayName) {
    var dir = "users/" + selectedUser;
    var dbRef = firebase.database().ref(dir + "/robot/customAPI/states/faces/" + selectedFace + "/");
    var newParamObj = {};
    var faceName = document.getElementById("faceName");
    newParamObj.name = faceName.value;
    dbRef.update(newParamObj);
  }
  else {
    console.log("You cannot rename other users' faces.")
  }
}

/* Callback function for when the current face description is renamed, to update the database accordingly*/
function descriptionChanged() {
  if (selectedUser == Database.displayName) {
    var dir = "users/" + selectedUser;
    var dbRef = firebase.database().ref(dir + "/robot/customAPI/states/faces/" + selectedFace + "/");
    var newParamObj = {};
    var faceDescription = document.getElementById('faceDescription');
    newParamObj.description = faceDescription.value
    dbRef.update(newParamObj);
  }
  else {
    console.log("You cannot change other users' faces.")
  }
}

/* Mark face as viewed in the database */
function faceViewed(target, user, index, selector) {
  if (selector === 'publicFaces' && target !== null && user !== null && index !== null) {
    if (!currentUserPublicData.viewedFaces) {
      // Logged in user does not have the viewedFaces field yet
      forceUpdateAll = true;
      var dir = 'users/' + Database.displayName;
      var dbRef = firebase
        .database()
        .ref(dir + '/public/viewedFaces/' + user);
      dbRef.update({ 0: index }).then(() => {
        selectedFaceChanged(target, user, index, selector, true);
      });
    } else if (!currentUserPublicData.viewedFaces[user]) {
      // Logged in user has not viewed any other user
      forceUpdateAll = true;
      var dir = 'users/' + Database.displayName;
      var dbRef = firebase
        .database()
        .ref(dir + '/public/viewedFaces/' + user);
      dbRef.update({ 0: index }).then(() => {
        selectedFaceChanged(target, user, index, selector, true);
      });
    } else if (!currentUserPublicData.viewedFaces[user].includes(index)) {
      // Logged in user has viewed other faces by this user, but not this face
      forceUpdateAll = true;
      var dir = 'users/' + Database.displayName;
      var dbRef = firebase
        .database()
        .ref(dir + '/public/viewedFaces/' + user);
      var upd = {};
      upd[currentUserPublicData.viewedFaces[user].length] = index;
      dbRef.update(upd).then(() => {
        selectedFaceChanged(target, user, index, selector, true);
      });
    }
  }
  // var obj = {};
  // obj.val = function() {
  //   return allUserData;
  // };
  // updateAllUsersFaceList(obj);
}

/* Function to update the thumb corresponding to face parameters in the database */
function updateFaceThumb(user, id) {
  if (user === Database.displayName && selectedFaceList !== 'publicFaces') {
    var svg = document.getElementById('faceSVG');
    var imgsrc = svg2img(svg);
    var dbRef =
      (selectedFaceList !== 'publicFaces')
      ? firebase.database().ref('users/' + user + '/robot/customAPI/states/faces/' + id + '/')
      : firebase.database().ref('users/' + user + '/public/faces/' + id + '/');
    var newThumb = {thumb:imgsrc};
    dbRef.update(newThumb);
  }
}

/* Utility function */
function getThumbImage(faceParameters) {
  var thumbImg = ""; 
  if (faceParameters !== null && faceParameters !== undefined)
    thumbImg = faceParameters.thumb;
  return thumbImg;
}

/* Utility function to convert current SVG into a URL image*/
function svg2img(svg){
  var xml = new XMLSerializer().serializeToString(svg);
  var svg64 = btoa(xml); //for utf8: btoa(unescape(encodeURIComponent(xml)))
  var b64start = 'data:image/svg+xml;base64,';
  var image64 = b64start + svg64;
  return image64;
}

// TODO
function addPresetFace() {
  var dir = 'robots/' + (currentRobot) + "/customAPI/state/";
  var user = allFaceIndexes[currentConfig].user;
  var index = allFaceIndexes[currentConfig].index;
  faces.push({user:user, index:index});
  var dbRef = firebase.database().ref(dir);
  dbRef.update({presetFaces:faces});
}

function shareFace() {
  var shareButton = document.getElementById('shareFace');
  shareButton.innerHTML = 'Shared!';
  shareButton.disabled = true;

  var newFaceIndex = 0;
  if (currentUserPublicData != null && currentUserPublicData.faces != undefined)
    newFaceIndex = currentUserPublicData.faces.length;
  var dir = 'users/' + Database.displayName;
  var dbRef = firebase
    .database()
    .ref(dir + '/public/faces/' + newFaceIndex + '/');
  forceUpdateAll = true;
  const timestamp = (new Date()).toLocaleString();
  dbRef.set({ ...newParameters, timestamp }, function (error) {
    console.log(error);
  });
  recordData('sharedFace', { name: newParameters.name, description: newParameters.description ? newParameters.description : '' });
  var newIndex = 0;
  allUserData.forEach((element) => { if (element.user === selectedUser) { newIndex++ } } );
  console.log(newIndex - 1);
  selectedFace = newIndex - 1;
  selectedFaceList = 'publicFaces';
  updselectedFaceChanged(null, selectedUser, selectedFace, selectedFaceList);
}

/* 
 * Function to set the currently selected face as the robot face in the database
 */
function setCurrentFace() {
  if (selectedFaceList === 'privateFaces') {
    var dbRef = firebase
      .database()
      .ref('/users/' + Database.displayName + '/robot/state/');
    dbRef.update({ 'currentFace': selectedFace }, function (error) {
      console.log(error);
    });
  } else if (selectedFaceList === 'publicFaces') {
    createNewFace();
    var dbRef = firebase
      .database()
      .ref('/users/' + Database.displayName + '/robot/state/');
    dbRef.update({ currentFace: selectedFace }, function (error) {
      console.log(error);
    });
  }
}

/* 
 * Function to add a copy of the currently displayed face to the current user's face list on the database
 */
function createNewFace() {
  var newIndex = currentUserData.faces.length;
  newParameters['public'] = false;
  storeUserFace(newParameters);
  recordData('copiedFaceFromPublic', {});
  updselectedFaceChanged(document.getElementById(Database.displayName + newIndex + 'privateFaces'), Database.displayName, newIndex, 'privateFaces');
}

/*
 * Function to create a new default face for the user to edit and share 
 */
function createDefaultFace() {
  // Load Default Face
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      var defaultFace = JSON.parse(this.responseText);
      storeUserFace(defaultFace);
    }
  };
  xmlhttp.open('GET', './default_face.json', true);
  xmlhttp.send();
}

/*
 * Function to store a face object to the user's database: users/uid/robot/customapi/states/faces/index/faceParameters 
 */
function storeUserFace(faceParameters) {
  var newFaceIndex = 0;
  if (currentUserData != null && currentUserData.faces != undefined)
    newFaceIndex = currentUserData.faces.length;
  var dir = 'users/' + Database.displayName;
  var dbRef = firebase
    .database()
    .ref(dir + '/robot/customAPI/states/faces/' + newFaceIndex + '/');
  dbRef.set(faceParameters, function(error) {
    console.log(error);
  });
}

function backToIndexPage() {
  calculateTime(
    sessionStorage.getItem('startEditTime'),
    new Date().getTime(),
    'faceEdit'
  );
  window.location.href = "index.html";
}

function recordData(category, data = {}) {
  const date = new Date();
  dir =
    'users/' +
    firebase.auth().currentUser.displayName +
    '/faceEdit/' +
    date.toDateString() +
    '/' + category;
  dbRef = firebase.database().ref(dir);
  dbRef.push().set({
    timestamp: date.toLocaleString(),
    ...data,
  });
  console.log('Logging data: ----------');
}

function calculateTime(start, end, event) {
  var dur = (end - start) / 1000;
  var currDate = new Date().toDateString();
  console.log(dur);
  var dir =
    'users/' +
    firebase.auth().currentUser.displayName +
    '/' +
    event + '/' +
    currDate +
    '/duration/';
  var dbRef = firebase.database().ref(dir);
  dbRef.push().set({
    date: currDate,
    time_start: start,
    time_end: end,
    duration_sec: dur,
  });
  console.log('Logging diary time: ----------');
}
