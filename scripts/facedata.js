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
var forceSelectedFaceTimestamp = null;

/* Function that needs to be called whenever the face preview needs to be renewed */
function updateFace() {
  if (allUserData != null && selectedUser != null && selectedFace != null) {
    if (selectedUser == Database.displayName && !isSetup) {
      if (selectedFaceList === 'publicFaces') {
        newParameters = allUserData.find(
          (element) =>
            element.user === selectedUser && element.index === selectedFace
        );
      } else {
        newParameters = currentUserData.faces[selectedFace];
      }
    } else {
      newParameters = allUserData.find(
        (element) =>
          element.user === selectedUser && element.index === selectedFace
      );
    }
    if (!isSetup) Face.updateParameters(newParameters);

    if (hasNewParams) {
      updateFaceThumb(selectedUser, selectedFace);
      hasNewParams = false;
    }
  }
}

/* Callback function to remove current user's face when the X button is clicked */
async function removeFace(user, index, selector) {
  console.log('removing user', user, 'index', index, 'selector', selector);
  console.log(allUserData);
  var deleted = [];
  await firebase
    .database()
    .ref('/users/' + Database.displayName + '/')
    .once('value')
    .then((snapshot) => {
      console.log(snapshot.val());
      if (snapshot.val().deletedFaces) {
        deleted = snapshot.val().deletedFaces;
        console.log(deleted);
      }
    });
  if (selector === 'privateFaces') {
    if (currentUserData.faces.length === 1) {
      alert("You can't delete this face, otherwise your robot will have no face!");
      return;
    }
    deleted.push(currentUserData.faces[index]);
    console.log(deleted);
    var newRobotFaces = currentUserData.faces;
    newRobotFaces.splice(index, 1);
    var dir = '/users/' + Database.displayName + '/robot/customAPI/states/';
    var dbRef = firebase.database().ref(dir);
    var updates = { faces: newRobotFaces };
    if (newRobotFaces.length > 0 && selectedFaceList === 'privateFaces') {
      selectedUser = user;
      if (index === selectedFace) {
        selectedFace = index === 0 ? 0 : index - 1;
      } else if (selectedFace > index) {
        selectedFace = selectedFace === 0 ? 0 : selectedFace - 1;
      }
      selectedFaceList = selector;
      updselectedFaceChanged(
        document.getElementById(selectedUser + selectedFace + selectedFaceList),
        selectedUser,
        selectedFace,
        selectedFaceList
      );
    }
    dbRef.update(updates);
    firebase
      .database()
      .ref('/users/' + Database.displayName)
      .update({ deletedFaces: deleted });
  } else if (selector === 'publicFaces') {
    var newPublicFaces = {};
    var count = 0;
    allUserData.forEach((element) => {
      if (element.user === user && element.index !== index) {
        newPublicFaces[count] = element;
        count++;
      } else if (element.user === user && element.index === index) {
        deleted.push(element);
        console.log(deleted);
      }
    });
    firebase.database().ref('/users/' + Database.displayName).update({ deletedFaces: deleted });
    Object.keys(newPublicFaces).forEach((element) => {
      newPublicFaces[element]['index'] = parseInt(element);
    })
    var dir = '/users/' + Database.displayName + '/public/faces/';
    var dbRef = firebase.database().ref(dir);
    if (selectedFaceList === 'publicFaces') {
      if (Object.keys(newPublicFaces).length > 0) {
        console.log('selecting a public face');
        console.log(newPublicFaces);
        selectedUser = newPublicFaces[0].user;
        selectedFace = newPublicFaces[0].index;
        selectedFaceList = 'publicFaces';
      } else if (currentUserData.faces.length > 0) {
        console.log('selecting a private face');
        selectedUser = Database.displayName;
        selectedFace = 0;
        selectedFaceList = 'privateFaces';
      } else {
        console.log('setting all to null');
        selectedUser = null;
        selectedFace = null;
        selectedFaceList = null;
      }
    }
    dbRef.set(newPublicFaces, function (error) {
      console.log('error', error);
    });
  }
}

