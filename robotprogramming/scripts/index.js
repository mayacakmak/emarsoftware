var config = {
    apiKey: "AIzaSyAisnI9BEW_Uc0-z1ad25nB6eNXEEQ_xQQ",
    authDomain: "emar-database.firebaseapp.com",
    databaseURL: "https://emar-database.firebaseio.com",
    projectId: "emar-database",
    storageBucket: "emar-database.appspot.com",
    messagingSenderId: "672114317207"
};

var robot = new Robot(0);
var db = new Database(config, initialize);

var robotPrograms;
var myPrograms;
var editor = null;
var robotNames = null;
var currentProgramId = -1;

function initialize() {
	let codeDiv = document.getElementById("code");
	codeDiv.value = "";	

  let apiDiv = document.getElementById("robotAPIDescription");
  Robot.initialize(apiDiv);

  // Warning: uncomment and run the following only if you are sure you
  // want to copy all user programs onto (globally shared) robot programs
  // let dbRefUsers = firebase.database().ref('/users/');
  // dbRefUsers.on("value", collectAllProgramsFromUsers);

  let dbRef = firebase.database().ref('/users/' + Database.uid + '/programs/');
  dbRef.on("value", updateMyProgramList);
  
  let dbRefRobot = firebase.database().ref('/robots/');
  dbRefRobot.on("value", updateRobotList);

  editor = CodeMirror.fromTextArea(codeDiv, {
      theme: "base16-light",
      lineNumbers: true,
      styleActiveLine: true,
      autoCloseBrackets: true,
      extraKeys: {
        "Ctrl-S": saveProgram,
        "Cmd-S": saveProgram,
        "Ctrl-Space": "autocomplete",
      },
    });

	editor.setSize("600", "400");
}

async function runProgram() {
  var codeDiv = document.getElementById("code");
  var codeText = editor.getValue();
  codeText = codeText.replace(/robot.sleep/g, "await robot.sleep");
  eval("(async () => {" + codeText + "})();");
}

/**
* This function scans all users for programs and saves them onto corresponding robots.
**/
function collectAllProgramsFromUsers(snapshot) {
  let users = snapshot.val();
  let allRobotPrograms = {};
  let nUsers = Object.keys(users).length;
  for (let i=0; i<nUsers; i++) {
    let uid = Object.keys(users)[i];
    console.log("User " + uid);
    let programs = users[uid].programs;
    if (programs != undefined) {
      console.log("... has " + programs.length + " programs!");
      for (var j=0; j<programs.length; j++) {
        let robotId = programs[j].robot;
        let robotPrograms = allRobotPrograms[robotId];
        if (robotPrograms == undefined)
          robotPrograms = [];
        robotPrograms.push(programs[j]);
        allRobotPrograms[robotId] = robotPrograms;
      }
    }
  }

  let nRobotsWithPrograms = Object.keys(allRobotPrograms).length;
  for (let i=0; i<nRobotsWithPrograms; i++){
    let robotId = Object.keys(allRobotPrograms)[i];
    let thisRobotPrograms = allRobotPrograms[robotId];
    let dir = "/robots/" + robotId + "/";
    let dbRef = firebase.database().ref(dir);
    let updates = {"programs":thisRobotPrograms};
    dbRef.update(updates);
  }
}

function updateMyProgramList(snapshot) {
	myPrograms = snapshot.val();
  let programsDiv = document.getElementById("myPrograms");
  let programsButtonDiv = document.getElementById("programsButtonText");

  if (myPrograms != undefined) {
    var programListHTML = "";//"<a class='dropdown-item' href='#'>Programs</a>";
    for (var i=0; i<myPrograms.length; i++) {
      programListHTML += "<a class='dropdown-item' href='#' onclick='loadProgram(" + i + ")'>" + myPrograms[i].name + "</a>"
    }
    programListHTML += "<div class='dropdown-divider'></div>";
    programListHTML += "<a class='dropdown-item' href='#' onclick='resetProgram()'>Create new</a>";
    programsDiv.innerHTML = programListHTML;
  }
  programsButtonDiv.innerHTML = "My programs";
}

