var config = new Config();
var db = new Database(config.config, initializeControl);
var robot = null;
var currentRobot = 0;
var face;
var belly;
var robotAPI = null;
var customAPI = null;
var motorState = null;

function initializeControl() {
  var robotParam = Config.getURLParameter('robot');
  if (robotParam != null) currentRobot = Number(robotParam);
  console.log('currentRobot: ' + currentRobot);

  robot = new Robot(currentRobot);
  Robot.initialize();
  face = new Face();
  belly = new Belly(currentRobot, 'small');

  /* Register all database callbacks */

  var dbAllSoundsRef = firebase.database().ref('/robotapi/');
  dbAllSoundsRef.on('value', updateRobotAPI);
  
  var dbRobotRef = firebase
    .database()
    .ref('/robots/' + currentRobot);
  dbRobotRef.on('value', updateHandler);
  
  // var dbRobotRef = firebase
  //   .database()
  //   .ref('/robots/' + currentRobot + '/customAPI/');
  // dbRobotRef.on('value', updateCustomRobotAPI);

  // var dbRobotRef = firebase
  //   .database()
  //   .ref('/robots/' + currentRobot + '/customAPI/states/faces/');
  // dbRobotRef.on('value', updateRobotFaceList);

  // var dbRobotStateRef = firebase
  //   .database()
  //   .ref('/robots/' + currentRobot + '/state/');
  // dbRobotStateRef.on('value', updateRobotState);

  window.onbeforeunload = confirmExit;
  function confirmExit() {
    // dbRobotStateRef.off();
    dbRobotRef.off();
  }
}

function updateHandler(snapshot) {
  let robotData = snapshot.val();
  if (robotData?.customAPI) {
    updateCustomRobotAPI(robotData.customAPI);
  }
  if (robotData?.customAPI?.states?.faces) {
    updateRobotFaceList(robotData.customAPI.states.faces);
  }
  if (robotData?.state) {
    updateRobotState(robotData.state);
  }
}

function updateRobotAPI(snapshot) {
  robotAPI = snapshot.val();
}

function updateRobotState(snapshot) {
  if (customAPI != null && robotAPI != null) {
    // var robotState = snapshot.val();
    var robotState = snapshot;

    // FACE
    Face.updateRobotFace(snapshot);

    var faceIndex = robotState.currentFace;
    var faceList = customAPI.states.faces;

    // EYES
    var div = document.getElementById('faceControls');
    div.innerHTML = '';
    createStateChangeInterface(
      'faceControls',
      'Eyes',
      robotAPI.states.lookat,
      robotAPI.states.lookat,
      'lookatChanged',
      robotState.currentEyes
    );

    // MOTOR CONTROLS
    var div = document.getElementById('motorControls');
    div.innerHTML = '';
    if (robotState.motors) {
      motorState = robotState.motors;
      robotState.motors.forEach((elem, index) => {
        motorValue = 'value=' + (elem && elem.value ? elem.value : 0);
        motorName = elem && elem.name ? elem.name : 'Motor ' + index;
        motorMin = elem && elem.min != undefined ? elem.min : 1500;
        motorMax = elem && elem.max != undefined ? elem.max : 2500;
        div.innerHTML +=
          `
          <div class="d-flex flex-row">
            <h3 class="pr-2">` +
          motorName +
          `: <h3><input type="range" min="` +
          motorMin +
          `" max="` +
          motorMax +
          `" "` +
          motorValue +
          `"
          onchange="motorInputChanged(` +
          index +
          `,'` +
          motorName +
          `',this)" ` +
          motorValue +
          ` >
          </div>
        `;
      });
    }

    // MOTOR Pose CONTROLS
    var div = document.getElementById('motorPoseControls');
    div.innerHTML = '';
    if (robotState.motors) {
      motorState = robotState.motors;
      robotState.motors.forEach((elem, index) => {
        motorValue = 'value=' + (elem && elem.value ? elem.value : 0);
        motorName = elem && elem.name ? elem.name : 'Motor ' + index;
        motorMin = elem && elem.min != undefined ? elem.min : 1500;
        motorMax = elem && elem.max != undefined ? elem.max : 2500;
        div.innerHTML +=
          `
          <div class="d-flex flex-row">
            <h3 class="pr-2">` +
          motorName +
          `: <h3><input id="poseControl` + index + `" type="range" min="` +
          motorMin +
          `" max="` +
          motorMax +
          `" ` +
          motorValue +
          `>
          </div>
        `;
      });
    }

    var div = document.getElementById('headTouched');
    // HEAD TOUCHED
    if (robotState.headTouched && robotState.headTouched != 0) {
      div.innerHTML = `<button type="button" class="btn btn-success">Head Touched!!</button>`;
    } else {
      div.innerHTML = ``;
    }

    // POSE CONTROLS
    var div = document.getElementById('poseControls');
    if (robotState.poses) {
      poseState = robotState.poses;
      div.innerHTML = '';
      poseState.forEach((elem, index) => {
        poseName = elem && elem.name ? elem.name : 'Pose ' + index;
        div.innerHTML +=
          `<button type="button" class="btn btn-info" onclick="poseChanged(` +
          index +
          `,'` +
          poseName +
          `')">` +
          poseName +
          `</button>`;
      });
    }
    div.innerHTML = `<div class="preset-controls">` + div.innerHTML + '</div>';

    // BELLY
    Belly.updateRobotBelly(snapshot);
    var screens = customAPI.inputs.bellyScreens;
    var screenNames = [];
    var screenIndexes = [];
    for (var i = 0; i < screens.length; i++) {
      screenNames.push(screens[i].name);
      screenIndexes.push(i);
    }
    createStateChangeInterface(
      'screenControls',
      'Screens',
      screenNames,
      screenIndexes,
      'bellyScreenChanged',
      screenNames[robotState.currentBellyScreen]
    );
  }
}

