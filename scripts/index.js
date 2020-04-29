var config = new Config();
var db = new Database(config.config, databaseReadyCallback);
var currentRobot = -1;
var robotNames = [];

function databaseReadyCallback() {
  var dbRef = firebase.database().ref('/');
  // dbRef.on("value", updateUserRobotInfo);

  var uid = firebase.auth().currentUser.uid;
  var uidDiv = document.getElementById('uid');
  uidDiv.innerHTML = Database.displayName;
  var profilePic = document.getElementById('profilePic');
  profilePic.src = Database.profilePic;
  firebase
    .database()
    .ref('/users/' + uid + '/analytics/' + Database.session)
    .on('value', function (snapshot) {
      var username =
        (snapshot.val() && snapshot.val().SessionStarted.date) || 'other';
      console.log(username);
    });
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
  
    // if (Database.isAnonymous){
    //   disableButton("adminButton");
    //   //TODO: Ultimtely most things should not be available anonymously.
    // } else {
    //   enableButton("adminButton");
    //   //TODO: Re-enable anything disabled above
    // }  
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

function startWebRobot() {
  window.location.href = 'web-robot.html';
}

function startGallery() {
    window.location.href = 'gallery.html';
}

function logout() {
  Database.signOut();
  window.location.href = 'signin.html';
}