function renderPublicFaces(snapshot) {
  console.log('renderPublicFaces');
  const updated = sortPublicFaces(snapshot.val());
  // const updated = TEMPsortPublicFaces(snapshot.val()); // Sort old ROBOT data
  if (allUserData == null || updated.length !== allUserData.length) {
    allUserData = updated;
    renderUserFaceList(updated, 'publicFaces');
  } else {
    allUserData = updated;
    if (
      selectedUser !== null &&
      selectedFace !== null &&
      selectedFaceList !== null
    ) {
      updselectedFaceChanged(
        document.getElementById(selectedUser + selectedFace + selectedFaceList),
        selectedUser,
        selectedFace,
        selectedFaceList
      );
    }
  }
  updateFace();
  updateFaceEditor();
}

/*
 * Function to sort the face data when pulling all old robot data
 */
function TEMPsortPublicFaces(snapshot) {
  const keys = Object.keys(snapshot);
  const faces = [];
  keys.forEach((element) => {
    element = snapshot[element];
    if (element.customAPI && element.customAPI.states && element.customAPI.states.faces) {
      element.customAPI.states.faces.forEach((face, index) => {
        console.log(face);
        faces.push({ ...face, user: element.name, index });
      })
    }
  });
  console.log(faces);
  return faces;
}

function renderPrivateFaces(faceData) {
  console.log('renderPrivateFaces');
  const updated = sortPrivateFaces(faceData.faces);
  if (
    currentUserData == null ||
    currentUserData.faces == null ||
    updated !== currentUserData.faces
  ) {
    if (currentUserData === null) {
      currentUserData = {};
    }
    currentUserData.faces = updated;
    renderUserFaceList(updated, 'privateFaces');
  } else {
    currentUserData.faces = updated;
    updselectedFaceChanged(
      document.getElementById(selectedUser + selectedFace + selectedFaceList),
      selectedUser,
      selectedFace,
      selectedFaceList
    );
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
    if (
      userData.public &&
      userData['group_id'] &&
      userData['group_id'] === group_id
    ) {
      var nUserConfigs = 0;
      var faces = userData.public.faces;
      if (faces != null && faces != undefined) nUserConfigs = faces.length;

      // if (selectedUser == null && nUserConfigs > 0) selectedUser = id;
      // updAllUserData[id] = {};
      // updAllUserData[id]['faces'] = faces;
      for (i = 0; i < nUserConfigs; i++) {;
        if (
          !currentUserPublicData ||
          !currentUserPublicData.viewedFaces ||
          !currentUserPublicData.viewedFaces[id] ||
          !currentUserPublicData.viewedFaces[id].includes(faces[i].timestamp)
        ) {
          newFaces.push({ ...faces[i], user: id });
        } else {
          viewedFaces.push({ ...faces[i], user: id });
        }
      }
    }
  }
  viewedFaces.sort((a, b) => {
    if (a.timestamp && b.timestamp) {
      return new Date(b.timestamp) - new Date(a.timestamp);
    } else {
      return 1;
    }
  });
  allUserData = [...newFaces, ...viewedFaces];
  allUserData.forEach((element, index) => {
    allUserData[index]['index'] = index;
  })
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
      ', "' +
      faceList +
      '")\'>';
    thumbHTML += '<p>' + name + ' </p></div>';
    if (
      faceList === 'publicFaces' &&
      (!currentUserPublicData ||
        !currentUserPublicData.viewedFaces ||
        !currentUserPublicData.viewedFaces[element.user] ||
        !currentUserPublicData.viewedFaces[element.user].includes(
          element.timestamp
        ))
    ) {
      thumbHTML += "<div class='delete-x-button'><button type='button' ";
      thumbHTML += "id='notif" + element.user + element.index + "' ";
      thumbHTML += " class='btn btn-success btn-circle-sm'>!</button></div>";
      thumbHTML += '</div>';
    }
    if (faceList === 'privateFaces' || element.user === Database.displayName) {
      thumbHTML += "<div class='delete-x-button'><button type='button' ";
      thumbHTML +=
        'onclick=\'removeFace("' +
        element.user +
        '", ' +
        element.index +
        ' ,"' +
        faceList +
        "\")' class='btn btn-secondary btn-circle-sm'>X</button></div>";
      thumbHTML += '</div>';
    }
    otherFaceList.innerHTML += thumbHTML;
  });
  if (
    selectedUser === null ||
    selectedFace === null ||
    selectedFaceList === null
  ) {
    if (faceData.length > 0) {
      selectedUser = faceData[0].user;
      selectedFace = faceData[0].index;
      selectedFaceList = faceList;
    }
  }
  if (forceSelectedFaceTimestamp !== null) {
    console.log('forceSelectedUpdating');
    console.log(allUserData);
    if (Array.isArray(allUserData)) {
      allUserData.forEach((element, index) => {
        if (element.timestamp === forceSelectedFaceTimestamp) {
          selectedUser = element.user;
          selectedFace = index; 
          selectedFaceList = 'publicFaces';
        }
      });
      console.log('selectedUser', selectedUser, 'selectedFace', selectedFace);
    }
    forceSelectedFaceTimestamp = null;
  }
  updselectedFaceChanged(
    document.getElementById(selectedUser + selectedFace + selectedFaceList),
    selectedUser,
    selectedFace,
    selectedFaceList
  );
}

