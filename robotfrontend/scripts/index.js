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

function signOutFromGoogle() {
  Database.signOut();
}

function updateUserRobotInfo(snapshot) {
  let database = snapshot.val();
  let robotListHTML = "";
  if (Database.uid != null) {
    let userData = database.users[Database.uid];
    if (userData != undefined)
      if (userData.currentRobot != undefined)
        currentRobot = userData.currentRobot;
    let robots = database.robots;
    let admins = database.administrators;

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

    console.log(admins);
    console.log("Database.userEmail: "+ Database.userEmail);

    if (Database.isAnonymous || Database.userEmail == null){
      disableButton("adminButton");
      //TODO: Ultimtely most things should not be available anonymously.
    } else {
      // Check if the user is in the admin list

      console.log(admins.includes(Database.userEmail));

      if (admins.includes(Database.userEmail)){
        enableButton("adminButton");
        console.log('button enabled');        
      }
      else
        disableButton("adminButton");
    }  
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

