var config = new Config();
var db = new Database(config.config, initializeSetup);
var currentRobot = 0;
var utterances = null;
var bellyScreens;
var sounds;
var robotSounds;

function initializeSetup() {
  isSetup = true;
  
  var robotParam = Config.getURLParameter("robot");
  if (robotParam != null)
    currentRobot = Number(robotParam);
  console.log("currentRobot: " + currentRobot);

  var dbUserRef = firebase.database().ref('/users/');
  dbUserRef.on("value", updateAllUsersFaceList);
  
  var dbRobotRef = firebase.database().ref('/robots/' + currentRobot + "/customAPI/states/faces/");
  dbRobotRef.on("value", updateRobotFaceList);
  
  var dbUtterRef = firebase.database().ref('/robots/' + currentRobot + "/customAPI/actions/presetSpeak/");
  dbUtterRef.on("value", updateUtteranceList);
  
  var dbInputRef = firebase.database().ref('/robots/' + currentRobot + "/customAPI/inputs/bellyScreens/");
  dbInputRef.on("value", updateBellyScreenList);
  
  var dbAllSoundsRef = firebase.database().ref('/robotapi/media/sounds/');
  dbAllSoundsRef.on("value", updateSoundList);

  var dbRobotSoundsRef = firebase.database().ref('/robots/' + currentRobot + "/customAPI/actions/sounds/");
  dbRobotSoundsRef.on("value", updateRobotSoundList);   
  window.onresize = Face.draw;

  var dbRefMotor = firebase.database().ref('/robots/' + currentRobot + '/state/motors/');
  var currentMotorState = null;
  dbRefMotor.once('value', (snapshot) => {
    if (snapshot.val() == null) {
      console.log('No movement enabled for this robot. Activating button.');
      var motorBtn = document.getElementById("enableMotorsBtn");
      motorBtn.removeAttribute('disabled');
      motorBtn.setAttribute('onclick', 'enableMotors()');
    }
  });
}

function updateRobotSoundList(snapshot) {
  robotSounds = snapshot.val();

  var robotSoundsDiv = document.getElementById("robotSoundsList");
  if (robotSounds != null && robotSounds.length >0) {
    var robotSoundsHTML = "";
    for (var i=0; i<robotSounds.length; i++) {
      robotSoundsHTML += "<a class='list-group-item list-group-item-action'>";
      robotSoundsHTML += "<input type='text' class='name' name='name' onblur='changeSoundName(this, " + i + ")' value='" + robotSounds[i].name + "'>";
      robotSoundsHTML += "<button class='btn btn-success btn-delete' onclick=playSound('robotsound" 
        + i + "')> Play </button>";
      robotSoundsHTML += "<button class='btn btn-danger btn-delete' onclick=deleteSound("
        + i + ")> Delete </button>";
      var soundElementName = "robotsound" + i;
      robotSoundsHTML += "<audio style='display: none;' id='" + soundElementName +
        "' preload src='" + robotSounds[i].path + "'>"
      robotSoundsHTML += "</a>";
    }
  }
  else
    robotSoundsHTML = "No sounds"
  robotSoundsDiv.innerHTML = robotSoundsHTML;
}

function changeSoundName(target, index) {
  robotSounds[index].name = target.value;
  var dir = 'robots/' + (currentRobot) + "/customAPI/actions/";
  var dbRef = firebase.database().ref(dir);
  var updates = {"sounds": robotSounds};
  dbRef.update(updates);
}

function playSound(elementId) {
  document.getElementById(elementId).play();
}

function addSound(soundIndex) {
  if (robotSounds == null)
    robotSounds = [];
  robotSounds.push({name: ('Sound '+soundIndex), path:sounds[soundIndex]});
  var dir = 'robots/' + (currentRobot) + "/customAPI/actions/";
  var dbRef = firebase.database().ref(dir);
  var updates = {"sounds": robotSounds};
  dbRef.update(updates);  
}