/* Updated callback for when a different face is selected by the user through clicking a thumb */
function updselectedFaceChanged(target, user, index, selector) {
  console.log(user, index, selector);
  hasNewParams = true;
  var allFaceImgs = document.getElementsByClassName('face-thumb');
  for (var i = 0; i < allFaceImgs.length; i++) {
    allFaceImgs[i].style.border = '5px transparent solid';
  }
  if (target === null || target === undefined) {
    console.log('user', user, 'index', index, 'selector', selector)
    document.getElementById(user + index + selector).style.border =
      '5px #007bff solid';
  } else {
    target.style.border = '5px #007bff solid';
  }
  if (selector === 'publicFaces') {
    var notif = document.getElementById('notif' + user + index);
    if (notif) {
      notif.setAttribute('style', 'display: none;');
    }
  }

  selectedUser = user;
  selectedFace = index;
  selectedFaceList = selector;

  if (selectedFaceList === 'publicFaces') {
    document
      .getElementById('setCurrentFacePublic')
      .setAttribute('style', 'display: block');
    document
      .getElementById('setCurrentFacePrivate')
      .setAttribute('style', 'display: none');
  } else {
    document
      .getElementById('setCurrentFacePublic')
      .setAttribute('style', 'display: none');
    document
      .getElementById('setCurrentFacePrivate')
      .setAttribute('style', 'display: block');
  }

  updateFace();
  updateFaceEditor();
  if (selector === 'publicFaces') {
    faceViewed(target, user, index, selector);
  }
}

/* Callback function for when the current face is renamed, to update the database accordingly*/
function faceRenamed() {
  if (selectedUser == Database.displayName) {
    var dir = 'users/' + selectedUser;
    var dbRef = firebase
      .database()
      .ref(dir + '/robot/customAPI/states/faces/' + selectedFace + '/');
    var newParamObj = {};
    var faceName = document.getElementById('faceName');
    newParamObj.name = faceName.value;
    dbRef.update(newParamObj);
  } else {
    console.log("You cannot rename other users' faces.");
  }
}

/* Callback function for when the current face description is renamed, to update the database accordingly*/
function descriptionChanged() {
  if (selectedUser == Database.displayName) {
    var dir = 'users/' + selectedUser;
    var dbRef = firebase
      .database()
      .ref(dir + '/robot/customAPI/states/faces/' + selectedFace + '/');
    var newParamObj = {};
    var faceDescription = document.getElementById('faceDescription');
    newParamObj.description = faceDescription.value;
    dbRef.update(newParamObj);
  } else {
    console.log("You cannot change other users' faces.");
  }
}

