var config = new Config();
var db = new Database(config.config, initializeEdit);
var face = new Face();

function initializeEdit() {
  isEdit = true;

  var dbUserRef = firebase.database().ref('/users/');
  // var dbUserRef = firebase.database().ref('/robots/'); // Can use to get all old faces
  dbUserRef.on('value', renderPublicFaces);

  var dbUserRef = firebase.database().ref('/users/' + Database.displayName + "/robot/");
  dbUserRef.on("value", currentUserDataChanged);

  var dbUserRef = firebase.database().ref('/users/' + Database.displayName + '/public/');
  dbUserRef.on('value', currentUserPublicDataChanged);

  window.onresize = Face.draw;
  var uid = firebase.auth().currentUser.uid;
  var uidDiv = document.getElementById('uid');
  uidDiv.innerHTML = Database.displayName;
}

function currentUserDataChanged(snapshot) {
  let robotData = snapshot.val();
  if (
    robotData['customAPI'] &&
    robotData['customAPI']['states'] &&
    robotData['customAPI']['states']['faces']
  ) {
    // currentUserData = robotData['customAPI']['states']; // Right now gets contents of user/uid/public, so object with key 'faces'
    renderPrivateFaces(robotData['customAPI']['states']);
  } else {
    currentUserData = {
      faces: [],
    }
  }

  // updateUserFaceList();
  updateFace();
  updateFaceEditor();
}

function currentUserPublicDataChanged(snapshot) {
  currentUserPublicData = snapshot.val();
  if (!currentUserPublicData) {
    currentUserPublicData = {};
  }
  if (!currentUserPublicData['faces']) {
    currentUserPublicData.faces = [];
  }
  // if (!currentUserPublicData['viewedFaces']) {
  //   currentUserPublicData.viewedFaces = {};
  // }
}

