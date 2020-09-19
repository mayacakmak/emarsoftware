var config = new Config();
var db = new Database(config.config, databaseReadyCallback);
var currentRobot = 0;
var robotNames = [];

function databaseReadyCallback() {
  var dbRef = firebase.database().ref('/');
  dbRef.on("value", updateUserRobotInfo);
}

function signInWithGoogle() {
  Database.signInWithGoogle();
}

function updateUserRobotInfo(snapshot) {
  var database = snapshot.val();
  var robotListHTML = "";
  if (Database.uid != null) {
    var userData = database.users[Database.uid];
    if (userData != undefined)
      if (userData.currentRobot != undefined)
        currentRobot = userData.currentRobot;
    var robots = database.robots;

    robotNames = [];
    for (var i=0; i<robots.length; i++) {
      robotNames.push(robots[i].name);
      robotListHTML += "<a class='dropdown-item' href='#' onclick='setRobot(" + i + ")'>" + robots[i].name + "</a>";
    }
    
    var robotsDiv = document.getElementById("robots");
    robotsDiv.innerHTML = robotListHTML;
    
    var selectedRobotDiv = document.getElementById("selectedRobot");
    if (currentRobot == -1)
      selectedRobotDiv.innerHTML = "Select robot";
    else
      selectedRobotDiv.innerHTML = robotNames[currentRobot];
  }
  
    if (Database.isAnonymous){
      disableButton("adminButton");
      //TODO: Ultimtely most things should not be available anonymously.
    } else {
      enableButton("adminButton");
      //TODO: Re-enable anything disabled above
    }  
}

function setRobot(robotId) {
  console.log("Setting robot: " + robotId);
  var dir = '/users/'+ (Database.uid) + "/";
  var dbRef = firebase.database().ref(dir);
  dbRef.update({currentRobot:robotId});
}

function disableButton(buttonID) {
  var button = document.getElementById(buttonID);
  button.disabled = true;
}

function enableButton(buttonID) {
  var button = document.getElementById(buttonID);
  button.disabled = false;
}

function startEditor() {
  window.location.href = "edit.html";
}

function startAdmin() {
  window.location.href = "admin.html";
}

function startSetup() {
  window.location.href = "setup.html?robot=" + currentRobot;
}

function startController() {
  window.location.href = "control.html?robot=" + currentRobot;
}