function updateCustomRobotAPI(snapshot) {
  // customAPI = snapshot.val();
  customAPI = snapshot;
  Belly.bellyScreens = customAPI.inputs.bellyScreens;
  Face.faces = customAPI.states.faces;

  if (customAPI.actions != undefined) {
    var presetSpeakList = customAPI.actions.presetSpeak;

    if (presetSpeakList != null) {
      var presetDiv = document.getElementById('presetSpeak');
      var presetHTML = '';
      for (var i = 0; i < presetSpeakList.length; i++) {
        presetHTML += "<button class='btn btn-info' onclick='sayPreset(this)'>";
        presetHTML += presetSpeakList[i] + '</button>';
      }
      presetDiv.innerHTML = presetHTML;
    }
  }
}

function createStateChangeInterface(
  divName,
  stateName,
  options,
  values,
  changeFunctionName,
  currentOption
) {
  var div = document.getElementById(divName);

  var optionHTML =
    "<div class='btn-group btn-group-toggle flex-wrap' data-toggle='buttons'>";
  for (var i = 0; i < options.length; i++) {
    optionHTML += "<label class='btn btn-secondary ";
    if (options[i] == currentOption) optionHTML += 'active';
    optionHTML +=
      "'> <input type='radio' name='" +
      stateName +
      "' autocomplete='off' id='" +
      values[i] +
      "'";
    if (options[i] == currentOption) optionHTML += 'checked';
    optionHTML +=
      "' onchange='" +
      changeFunctionName +
      "(this)'>" +
      options[i] +
      '</label>';
  }
  optionHTML += '</div>';
  div.innerHTML = optionHTML;
}

function neckValueChanged(target) {
  const panElement = document.getElementById('pan');
  const pan = panElement.value;
  const tiltElement = document.getElementById('tilt');
  const tilt = tiltElement.value;
  robot.moveNeck(pan, tilt);
}

function lookatChanged(target) {
  robot.setEyes(target.id);
}

function bellyScreenChanged(target) {
  robot.setScreen(target.id);
}

function motorInputChanged(index, name, target) {
  robot.setMotor(index, name, parseInt(target.value), motorState);
}

function manualPoseChanged() {
  let updatedMotorState = [...motorState ];
  motorState.forEach((elem, index) => {
    updatedMotorState[index] = { ...updatedMotorState[index], value: parseInt(document.getElementById("poseControl" + index).value)}
  })
  robot.setMotors(updatedMotorState);
}

function poseChanged(index, name) {
  robot.setPose(index, name, poseState, motorState);
}

function saveAsPose() {
  let newPoseState = [ ...poseState ];
  newPoseState.push({
    lastPressed: 0,
    motors: motorState.map((elem, index) =>
      parseInt(document.getElementById('poseControl' + index).value)
    ),
    name: document.getElementById('savePoseText').value,
  });
  robot.saveNewPose(newPoseState)
}

/*Callback for dynamically created button*/
function sayPreset(target) {
  console.log('will say:' + target.innerHTML);
  robot.speak(target.innerHTML);
}

function speakPressed() {
  var speakText = document.getElementById('speakText');
  var text = speakText.value;
  var newButtonsDiv = document.getElementById('userAdded');
  newButtonsDiv.innerHTML +=
    "<button class='btn btn-warning' onclick='sayPreset(this)'>" +
    text.replace("'", '') +
    '</button>';
  // requestRobotAction("speak", {text:text});
  robot.speak(text);
}

function bubblePressed() {
  var bubbleText = document.getElementById('bubbleInputText');
  var text = bubbleText.value;
  robot.setSpeechBubble(text);
}

function bubbleClear() {
  robot.setSpeechBubble('');
}