function updateFaceEditor() {
  if (allUserData != null && selectedUser != null && selectedFace != null) {
    if (selectedUser == Database.displayName){
      if (selectedUser == Database.displayName && !isSetup) {
        if (selectedFaceList === 'privateFaces') {
          newParameters = currentUserData.faces[selectedFace];
        } else if (selectedFaceList === 'all') {
          newParameters = allUserData.find((element) => element.user === selectedUser && element.index === selectedFace);
          // newParameters = allUserData[selectedUser].faces[selectedFace];
        }
      }
    }
    else {
      newParameters = allUserData.find(
        (element) =>
          element.user === selectedUser && element.index === selectedFace
      );
    }
  
      var mainDiv = document.getElementById("faceParameters");

      if (selectedUser == Database.displayName && selectedFaceList === 'privateFaces') {

        /* Check if the scales are created already */
        var scaleExample = document.getElementById("eyeCenterDistPercent");
        if (scaleExample === null || true) {
          mainDiv.innerHTML = "";
          /* Number type parameters, selected with sliders*/
          for (var i = 0; i < Object.keys(newParameters).length; i++) {
            var key = Object.keys(newParameters)[i];
            var param = newParameters[key];
            if (param.v2eyes === undefined) {
              if (param.type == "number" && !param.name.toLowerCase().includes('voice')) {
                var nIncrements = 20;
                if (param.nIncrements !== undefined)
                  nIncrements = param.nIncrements;
                mainDiv.appendChild(
                  createRangeInput(
                    key,
                    param.name,
                    param.current,
                    param.min,
                    param.max,
                    nIncrements
                  )
                );
              }
            }
          }

          /* Color parameters */
          for (i = 0; i < Object.keys(newParameters).length; i++) {
            key = Object.keys(newParameters)[i];
            param = newParameters[key];
            if (param.v2eyes === undefined) {
              if (param.type == "color") {
                createColorInput(key, param.name, param.current);
              }
            }
          }

          /* Boolean/binary parameters */
          for (i = 0; i < Object.keys(newParameters).length; i++) {
            key = Object.keys(newParameters)[i];
             param = newParameters[key];
            if (param.v2eyes === undefined) {
              if (param.type == "boolean") {
                createBooleanInput(key, param.name, param.current, ["a", "b"]);
              }
            }
          }
        } else {
          updateScales(newParameters);
        }

        var faceName = document.getElementById("faceName");
        faceName.disabled="";
        if (newParameters.name !== undefined) {
          faceName.value = newParameters.name;
        } else {
          faceName.value = "";
          faceName.placeholder = "face name";
        }

        var faceDescription = document.getElementById('faceDescription');
        faceDescription.disabled = '';
        if (newParameters.description !== undefined) {
          faceDescription.value = newParameters.description;
        } else {
          faceDescription.value = '';
          faceDescription.placeholder = 'description';
        }

        // Enable share face button
        var shareButton = document.getElementById("shareFace");
        if (newParameters.public) {
          shareButton.innerHTML = 'Shared!';
          disableButton('shareFace');
        } else {
          shareButton.innerHTML = 'Share Face in Public Gallery!';
          enableButton('shareFace');
        }
      }
    else {
        // mainDiv.innerHTML =
        //   "You cannot edit this face. Click the 'Add new' button above to copy this face and edit it.";
        mainDiv.innerHTML =
          '<button class="btn btn-success" type="button" onclick="createNewFace()">Click me to add this face to your Private Gallery and edit!</button>';
        faceName = document.getElementById("faceName");
        faceName.disabled="disabled";
        faceDescription = document.getElementById('faceDescription');
        faceDescription.disabled = 'disabled';
        if (newParameters.name !== undefined) {
          faceName.value = newParameters.name;
        } else {
          faceName.value = "";
          faceName.placeholder = "face name";
        }
        if (newParameters.description !== undefined) {
          faceDescription.value = newParameters.description;
        } else {
          faceDescription.value = '';
          faceDescription.placeholder = 'description';
        }
        document.getElementById('shareFace').innerHTML = 'Share Face in Public Gallery!';
        disableButton('shareFace');
      }

      Face.draw();
  }

  function updateScales(params) {
    for (var i = 0; i < Object.keys(params).length; i++) {
      var key = Object.keys(params)[i];
      var param = params[key];
      if (param.type == "number") {
        var scale = document.getElementById(key + "Scale");
        if (scale !== null) scale.value = Number(param.current);
        var valueDiv = document.getElementById(key + "Value");
        if (valueDiv !== null) valueDiv.innerHTML = param.current;
      } else if (param.type == "color") {
        var elem = document.getElementById(key + "Color");
        if (elem !== null) elem.value = param.current;
      } else if (param.type == "boolean") {
        var trueBtn = document.getElementById(key + "Choice1");
        var falseBtn = document.getElementById(key + "Choice0");
        if (trueBtn !== null && falseBtn !== null) {
          trueBtn.checked = false;
          falseBtn.checked = false;
          if (param.current == 1) trueBtn.checked = true;
          else falseBtn.checked = true;
        }
      }
    }
  }
}

function createBooleanInput(id, name, current, optionNames) {
  // TEMPORARY FOR CEMAR
  if (id === 'hasText') {
    return;
  }
  var radio1 =
    ' Yes <input type="radio" onchange="newParameterValue(this, \'current\')" ' +
    " name = " +
    id +
    " value=1 id= " +
    id +
    "Choice1";
  var radio2 =
    ' No <input type="radio" onchange="newParameterValue(this, \'current\')" ' +
    " name = " +
    id +
    " value=0 id= " +
    id +
    "Choice0";

  if (current == 1) {
    radio1 += " checked>";
    radio2 += ">";
  } else {
    radio2 += " checked>";
    radio1 += ">";
  }

  var boolSelectorHTML =
    '<div class="sliderName"> <strong>' +
    name +
    "</strong></div>" +
    "<div>" +
    radio1 +
    radio2 +
    "</div>";

  var boolPickers = document.getElementsByClassName("bool-picker");
  
  var mainDiv = document.getElementById("faceParameters");
  if (boolPickers.length > 0) {
    var boolPicker = boolPickers[0];
    boolPicker.innerHTML += boolSelectorHTML;
  } else {
    boolPicker = document.createElement("div");
    boolPicker.className = "bool-picker";
    boolPicker.innerHTML = boolSelectorHTML;
    mainDiv.appendChild(boolPicker);
  }
}