function updateRobotList(snapshot) { 
  let robotListHTML = "";
  let robots = snapshot.val();
  robotNames = [];
  robotPrograms = [];
  for (var i=0; i<robots.length; i++) {
    robotNames.push(robots[i].name);
    robotPrograms.push(robots[i].programs);
		robotListHTML += "<a class='dropdown-item' href='#' onclick='robotChanged(" + i + ")'>" + robots[i].name + "</a>";
	}
  var robotsDiv = document.getElementById("robots");
  robotsDiv.innerHTML = robotListHTML;
  
  if (currentProgramId != -1 && programs != undefined)
    setRobot(myPrograms[currentProgramId].robot);
  else
    setRobot(0);
}

function robotChanged(robotId) {
  setRobot(robotId);
  if (currentProgramId != -1) {
    saveProgram();
  }
}

function setRobot(robotId) {
  console.log("setting robot: " + robotId);
  Robot.setRobotId(robotId);
  var selectedRobotDiv = document.getElementById("selectedRobot");
  selectedRobotDiv.innerHTML = robotNames[robotId];

  let thisRobotPrograms = robotPrograms[robotId];
  let programsDiv = document.getElementById("robotPrograms");
  let programsButtonDiv = document.getElementById("robotProgramsButtonText");

  if (thisRobotPrograms != undefined) {
    var programListHTML = "";
    for (var i=0; i<thisRobotPrograms.length; i++) {
      programListHTML += "<a class='dropdown-item' href='#' onclick='loadRobotProgram(" + robotId + "," + i + ")'>" + thisRobotPrograms[i].name + "</a>"
    }
    programsDiv.innerHTML = programListHTML;
  }
  programsButtonDiv.innerHTML = "Programs on " + robotNames[robotId];
}

function resetProgram() {
  // TODO: Ask are you sure if there are unsaved changes
  editor.setValue("");
	var codeNameDiv = document.getElementById("programName");
	codeNameDiv.value = "";
  currentProgramId = -1;
}

function loadProgram(index) {
	console.log("Loading program: " + myPrograms[index].name);
  currentProgramId = index;
  
  editor.setValue(myPrograms[currentProgramId].program);
	var codeNameDiv = document.getElementById("programName");
	codeNameDiv.value = myPrograms[currentProgramId].name;
  
  setRobot(myPrograms[currentProgramId].robot);
  // currentProgram = myPrograms[currentProgramId].program;
}

function saveProgram() {
  var codeNameDiv = document.getElementById("programName");

	var dir = "users/" + Database.uid + "/programs/";
  var dbRef = firebase.database().ref(dir);
  
  if (programs == undefined)
    programs = [];
  
  if (currentProgramId == -1) {
    currentProgramId = programs.length;
  	programs.push({"name": codeNameDiv.value,
                   "program": editor.getValue(),
                   "robot": Robot.robotId});
  } else {
    myPrograms[currentProgramId].name = codeNameDiv.value;
    myPrograms[currentProgramId].program = editor.getValue();
    myPrograms[currentProgramId].robot = Robot.robotId;
  }
  
	dbRef.set(programs);
  console.log("Program saved.");
  
  var alertDiv = document.getElementById("saved-alert");
  alertDiv.style.visibility = "visible";
  window.setTimeout(hideAlert, 2000);
}

function hideAlert() {
  var alertDiv = document.getElementById("saved-alert");
  alertDiv.style.visibility = "hidden";
}

function deleteProgram() {
	var dir = "users/" + Database.uid + "/programs/";
  var dbRef = firebase.database().ref(dir);
  myPrograms.splice(currentProgramId,1);
	dbRef.set(myPrograms);
  resetProgram();
}
