var config = new Config();
var db = new Database(config.config, initializeControl);
var robot = null;
var currentRobot = 0;
var face;
var belly;
var robotAPI = null;
var customAPI = null;

function initializeControl() {
  var robotParam = Config.getURLParameter("robot");
  if (robotParam != null)
    currentRobot = Number(robotParam);
  console.log("currentRobot: " + currentRobot);

  robot = new Robot(currentRobot);
  Robot.initialize();
  face = new Face();
  belly = new Belly(currentRobot, "small");
  
  /* Register all database callbacks */

  var dbAllSoundsRef = firebase.database().ref('/robotapi/');
  dbAllSoundsRef.on("value", updateRobotAPI);

  var dbRobotRef = firebase.database().ref('/robots/' + currentRobot + "/customAPI/");
  dbRobotRef.on("value", updateCustomRobotAPI);

  var dbRobotRef = firebase.database().ref('/robots/' + currentRobot + "/customAPI/states/faces/");
  dbRobotRef.on("value", updateRobotFaceList);

  var dbRobotStateRef = firebase.database().ref('/robots/' + currentRobot + "/state/");
  dbRobotStateRef.on("value", updateRobotState); 
}

function updateRobotAPI(snapshot) {
  robotAPI = snapshot.val();
}

function updateRobotState(snapshot) {
  
  if (customAPI != null && robotAPI != null) {
    
    var robotState = snapshot.val();

    // FACE
    Face.updateRobotFace(snapshot);

    var faceIndex = robotState.currentFace;
    var faceList = customAPI.states.faces;

    // EYES
    var div = document.getElementById("faceControls");
    div.innerHTML = "";
    createStateChangeInterface("faceControls", "Eyes",
                               robotAPI.states.lookat, robotAPI.states.lookat, "lookatChanged",
                               robotState.currentEyes);

    // BELLY
    Belly.updateRobotBelly(snapshot);
    var screens = customAPI.inputs.bellyScreens;
    var screenNames = [];
    var screenIndexes = [];
    for (var i=0; i<screens.length; i++) {
      screenNames.push(screens[i].name);
      screenIndexes.push(i);
    }
    createStateChangeInterface("screenControls", "Screens", 
                               screenNames, screenIndexes, "bellyScreenChanged",
                               screenNames[robotState.currentBellyScreen]);  
  }
}

function updateCustomRobotAPI(snapshot) {
  customAPI = snapshot.val();
  Belly.bellyScreens = customAPI.inputs.bellyScreens;
  Face.faces = customAPI.states.faces;

  var presetSpeakList = customAPI.actions.presetSpeak;
  
  if (presetSpeakList != null) {
    var presetDiv = document.getElementById("presetSpeak");
    var presetHTML = "";
    for (var i=0; i<presetSpeakList.length; i++) {
      presetHTML += "<button class='btn btn-info' onclick='sayPreset(this)'>";
      presetHTML += presetSpeakList[i] + "</button>";
    }
    presetDiv.innerHTML = presetHTML;
  }
}

function createStateChangeInterface(divName, stateName, options, values, changeFunctionName, currentOption) {
  var div = document.getElementById(divName);

  var optionHTML = "<div class='btn-group btn-group-toggle' data-toggle='buttons'>";
  for (var i=0; i<options.length; i++) {
    optionHTML += "<label class='btn btn-secondary ";
    if (options[i] == currentOption)
      optionHTML += "active";
    optionHTML += "'> <input type='radio' name='" + stateName + "' autocomplete='off' id='" + values[i] + "'";
    if (options[i] == currentOption)
      optionHTML += "checked";
    optionHTML += "' onchange='" + changeFunctionName +"(this)'>" + options[i] + "</label>";
  }
  optionHTML += "</div>";
  div.innerHTML = optionHTML;
}

function neckValueChanged(target) {
  const panElement = document.getElementById("pan");
  const pan = panElement.value;
  const tiltElement = document.getElementById("tilt");
  const tilt = tiltElement.value;
  robot.moveNeck(pan, tilt);
}

function lookatChanged(target) {
  robot.setEyes("currentEyes", target.id);
}

function bellyScreenChanged(target) {
  robot.setScreen(target.id);
}

/*Callback for dynamically created button*/
function sayPreset(target) {
  console.log("will say:" + target.innerHTML);
  robot.speak(target.innerHTML);
}

function speakPressed() {
  var speakText = document.getElementById('speakText');
  var text = speakText.value;
  var newButtonsDiv = document.getElementById('userAdded');
  newButtonsDiv.innerHTML += "<button class='btn btn-warning' onclick='sayPreset(this)'>" + text.replace("'", "") + "</button>";
  // requestRobotAction("speak", {text:text});
  robot.speak(text);
}

function bubblePressed() {
  var bubbleText = document.getElementById('bubbleInputText');
  var text = bubbleText.value;
  robot.setSpeechBubble(text);
}

function bubbleClear() {
  robot.setSpeechBubble("");
}
