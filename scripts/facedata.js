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
  if (allUserData != null && selectedUser != null && selectedFace != null) {
    if (selectedUser == Database.displayName && !isSetup){
      if (selectedFaceList === 'all') {
        newParameters = allUserData[selectedUser].faces[selectedFace];
      } else {
        newParameters = currentUserData.faces[selectedFace];
      }
    }
    else {
      var selectedUserData = allUserData[selectedUser];
      newParameters = selectedUserData.faces[selectedFace];
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
  var myFaceList = document.getElementById("myFaceList");
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
        ", \"user\")'";
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
function removeUserFace(index) {
  var newRobotFaces = currentUserData.faces;
  newRobotFaces.splice(index, 1);
  var dir = '/users/' + Database.displayName + "/robot/customAPI/states/";
  var dbRef = firebase.database().ref(dir);
  var updates = {faces: newRobotFaces};
  dbRef.update(updates);
  selectedFace = null;
  selectedFaceList = null;
}

/* Function to load all face data from the database UPDATED SO ONLY USERS/UID/PUBLIC*/
function updateAllUsersFaceList(snapshot) {
  // Load data only once in the beginning of each session
  console.log('upd all', forceUpdateAll);
  if (allUserData == null || forceUpdateAll) {
    forceUpdateAll = false;
    allUserData = snapshot.val();
    var otherFaceList = document.getElementById('otherFaceList');
    if (otherFaceList != undefined) {
      otherFaceList.innerHTML = '';
    }

    var allUserKeys = Object.keys(allUserData);
    var currentUserIndex = allUserKeys.indexOf(Database.displayName);
    // allUserKeys.splice(currentUserIndex, 1);
    // allUserKeys.unshift(Database.displayName);

    var updAllUserData = {};

    for (var j = 0; j < allUserKeys.length; j++) {
      var id = allUserKeys[j];

      // If setup, include the current user's faces at the beginning
      // if (id != Database.displayName || isSetup) {
        var userData = allUserData[id];

        if (userData.public) {
          var nUserConfigs = 0;
          var faces = userData.public.faces;
          if (faces != null && faces != undefined)
            nUserConfigs = faces.length;

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
              'onclick=\'selectedFaceChanged(this, "' + id + '",' + i + ", \"all\")'>";
            thumbHTML += '<p>' + name + ' </p></div>';
            if (
              !currentUserPublicData.viewedFaces ||
              !currentUserPublicData.viewedFaces[id] ||
              !currentUserPublicData.viewedFaces[id].includes(i)
            ) {
              thumbHTML +=
                "<div class='delete-x-button'><button type='button' ";
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
    selectedFaceChanged(allFaceImgs[0], selectedUser, 0, 'all');
  }
}
// function updateAllUsersFaceList(snapshot) {
//   // Load data only once in the beginning of each session
//   if (allUserData == null) {
    
//     allUserData = snapshot.val();
//     var otherFaceList = document.getElementById("otherFaceList");
//     if (otherFaceList != undefined) {
//       otherFaceList.innerHTML = "";
//     }
    
//     var allUserKeys = Object.keys(allUserData);
//     var currentUserIndex = allUserKeys.indexOf(Database.displayName);
//     allUserKeys.splice(currentUserIndex,1);
//     allUserKeys.unshift(Database.displayName);

//     for (var j = 0; j < allUserKeys.length; j++) {
//       var id = allUserKeys[j];
           
//       // If setup, include the current user's faces at the beginning
//       if (id != Database.displayName || isSetup) {

//         var userData = allUserData[id];

//         var nUserConfigs = 0;
//         if (userData.faces != null && userData.faces != undefined)
//           nUserConfigs = userData.faces.length;
        
//         if (selectedUser==null && nUserConfigs>0)
//           selectedUser = id;

//         for (i = 0; i < nUserConfigs; i++) {
//           var name = userData.faces[i].name;
//           if (name == undefined || name == "")
//             name = "..."
//           var thumbHTML = "<div class='thumb-and-name'>";
//           imgSrc = getThumbImage(userData.faces[i]);
//           thumbHTML += "<img  class='face-thumb' ";
//           thumbHTML += "src='" + imgSrc + "' ";
//           thumbHTML += "onclick='selectedFaceChanged(this, \"" + id + "\"," + i + ",\"all\")'>";
//           thumbHTML += "<p>" + name + " </p></div>";

//           if (otherFaceList != undefined)
//             otherFaceList.innerHTML += thumbHTML;
//           else
//             myFaceList.innerHTML += thumbHTML;
//         }
//       }
//     }
//     var allFaceImgs = document.getElementsByClassName("face-thumb");
//     selectedFaceChanged(allFaceImgs[0], selectedUser, 0,'all');
//   }
// }

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

//   for (var i=0; i<robotFaces.length; i++) {
//     var thumbImg = ""; 
//     var thumbHTML = "";
//     var faceParameters = robotFaces[i];
//     if (faceParameters !== null)
//       thumbImg = faceParameters.thumb;

//     if (isSetup)
//       thumbHTML += "<div class='deletable-thumb'>";
//     else
//       thumbHTML += "<a>";

//     if (!isSetup && i == robotData.state.currentFace)
//       thumbHTML += "<div class='thumb-and-name'><img  class='face-thumb-selected' ";
//     else
//       thumbHTML += "<div class='thumb-and-name'><img  class='face-thumb' ";

//     thumbHTML += "src='" + thumbImg;

//     if (!isSetup)
//       thumbHTML += "' onclick='currentFaceChanged(" + i + ")";
//     thumbHTML += "' > <p>" + faceParameters.name + "</p> </div>";

//     if (isSetup)
//       thumbHTML += "<div class='delete-x-button'><button type='button' onclick='removeRobotFace(" + i + ")' class='btn btn-secondary btn-circle-sm'>X</button></div>";

//     if (isSetup)
//       thumbHTML += "</div>";
//     else
//       thumbHTML += "</a>";

//     robotFaceList.innerHTML += thumbHTML;
  // }
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
  console.log(target, user, index, selector, ignore);
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
  if (selector === "all" && !ignore) {
    faceViewed(target, user, index, selector);
  }
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
    console.log(newParamObj);
    dbRef.update(newParamObj);
  }
  else {
    console.log("You cannot change other users' faces.")
  }
}

/* Mark face as viewed in the database */
function faceViewed(target, user, index, selector) {
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
  // var obj = {};
  // obj.val = function() {
  //   return allUserData;
  // };
  // updateAllUsersFaceList(obj);
}

/* Function to update the thumb corresponding to face parameters in the database */
function updateFaceThumb(user, id) {
  if (user === Database.displayName && selectedFaceList !== 'all') {
    var svg = document.getElementById('faceSVG');
    var imgsrc = svg2img(svg);
    var dbRef =
      (selectedFaceList !== 'all')
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
  dbRef.set(newParameters, function (error) {
    console.log(error);
  });
}

/* 
 * Function to set the currently selected face as the robot face in the database
 */
function setCurrentFace() {
  var dbRef = firebase
    .database()
    .ref('/users/' + Database.displayName + '/robot/state/');
  dbRef.update({ 'currentFace': selectedFace }, function (error) {
    console.log(error);
  });
}

/* 
 * Function to add a copy of the currently displayed face to the current user's face list on the database
 */
function createNewFace() {
  newParameters['public'] = false;
  storeUserFace(newParameters);
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
  window.location.href = "index.html";
}

