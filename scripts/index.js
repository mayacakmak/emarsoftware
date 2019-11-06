var config = {
    apiKey: "AIzaSyAisnI9BEW_Uc0-z1ad25nB6eNXEEQ_xQQ",
    authDomain: "emar-database.firebaseapp.com",
    databaseURL: "https://emar-database.firebaseio.com",
    projectId: "emar-database",
    storageBucket: "emar-database.appspot.com",
    messagingSenderId: "672114317207"
};

var robot = new Robot(0);
var db = new Database(config, databaseReadyCallback);
var robotNames = [];

function databaseReadyCallback() {
  var apiDiv = document.getElementById("apiDiv");
  Robot.initialize(apiDiv);
  
  var dbRef = firebase.database().ref('/');
  dbRef.on("value", loadRobotInfo);
}

function loadRobotInfo(snapshot) {
  var database = snapshot.val();
  var robotListHTML = "";
  var robots = database.robots;
  robotNames = [];
  for (var i=0; i<robots.length; i++) {
    robotNames.push(robots[i].name);
    robotListHTML += "<a class='dropdown-item' href='#' onclick='setRobot(" + i + ")'>" + robots[i].name + "</a>";
  }
  var robotsDiv = document.getElementById("robots");
  robotsDiv.innerHTML = robotListHTML;
  setRobot(0);
}

function setRobot(robotId) {
  console.log("setting robot: " + robotId);
  Robot.setRobotId(robotId);
  var selectedRobotDiv = document.getElementById("selectedRobot");
  selectedRobotDiv.innerHTML = robotNames[robotId];
}

function testRobotActions() {
  (async () => {
    console.log("sensor0 value:" + robot.getTactileSensor("sensor0"));
    console.log("sensor1 value:" + robot.getTactileSensor("sensor1"));
    robot.moveNeck(10, 20);
    robot.setScreen(0);
    var buttonName = await robot.waitForButton();
    if (buttonName == 'Okay')
      robot.setScreen(1);
    else
      robot.setScreen(2);
    robot.setFace(0);
    robot.playSound(1);
    await robot.sleep(2000);
    robot.speak("Hello world");
    robot.setSpeechBubble("Hello world");
    console.log("Slider value:" + robot.getSliderValue());
  })();
}
