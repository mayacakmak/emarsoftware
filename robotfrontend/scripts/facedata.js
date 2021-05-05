var newParameters;
var allUserData = null;
var currentUserData = null;
var selectedUser = null;
var selectedFace = null;
var hasNewParams = true;
var isSetup = false;
var robotFaces = null;

/* Function that needs to be called whenever the face preview needs to be renewed */
function updateFace() {
  if (allUserData != null && selectedUser != null && selectedFace != null) {
    if (selectedUser == Database.uid && !isSetup){
      newParameters = currentUserData.faces[selectedFace];
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

  if (currentUserData.faces != undefined) {
    for (var i = 0; i < currentUserData.faces.length; i++) {

      var name = currentUserData.faces[i].name;
      if (name == undefined || name == "")
        name = "..."
      var thumbHTML = "<div class='deletable-thumb'> <div class='thumb-and-name'>";
      var imgSrc = getThumbImage(currentUserData.faces[i]);
      thumbHTML += "<img  class='face-thumb' ";
      thumbHTML += "src='" + imgSrc + "' ";
      thumbHTML += "onclick='selectedFaceChanged(this, \"" + Database.uid + "\","+ i + ")'";
      thumbHTML += "><p>" + name + " </p></div>";
      thumbHTML += "<div class='delete-x-button'><button type='button' ";
      thumbHTML += "onclick='removeUserFace(" + i + ")' class='btn btn-secondary btn-circle-sm'>X</button></div>"
      thumbHTML += "</div>";
      
      myFaceList.innerHTML += thumbHTML;
    }
  }
}
  
/* Callback function to remove current user's face when the X button is clicked */
function removeUserFace(index) {
  var newRobotFaces = currentUserData.faces;
  newRobotFaces.splice(index, 1);
  var dir = '/users/' + Database.uid + "/";
  var dbRef = firebase.database().ref(dir);
  var updates = {faces: newRobotFaces};
  dbRef.update(updates);
}

/* Function to load all face data from the database */
function updateAllUsersFaceList(snapshot) {
  // Load data only once in the beginning of each session
  if (allUserData == null) {
    
    allUserData = snapshot.val();
    var otherFaceList = document.getElementById("otherFaceList");
    if (otherFaceList != undefined) {
      otherFaceList.innerHTML = "";
    }
    
    var allUserKeys = Object.keys(allUserData);
    var currentUserIndex = allUserKeys.indexOf(Database.uid);
    allUserKeys.splice(currentUserIndex,1);
    allUserKeys.unshift(Database.uid);

    for (var j = 0; j < allUserKeys.length; j++) {
      var id = allUserKeys[j];
           
      // If setup, include the current user's faces at the beginning
      if (id != Database.uid || isSetup) {

        var userData = allUserData[id];

        var nUserConfigs = 0;
        if (userData.faces != null && userData.faces != undefined)
          nUserConfigs = userData.faces.length;
        
        if (selectedUser==null && nUserConfigs>0)
          selectedUser = id;

        for (i = 0; i < nUserConfigs; i++) {
          var name = userData.faces[i].name;
          if (name == undefined || name == "")
            name = "..."
          var thumbHTML = "<div class='thumb-and-name'>";
          imgSrc = getThumbImage(userData.faces[i]);
          thumbHTML += "<img  class='face-thumb' ";
          thumbHTML += "src='" + imgSrc + "' ";
          thumbHTML += "onclick='selectedFaceChanged(this, \"" + id + "\"," + i + ")'>";
          thumbHTML += "<p>" + name + " </p></div>";

          if (otherFaceList != undefined)
            otherFaceList.innerHTML += thumbHTML;
          else
            myFaceList.innerHTML += thumbHTML;
        }
      }
    }
    var allFaceImgs = document.getElementsByClassName("face-thumb");
    selectedFaceChanged(allFaceImgs[0], selectedUser, 0);
  }
}

// TODO: Update for Woz
function updateRobotFaceList(snapshot) {
  var robotFaceList = document.getElementById("robotFaceList");
  if (robotFaceList != undefined)
    robotFaceList.innerHTML = "";

  robotFaces = snapshot?.val ? snapshot.val() : snapshot;

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
  
  var dir = "robots/" + currentRobot + "/state/";
  var dbRef = firebase.database().ref(dir);
  dbRef.update({ currentFace: index });
}


/* Callback function for when a different face is selected by the user through clicking a thumb*/
function selectedFaceChanged(target, user, index) {
  hasNewParams = true;
  
  var allFaceImgs = document.getElementsByClassName("face-thumb");
  for (var i=0; i<allFaceImgs.length; i++) {
    allFaceImgs[i].style.border = "5px transparent solid";
  }
  target.style.border = "5px #007bff solid";
  
  selectedUser = user;
  selectedFace = index;
  if (!isSetup){
    updateFace();
    updateFaceEditor();
  }
}

/* Callback function for when the current face is renamed, to update the database accordingly*/
function faceRenamed() {
  if (selectedUser == Database.uid) {
    var dir = "users/" + selectedUser;
    var dbRef = firebase.database().ref(dir + "/faces/" + selectedFace + "/");
    var newParamObj = {};
    var faceName = document.getElementById("faceName");
    newParamObj.name = faceName.value;
    dbRef.update(newParamObj);
  }
  else {
    console.log("You cannot rename other users' faces.")
  }
}

/* Function to update the thumb corresponding to face parameters in the database */
function updateFaceThumb(user, id) {
  var svg = document.getElementById("faceSVG");
  var imgsrc = svg2img(svg);
  var dbRef = firebase.database().ref('users/' + user + '/faces/' + id + '/');
  var newThumb = {thumb:imgsrc};
  dbRef.update(newThumb);
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

/* 
 * Function to add a copy of the currently displayed face to the current user's face list on the database
 */
function createNewFace() {
  var newFaceIndex = 0;
  if (currentUserData.faces != undefined)
    newFaceIndex = currentUserData.faces.length;
  var dir = 'users/' + (Database.uid);
  var dbRef = firebase.database().ref(dir + '/faces/' + newFaceIndex + '/');
  dbRef.set(newParameters);
}