function deleteSound(soundIndex) {
  robotSounds.splice(soundIndex,1);
  var dir = 'robots/' + (currentRobot) + "/customAPI/actions/";
  var dbRef = firebase.database().ref(dir);
  var updates = {"sounds": robotSounds};
  dbRef.update(updates);  
}


function updateSoundList(snapshot) {
  // Load only once
  if (sounds == null) {
    sounds = snapshot.val();
    
    if (sounds != null && sounds.length >0) {
      var allSoundsDiv = document.getElementById("allSoundsList");
      var allSoundsHTML = "";
      for (var i=0; i<sounds.length; i++) {
        allSoundsHTML += "<a class='list-group-item list-group-item-action'> Sound " + i;
        allSoundsHTML += "<button class='btn btn-success btn-delete' onclick=playSound('sound" 
          + i + "')> Play </button>";
        allSoundsHTML += "<button class='btn btn-primary btn-delete' onclick=addSound("
          + i + ")> Add </button>";
        var soundElementName = "sound" + i;
        allSoundsHTML += "<audio style='display: none;' id='" + soundElementName +
            "' preload src='" + sounds[i] + "'>"
        allSoundsHTML += "</a>";
      }
      allSoundsDiv.innerHTML = allSoundsHTML;
    }
  }
}

function updateBellyScreenList(snapshot) {
  var bellyDiv = document.getElementById("bellySetup");
  bellyScreens = snapshot.val();
  var bellyHTML = "";
  
  if (bellyScreens != undefined && bellyScreens.length>0) {
    for (var i=0; i<bellyScreens.length; i++) {
      var screen = bellyScreens[i];

      bellyHTML += "<div class='left-aligned'> <input type='text' class='screen-name' name='name' onblur='changeScreenElement(this, " + i + ")' value='" + screen.name + "'> <button class='btn btn-danger btn-delete' onclick='removeScreen(" + i + ")'> Delete screen </button> </div>";
      var instructionLargeChecked = "";
      var instructionSmallChecked = "";
      var sliderChecked = "";
      var checkboxesChecked = "";
      var buttonsChecked = "";
      var backgroundColor = "";

      if (screen.instructionLarge.isShown)
          instructionLargeChecked = "checked";
      if (screen.instructionSmall.isShown)
          instructionSmallChecked = "checked";
      if (screen.slider.isShown)
          sliderChecked = "checked";
      if (screen.checkboxes.isShown)
          checkboxesChecked = "checked";
      if (screen.buttons.isShown)
          buttonsChecked = "checked";
      if (screen.backgroundColor)
          backgroundColor = screen.backgroundColor;

      bellyHTML += "<div class='screen-checkboxes'>";
      bellyHTML += "<input type='checkbox' onclick='addRemoveScreenElements(this," + i + ")' name='instructionLarge' " + instructionLargeChecked + "> <div class='mr-2'> Large instruction </div>";
      bellyHTML += "<input type='checkbox' onclick='addRemoveScreenElements(this," + i + ")' name='instructionSmall'" + instructionSmallChecked + "> <div class='mr-2'> Small instruction </div>";
      bellyHTML += "<input type='checkbox' onclick='addRemoveScreenElements(this," + i + ")' name='slider'" + sliderChecked + "> <div class='mr-2'> Slider </div>";
      bellyHTML += "<input type='checkbox' onclick='addRemoveScreenElements(this," + i + ")' name='checkboxes'" + checkboxesChecked + "> <div class='mr-2'> Checkboxes </div>";
      bellyHTML += "<input type='checkbox' onclick='addRemoveScreenElements(this," + i + ")' name='buttons'" + buttonsChecked + "> <div class='mr-2'> Buttons </div>";
      bellyHTML += "<input type='color' onchange='addRemoveScreenElements(this," + i + ")' name='backgroundColor' value='" +  backgroundColor + "'> <div class='mr-2'> Color </div>";
      bellyHTML += "</div><div class='screen-box-outer mb-4' style='background-color: " + backgroundColor +  ";'><div class='screen-box-inner'>";

      if (screen.instructionLarge.isShown) {
        bellyHTML += "<div class='screen-element'> <input type='text' class='instruction-large-setup' name='instructionLarge' onblur='changeScreenElement(this, " + i + ")' value='" + screen.instructionLarge.text.replace(/'/g, '&#39;') + "'> </div> ";
      }

      if (screen.instructionSmall.isShown) {
        bellyHTML += "<div class='screen-element'> <input type='text' class='instruction-small-setup' name='instructionSmall' onblur='changeScreenElement(this, " + i + ")' value='" + screen.instructionSmall.text.replace(/'/g, '&#39;') + "'> </div>";
      }

      if (screen.slider.isShown) {
        bellyHTML += "<div class='screen-element mt-4'>";
        bellyHTML += "<div class='min-value'> <input class='min' type='text' name='sliderMin' onblur='changeScreenElement(this, " + i + ")' value='" + screen.slider.min + "'></div>";
        bellyHTML += "<input type='range' class='screen-slider' name='slider' onchange='changeScreenElement(this, " + i + ")' value='" + screen.slider.current + "' min='0' max='100'>";
        bellyHTML += "<div class='max-value'> <input class='max' type='text' class='' name='sliderMax' onblur='changeScreenElement(this, " + i + ")' value='" + screen.slider.max + "'></div>";
        bellyHTML += "</div>";
      }

      if (screen.checkboxes.isShown) {
        bellyHTML += "<div class='screen-element mt-4'>";
        if (screen.checkboxes.names != undefined) {
          for (var j=0; j<screen.checkboxes.names.length; j++) {
            var name = screen.checkboxes.names[j];
            bellyHTML += "<div class='deletable-button mr-2 border border-light'>";
            bellyHTML += "<div><input type='checkbox'>" + name + "</div>";
            bellyHTML += "<div class='delete-checkbox-button'><button name='checkboxDelete'  onclick='changeScreenElement(this, " + i + "," + j + ")' class='btn btn-light btn-circle-sm'>X</button></div>";
            bellyHTML += "</div>";
          }
        }
        bellyHTML += "</div>";
        bellyHTML += "<div class='screen-element justify-content-end mt-2'>";
        bellyHTML += "<div><input type='text' class='right-aligned mr-1' id='checkboxAdd" + i + "' value='Choice name'>";
        bellyHTML += "<button name='checkboxAdd' onclick='changeScreenElement(this, " + i + ")' class='btn btn-primary btn-add'>Add checkbox</button> </div>";
        bellyHTML += "</div>";
      }

      if (screen.buttons.isShown) {
        bellyHTML += "<div class='screen-element mt-4'>";
        if (screen.buttons.list != undefined) {
          for (var j=0; j<screen.buttons.list.length; j++) {
            var name = screen.buttons.list[j].name;
            bellyHTML += "<div class='deletable-button mx-1'>";
            bellyHTML += "<div><button class='btn btn-secondary' disabled>" + name + "</button></div>";
            bellyHTML += "<div class='delete-btn-button'><button name='buttonDelete'  onclick='changeScreenElement(this, " + i + "," + j + ")' class='btn btn-secondary btn-circle-sm'>X</button></div>";
            bellyHTML += "</div>";
          }
        }
        bellyHTML += "</div>";
        bellyHTML += "<div class='screen-element justify-content-end mt-2'>";
        bellyHTML += "<div><input type='text' class='right-aligned mr-1' id='buttonAdd" + i + "' value='Button name'>";
        bellyHTML += "<button name='buttonAdd' onclick='changeScreenElement(this, " + i + ")' class='btn btn-primary btn-add'>Add button</button> </div>";
        bellyHTML += "</div>";
      }

      bellyHTML += "</div></div>";
    }
  }
  
  bellyHTML += "<div><button class='btn btn-primary btn-add' onclick='addScreen()'>Add new screen</button></div>";
  bellyDiv.innerHTML = bellyHTML;
  
}

function addRemoveScreenElements(target, screenID) {
  if (target.name.includes('backgroundColor')) 
    bellyScreens[screenID][target.name] = target.value;
  if (target.checked)
    bellyScreens[screenID][target.name].isShown = 1;
  else
    bellyScreens[screenID][target.name].isShown = 0;

  var dir = 'robots/' + (currentRobot) + "/customAPI/inputs/";
  var dbRef = firebase.database().ref(dir);
  var updates = {"bellyScreens": bellyScreens};
  dbRef.update(updates);
}

function changeScreenElement(target, screenID, itemID) {

  if (target.name == "name")
      bellyScreens[screenID].name = target.value;
  
  if (target.name == "instructionLarge")
      bellyScreens[screenID].instructionLarge.text = target.value;

  if (target.name == "instructionSmall")
      bellyScreens[screenID].instructionSmall.text = target.value;

  if (target.name == "slider")
      bellyScreens[screenID].slider.current = target.value;

  if (target.name == "sliderMin")
    bellyScreens[screenID].slider.min = target.value;

  if (target.name == "sliderMax")
    bellyScreens[screenID].slider.max = target.value;
  
  if (target.name == "buttonAdd") {
    var buttonNameTextInput = document.getElementById("buttonAdd" + screenID);
    if (bellyScreens[screenID].buttons.list == undefined)
      bellyScreens[screenID].buttons.list = [];
    bellyScreens[screenID].buttons.list.push({name:buttonNameTextInput.value, lastPressed:0});
  }
  
  if (target.name == "buttonDelete") {
    bellyScreens[screenID].buttons.list.splice(itemID, 1);
  }
  
  if (target.name == "checkboxAdd") {
    var buttonNameTextInput = document.getElementById("checkboxAdd" + screenID);
    if (bellyScreens[screenID].checkboxes.names == undefined)
      bellyScreens[screenID].checkboxes.names = [];
    bellyScreens[screenID].checkboxes.names.push(buttonNameTextInput.value);
  }
  
  if (target.name == "checkboxDelete") {
    bellyScreens[screenID].checkboxes.names.splice(itemID, 1);
  }

  var dir = 'robots/' + (currentRobot) + "/customAPI/inputs/";
  var dbRef = firebase.database().ref(dir);
  var updates = {"bellyScreens": bellyScreens};
  dbRef.update(updates);
}

function bellyChoiceChanged(target) {
  if (target.value == "scaleInput") {
    bellyAPI.scaleInput.isSelected = true;
    bellyAPI.multipleChoiceInput.isSelected = false;
  } 
  if (target.value == "multipleChoiceInput") {
    bellyAPI.scaleInput.multipleChoiceInput = false;
    bellyAPI.multipleChoiceInput.isSelected = true;
  } 
  var dir = 'robots/' + (currentRobot) + "/customAPI/inputs/";
  var dbRef = firebase.database().ref(dir);
  var updates = {"belly": bellyAPI};
  dbRef.update(updates);
}

function updateUtteranceList(snapshot) {
  utterances = snapshot.val();
  var utteranceDiv = document.getElementById("utteranceList");
  utteranceDiv.innerHTML = "";
  for (var i=0; i<utterances.length; i++) {
    var utteranceHTML = "<div class='tight-left-aligned'><input type='text' onblur='updateUtterance(this)' name='" + i + "' value='" + utterances[i] + "'>";
    utteranceHTML += "<button class='btn btn-danger btn-delete' onclick='deleteUtterance(this)' name='" + i + "'>Delete</button> </div>";
    utteranceDiv.innerHTML += utteranceHTML;
  }
  utteranceDiv.innerHTML += "<div><button class='btn btn-primary btn-add' onclick='addUtterance()'>Add new utterance</button></div>";
}

function updateUtterance(target) {
  var dir = 'robots/' + (currentRobot) + "/customAPI/actions/presetSpeak/";
  var dbRef = firebase.database().ref(dir);
  var updates = {};
  updates[target.name] = target.value;
  dbRef.update(updates);
}

function deleteUtterance(target) {
  var index = target.name;
  utterances.splice(index,1);
  var dir = 'robots/' + (currentRobot) + "/customAPI/actions/";
  var dbRef = firebase.database().ref(dir);
  dbRef.update({presetSpeak:utterances});
}

function addUtterance() {
  var dir = 'robots/' + (currentRobot) + "/customAPI/actions/";
  utterances.push("");
  var dbRef = firebase.database().ref(dir);
  dbRef.update({presetSpeak:utterances});
}

function addScreen() {
  var dir = 'robots/' + (currentRobot) + "/customAPI/inputs/";
  if (bellyScreens == undefined)
    bellyScreens = [];
  var screenName = 'Screen-' + (bellyScreens.length+1);
  var blankScreen = {instructionLarge: {isShown: 0, text: ""},
                    instructionSmall: {isShown: 0, text: ""},
                    slider: {isShown: 0, min: "0", max: "100", current: 50},
                    checkboxes: {isShown: 0, names: ["Choice 1"], values: [0]},
                    buttons: {isShown: 0, list: [{name:"Continue", lastPressed:0}]},
                    name: screenName};
  bellyScreens.push(blankScreen);
  var dbRef = firebase.database().ref(dir);
  dbRef.update({bellyScreens:bellyScreens});
}

function removeScreen(index) {
  var dir = 'robots/' + (currentRobot) + "/customAPI/inputs/";
  bellyScreens.splice(index, 1);
  var dbRef = firebase.database().ref(dir);
  dbRef.update({bellyScreens:bellyScreens});
}

function removeRobotFace(index) {
  robotFaces.splice(index, 1);
  var dir = 'robots/' + (currentRobot) + "/customAPI/states/";
  var dbRef = firebase.database().ref(dir);
  var updates = {faces: robotFaces};
  dbRef.update(updates);
}

function addRobotFace() {
  var dir = 'robots/' + (currentRobot) + "/customAPI/states/faces/";
  var dbRef = firebase.database().ref(dir);
  var index;
  if (robotFaces) {
    index = robotFaces.length;
  } else {
    index = 0;
  }
  var updates = {};
  var selectedUserData = allUserData[selectedUser];
  selectedFaceParameters = selectedUserData.faces[selectedFace];
  updates[index] = selectedFaceParameters;
  dbRef.update(updates);
}

function enableMotors() {
  // Update db with motor and pose states, initialize with v7 values
  var dbRef = firebase.database().ref('robots/' + (currentRobot) + '/state/');
  var init_v7 = {
    'motors': {
      0: {
        'max': 2381,
        'min': 1707,
        'name': 'Left/Right Tilt',
        'value': 2037,
      },
      1: {
        'max': 2787,
        'min': 1536,
        'name': 'Up/Down Tilt',
        'value': 2573,
      },
      2: {
        'max': 2227,
        'min': 1380,
        'name': 'Neck',
        'value': 1634,
      },
      3: {
        'max': 3072,
        'min': 1024,
        'name': 'Rotate',
        'value': 1937,
      },
    },
    'poses': {
      0: {
        'delete': 0,
        'lastPressed': -1,
        'motors': {
          0: 2037,
          1: 2573,
          2: 1634,
          3: 1937,
        },
        'name': 'Reset',
      },
    },
  }
  dbRef.update(init_v7);
  console.log("Updated robot " + currentRobot + "'s motor state in the db.");
  document.getElementById('enableMotorsBtn').setAttribute('disabled', true);
}

