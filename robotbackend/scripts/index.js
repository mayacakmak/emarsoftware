var config = new Config();
var db = new Database(config.config, databaseReadyCallback);
var currentRobot = -1;
var robotNames = [];

function databaseReadyCallback() {
  var dbRef = firebase.database().ref('/');
  dbRef.on("value", updateUserRobotInfo);
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
  else
    console.log("Database.uid is null");
}

function setRobot(robotId) {
  console.log("Setting robot: " + robotId);
  var dir = '/users/'+ (Database.uid) + "/";
  var dbRef = firebase.database().ref(dir);
  dbRef.update({currentRobot:robotId});
}

function startPageWithRobot(pageName) {
  window.location.href = pageName + ".html?robot=" + currentRobot;
}

function startRenderer() {
  window.location.href = "render-face.html?robot=" + currentRobot;
}

function startBellyRenderer() {
  window.location.href = "render-belly.html?robot=" + currentRobot;
}

function startWebRobot() {
  window.location.href = "web-robot.html?robot=" + currentRobot;
}

function startPhoneRobot() {
  window.location.href = "phone-robot.html?robot=" + currentRobot;
}

