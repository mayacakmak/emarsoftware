var config = new Config();
var db = new Database(config.config, databaseReadyCallback);
var currentRobot = -1;
var robotNames = [];
var startDiaryTime;
var endDiaryTime;

function databaseReadyCallback() {
  var dbRef = firebase.database().ref("/");
  // dbRef.on("value", updateUserRobotInfo);

  var displayName = firebase.auth().currentUser.displayName;
  var uidDiv = document.getElementById("loginID");
  if (uidDiv) {
    uidDiv.innerHTML = displayName;
  }
  firebase
    .database()
    .ref("/users/" + displayName + "/analytics/" + Database.session)
    .on("value", function(snapshot) {
      var username =
        (snapshot.val() && snapshot.val().SessionStarted.date) || "other";
      console.log(username);
    });
  newFaceNotification();
}

function updateUserRobotInfo(snapshot) {
  var database = snapshot.val();
  var robotListHTML = "";
  if (Database.displayName != null) {
    var userData = database.users[Database.displayName];
    if (userData != undefined)
      if (userData.currentRobot != undefined)
        currentRobot = userData.currentRobot;
    var robots = database.robots;

    robotNames = [];
    for (var i = 0; i < robots.length; i++) {
      robotNames.push(robots[i].name);
      robotListHTML +=
        "<a class='dropdown-item' href='#' onclick='setRobot(" +
        i +
        ")'>" +
        robots[i].name +
        "</a>";
    }

    var robotsDiv = document.getElementById("robots");
    robotsDiv.innerHTML = robotListHTML;

    var selectedRobotDiv = document.getElementById("selectedRobot");
    if (currentRobot == -1) selectedRobotDiv.innerHTML = "Select robot";
    else selectedRobotDiv.innerHTML = robotNames[currentRobot];
  }
}

async function newFaceNotification() {
  var dbUserRef = firebase.database().ref("/users/");
  let total = 0;
  const snapshot = await dbUserRef.once("value");
  const userData = snapshot.val();
  const group_id = userData[Database.displayName]["group_id"];
  Object.keys(userData).forEach(element => {
    if (
      element !== Database.displayName && 
      userData[element].public &&
      userData[element].public.faces &&
      userData[element]["group_id"] &&
      userData[element]["group_id"] === group_id
    ) {
      total += Object.keys(userData[element].public.faces).length;
    }
  });
  let count = 0;
  if (
    userData[Database.displayName] &&
    userData[Database.displayName].public &&
    userData[Database.displayName].public.viewedFaces
  ) {
    Object.keys(
      userData[Database.displayName].public.viewedFaces
    ).forEach(elem => {
      if (elem !== Database.displayName) {
        count += userData[Database.displayName].public.viewedFaces[elem].length;
      }
    });
  }
  if (count < total) {
    notification = document.getElementById("newFaceNotifContainer");
    notification.setAttribute("style", "display: block;");
  }
}

function setRobot(robotId) {
  var dir = "/users/" + Database.uid + "/";
  var dbRef = firebase.database().ref(dir);
  dbRef.update({ currentRobot: robotId });
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
  sessionStorage.setItem("startEditTime", new Date().getTime());
  window.location.href = "edit.html";
}

function startInstructions() {
  window.location.href = "instructions.html";
}

function startContact() {
  window.location.href = "contact.html";
}

function startGallery() {
  window.location.href = "gallery.html";
}

function startDiary() {
  var dir = "users/" + firebase.auth().currentUser.displayName + "/robot/state";
  var dbRef = firebase.database().ref(dir);
  dbRef.update({ listening: true });
  sessionStorage.setItem(startDiaryTime, new Date().getTime());
  window.location.href = "diary.html";
}

function backToIndexPage() {
  var dir = 'users/' + firebase.auth().currentUser.displayName + '/robot/state';
  var dbRef = firebase.database().ref(dir);
  dbRef.update({ listening: false });
  window.location.href = 'index.html';
}

function doneTyping() {
  var diaryText = document.getElementById("diaryText").value;
  if (diaryText.length != 0) {
    endDiaryTime = new Date().getTime();
    calculateTime(
      sessionStorage.getItem(startDiaryTime),
      endDiaryTime,
      "diary"
    );
    window.location.href = "render-face.html";
  } 
  else {
    alert("Please type your reflection, based on the Robot's prompt");
  }
}

function startVAS() {
  window.location.href = "datain_stress.html";
}

function startWebRobot() {
  sessionStorage.setItem("startFaceRenderTime", new Date().getTime());
  window.location.href = "render-face.html";
}

function logout() {
  Database.signOut();
  window.location.href = "signin.html";
}

function calculateTime(start, end, event) {
  var dur = (end - start) / 1000;
  var currDate = new Date().toDateString();
  console.log(dur);
  var dir =
    "users/" +
    firebase.auth().currentUser.displayName +
    "/" +
    event +
    "/" +
    currDate;
  var dbRef = firebase.database().ref(dir);
  dbRef.push().set({
    date: currDate,
    time_start: start,
    time_end: end,
    duration_sec: dur
  });
  console.log("Logging diary time: ----------");
}