function createColorInput(id, name, current) {
  var colorPickers = document.getElementsByClassName("colorPicker");
  var mainDiv = document.getElementById("faceParameters");
  if (colorPickers.length > 0) {
    var colorPicker = colorPickers[0];
    colorPicker.innerHTML +=
      '<div class="sliderName"> ' +
      name +
      ":</div>" +
      '<div> <input type="color" onchange="newParameterValue(this, \'current\')" ' +
      " name = " +
      id +
      " id = " +
      id +
      "Color" +
      ' value="' +
      current +
      '"> </div>';
  } else {
    colorPicker = document.createElement("div");
    colorPicker.className = "colorPicker";
    colorPicker.innerHTML =
      '<div class="sliderName"> ' +
      name +
      ":</div>" +
      '<div> <input type="color" onchange="newParameterValue(this, \'current\')" ' +
      " name = " +
      id +
      " id = " +
      id +
      "Color" +
      ' value="' +
      current +
      '"> </div>';
    mainDiv.appendChild(colorPicker);
  }
}

function createRangeInput(id, name, current, min, max, nIncrements) {
  var scale = document.createElement("div");
  scale.className = "scale";
  scale.id = id;
  scale.innerHTML = getRangeHTML(id, name, current, min, max, nIncrements);
  return scale;
}

function getRangeHTML(id, name, current, min, max, nIncrements) {
  return (
    '<div class="sliderName">' +
    name +
    ":</div>" +
    // '<div class="sliderValue" id= "' +
    // id +
    // 'Value">' +
    // current +
    // "</div>" +
    // '<div class="min-value"> <input class="min" type="text" name=' + id 
    // + ' onblur="newParameterValue(this, \'min\')" value=' +
    // min +
    // "> </div>" +
    "<div>" +
    '<input type="range" class="slider" ' + //list="' + name + 'tickmarks" ' +
    " min=" + min + " max=" + max + " step =" + (max - min) / nIncrements +
    ' onchange="newParameterValue(this, \'current\')" id=' + id + "Scale" + " name=" + id +
    " value=" +current + "> </div>" //+getDataList(name, min, max, nIncrements)
    // '<div class="max-value"> <input class="max" type="text" name=' + id 
    // + ' onblur="newParameterValue(this, \'max\')" value=' +
    // max +
    // "> </div>"
    );
}

function getDataList(name, min, max, nIncrements) {
  var htmlText = '<datalist id="' + name + 'tickmarks">';
  for (var i = 0; i < nIncrements; i++) {
    var value = min + i * (max - min);
    if (i == 0 || i == nIncrements - 1 || i == Math.round(nIncrements / 2))
      htmlText += '<option value="' + value + '" label="' + value + '">';
    else htmlText += '<option value="' + value + '">';
  }
  htmlText += "</datalist>";
  return htmlText;
}

// Update the database in response to a UI event
function newParameterValue(target, param) {
  if (Database.displayName !== null) {
    var dir = "users/" + Database.displayName;
    var dbRef = firebase.database().ref(dir + "/robot/customAPI/states/faces/" + selectedFace + "/");
    var updates = {};
    
    var key = target.name;
    var newParam = newParameters[key];
    
    if (newParam.type && (newParam.type == "number" || newParam.type == "boolean")){
      if (param == "min" || param == "max")
        newParam[param] = Number(target.value);
      else
        newParam.current = Number(target.value);
    }
    else
    {
      newParam.current = target.value;
    }

    var newParamObj = {};
    newParamObj[key] = newParam;
    
    dbRef.update(newParamObj);
    hasNewParams = true;
  }
}

function disableButton(buttonID) {
  var button = document.getElementById(buttonID);
  button.disabled = true;
}

function enableButton(buttonID) {
  var button = document.getElementById(buttonID);
  button.disabled = false;
}