/* Mark face as viewed in the database */
function faceViewed(target, user, index, selector) {
  if (
    selector === 'publicFaces' &&
    target !== null &&
    user !== null &&
    index !== null
  ) {
    const timestamp = allUserData[index].timestamp;
    if (!currentUserPublicData.viewedFaces) {
      // Logged in user does not have the viewedFaces field yet
      forceUpdateAll = true;
      var dir = 'users/' + Database.displayName;
      var dbRef = firebase.database().ref(dir + '/public/viewedFaces/' + user);
      dbRef.update({ 0: timestamp }).then(() => {
        updselectedFaceChanged(target, user, index, selector, true);
      });
    } else if (!currentUserPublicData.viewedFaces[user]) {
      // Logged in user has not viewed any other user
      forceUpdateAll = true;
      var dir = 'users/' + Database.displayName;
      var dbRef = firebase.database().ref(dir + '/public/viewedFaces/' + user);
      dbRef.update({ 0: timestamp }).then(() => {
        updselectedFaceChanged(target, user, index, selector, true);
      });
    } else if (!currentUserPublicData.viewedFaces[user].includes(timestamp)) {
      // Logged in user has viewed other faces by this user, but not this face
      forceUpdateAll = true;
      var dir = 'users/' + Database.displayName;
      var dbRef = firebase.database().ref(dir + '/public/viewedFaces/' + user);
      var upd = {};
      upd[currentUserPublicData.viewedFaces[user].length] = timestamp;
      dbRef.update(upd).then(() => {
        updselectedFaceChanged(target, user, index, selector, true);
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
      selectedFaceList !== 'publicFaces'
        ? firebase
            .database()
            .ref('users/' + user + '/robot/customAPI/states/faces/' + id + '/')
        : firebase
            .database()
            .ref('users/' + user + '/public/faces/' + id + '/');
    var newThumb = { thumb: imgsrc };
    dbRef.update(newThumb);
  }
}

/* Utility function */
function getThumbImage(faceParameters) {
  var thumbImg = '';
  if (faceParameters !== null && faceParameters !== undefined)
    thumbImg = faceParameters.thumb;
  return thumbImg;
}

/* Utility function to convert current SVG into a URL image*/
function svg2img(svg) {
  var xml = new XMLSerializer().serializeToString(svg);
  var svg64 = btoa(xml); //for utf8: btoa(unescape(encodeURIComponent(xml)))
  var b64start = 'data:image/svg+xml;base64,';
  var image64 = b64start + svg64;
  return image64;
}

// TODO
function addPresetFace() {
  var dir = 'robots/' + currentRobot + '/customAPI/state/';
  var user = allFaceIndexes[currentConfig].user;
  var index = allFaceIndexes[currentConfig].index;
  faces.push({ user: user, index: index });
  var dbRef = firebase.database().ref(dir);
  dbRef.update({ presetFaces: faces });
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
  const timestamp = new Date().toLocaleString();
  forceSelectedFaceTimestamp = timestamp;
  dbRef.set({ ...newParameters, timestamp }, function (error) {
    console.log(error);
  });
  recordData('sharedFace', {
    name: newParameters.name,
    description: newParameters.description ? newParameters.description : '',
  });
  var newIndex = 0;
  allUserData.forEach((element) => {
    if (element.user === selectedUser) {
      newIndex++;
    }
  });
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
    dbRef.update({ currentFace: selectedFace }, function (error) {
      if (error) {
        console.log(error);
      }
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
  // const redirect = confirm('Would you like to check out your Robot\'s new Face? You should try it out on your phone!');
  // if (redirect) {
  //   sessionStorage.setItem('startFaceRenderTime', new Date().getTime());
  //   goTo('render-face.html');
  //   // window.location.href = 'render-face.html';
  // }
}

function goToFaceRender() {
  sessionStorage.setItem('startFaceRenderTime', new Date().getTime());
  goTo('render-face.html');
  // window.location.href = 'render-face.html';
}

/*
 * Function to add a copy of the currently displayed face to the current user's face list on the database
 */
function createNewFace(parameters = newParameters, defaultFace = false) {
  var newIndex = currentUserData.faces.length;
  parameters['public'] = false;
  storeUserFace(parameters);
  if (defaultFace) {
    recordData('createdNewFace', {});
  } else {
    recordData('copiedFaceFromPublic', {});
  }
  updselectedFaceChanged(
    document.getElementById(Database.displayName + newIndex + 'privateFaces'),
    Database.displayName,
    newIndex,
    'privateFaces'
  );
  var gallery = document.getElementById('privateGallery')
  gallery.scrollLeft = gallery.scrollWidth;
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
      createNewFace(defaultFace, true);
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
  dbRef.set(faceParameters, function (error) {
    console.log(error);
  });
}

function backToIndexPage() {
//   calculateTime(
//     sessionStorage.getItem('startEditTime'),
//     new Date().getTime(),
//     'faceEdit'
//   );
  window.location.href = 'index.html';
}

function recordData(category, data = {}) {
  const date = new Date();
  dir =
    'users/' +
    firebase.auth().currentUser.displayName +
    '/faceEdit/' +
    date.toDateString() +
    '/' +
    category;
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
  var dir =
    'users/' +
    firebase.auth().currentUser.displayName +
    '/' +
    event +
    '/' +
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

function goTo(url) {
  var a = document.createElement('a');
  if (!a.click) {
    //for IE
    window.location = url;
    return;
  }
  a.setAttribute('href', url);
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
}
