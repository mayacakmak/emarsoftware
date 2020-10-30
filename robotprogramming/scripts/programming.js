var config = new Config();
var robot = new Robot(0);
var db = new Database(config.config, initialize);

var robotPrograms;
var myPrograms;
var editor = null;
var robotNames = null;
var currentProgramId = null;
var selectedRobotId = null;
var isMyProgram = true;

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

	editor.setSize("100%", "500");
  editor.setOption("readOnly", false);
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
	
  var programListHTML = "";//"<a class='dropdown-item' href='#'>Programs</a>";
  if (myPrograms != undefined) {
    for (var i=0; i<myPrograms.length; i++) {
      programListHTML += "<a class='dropdown-item' href='#' onclick='loadProgram(" + i + ")'>" + myPrograms[i].name + "</a>"
    }
    programListHTML += "<div class='dropdown-divider'></div>";
  }
  programListHTML += "<a class='dropdown-item' href='#' onclick='resetProgram()'>Create new</a>";
  programsDiv.innerHTML = programListHTML;
  programsButtonDiv.innerHTML = "My programs";
}

function updateRobotList(snapshot) { 
  let robotListHTML = "";
  let programRobotListHTML = "";
  let robots = snapshot.val();
  robotNames = [];
  robotPrograms = [];
  for (var i=0; i<robots.length; i++) {
    robotNames.push(robots[i].name);
    robotPrograms.push(robots[i].programs);
		robotListHTML += "<a class='dropdown-item' href='#' onclick='selectedRobotChanged(" +
        i + ")'>" + robots[i].name + "</a>";
    programRobotListHTML += "<a class='dropdown-item' href='#' onclick='programRobotChanged(" +
        i + ")'>" + robots[i].name + "</a>";
	}
  let robotsDiv = document.getElementById("robots");
  robotsDiv.innerHTML = robotListHTML;
  let programRobotsDiv = document.getElementById("programRobots");
  programRobotsDiv.innerHTML = programRobotListHTML;
  
  if (currentProgramId != null && myPrograms != undefined) {
    if (isMyProgram) {
      setProgramRobot(myPrograms[currentProgramId].robot);
    } else {
      setProgramRobot(robotPrograms[selectedRobotId][currentProgramId].robot);
    }
  }
  else {
    console.log(currentProgramId, myPrograms);
    setProgramRobot(0);
  }

  if (selectedRobotId != null) {
    setSelectedRobot(selectedRobotId);
  }
  else
    setSelectedRobot(0);
}

function programRobotChanged(robotId) {
  console.log('Program Robot Changed???', robotId);
  setProgramRobot(robotId);
  if (currentProgramId != null) {
    saveProgram();
  }
}

function selectedRobotChanged(robotId) {
  setSelectedRobot(robotId);
}

function setProgramRobot(robotId) {
  console.log('setting with parameters', selectedRobotId, robotId);
  console.log("Current program's robot is: " + robotId);
  Robot.setRobotId(robotId);
  var programRobotDiv = document.getElementById("currentProgramRobot");
  programRobotDiv.innerHTML = robotNames[robotId];
}

function setSelectedRobot(robotId) {
  console.log('settting to', robotId);
  selectedRobotId = robotId;
  var selectedRobotDiv = document.getElementById("selectedRobot");
  selectedRobotDiv.innerHTML = robotNames[robotId];

  let thisRobotPrograms = robotPrograms[robotId];
  let programsDiv = document.getElementById("robotPrograms");
  let programsButtonDiv = document.getElementById("robotProgramsButtonText");

  let programListHTML = "";
  if (thisRobotPrograms != undefined) {
    for (var i=0; i<thisRobotPrograms.length; i++) {
      programListHTML += "<a class='dropdown-item' href='#' onclick='loadRobotProgram(" 
      + robotId + "," + i + ")'>" + thisRobotPrograms[i].name + "</a>"
    }
  }
  programsDiv.innerHTML = programListHTML;
  programsButtonDiv.innerHTML = "Programs on " + robotNames[robotId];
}

function resetProgram() {
  // TODO: Ask are you sure if there are unsaved changes
  editor.setValue("");
	var codeNameDiv = document.getElementById("programName");
	codeNameDiv.value = "";
  var codeDescDiv = document.getElementById("programDesc");
  codeDescDiv.value = "";  
  currentProgramId = null;
}

function loadProgram(index) {
	console.log("Loading program: " + myPrograms[index].name);
  currentProgramId = index;
  editor.setValue(myPrograms[currentProgramId].program);
	var codeNameDiv = document.getElementById("programName");
	codeNameDiv.value = myPrograms[currentProgramId].name;  
  var codeDescDiv = document.getElementById("programDesc");
  if (myPrograms[currentProgramId].description == undefined)
    codeDescDiv.value = '';
  else
    codeDescDiv.value = myPrograms[currentProgramId].description;
  console.log('Load progrram', myPrograms, currentProgramId);
  setProgramRobot(myPrograms[currentProgramId].robot);
  
  isMyProgram = true;
  let saveButton = document.getElementById("saveButton");
  saveButton.disabled = false;
  let deleteButton = document.getElementById("deleteButton");
  deleteButton.disabled = false;
  let copyRobotButton = document.getElementById("copyRobotButton");
  copyRobotButton.disabled = false;
  let programName = document.getElementById("programName");
  programName.disabled = false;
  let programDesc = document.getElementById("programDesc");
  programDesc.disabled = false;
  let programRobotsButton = document.getElementById("programRobotsButton");
  programRobotsButton.disabled = false;
  editor.setOption("readOnly", false);

  let copyMyButton = document.getElementById("copyMyButton");
  copyMyButton.disabled = true;
}

function loadRobotProgram(robotId, programId) {
  console.log("Loading program: " + robotPrograms[robotId][programId].name);
  currentProgramId = programId;
  editor.setValue(robotPrograms[robotId][programId].program);
  var codeNameDiv = document.getElementById("programName");
  codeNameDiv.value = robotPrograms[robotId][programId].name;
  
  var codeDescDiv = document.getElementById("programDesc");
  if (robotPrograms[robotId][programId].description == undefined)
    codeDescDiv.value = '';
  else
    codeDescDiv.value = robotPrograms[robotId][programId].description;
  setProgramRobot(robotPrograms[robotId][programId].robot);

  isMyProgram = false;
  let saveButton = document.getElementById("saveButton");
  saveButton.disabled = true;
  let deleteButton = document.getElementById("deleteButton");
  // deleteButton.disabled = true;
  deleteButton.disabled = false;
  let copyRobotButton = document.getElementById("copyRobotButton");
  copyRobotButton.disabled = true;
  let programName = document.getElementById("programName");
  programName.disabled = true;
  let programDesc = document.getElementById("programDesc");
  programDesc.disabled = true;
  let programRobotsButton = document.getElementById("programRobotsButton");
  programRobotsButton.disabled = true;
  editor.setOption("readOnly", "nocursor");

  let copyMyButton = document.getElementById("copyMyButton");
  copyMyButton.disabled = false;
}

function copyToRobotPrograms() {
  if (isMyProgram) {
    if (saveProgram()) {
      let robotId = myPrograms[currentProgramId].robot;
      let thisRobotPrograms = robotPrograms[robotId];
      // Add the current program to the corresponding robot's list
      if (thisRobotPrograms === undefined) {
        thisRobotPrograms = [];
      }
      thisRobotPrograms.push(myPrograms[currentProgramId]);
      robotPrograms[robotId] = thisRobotPrograms;
      setSelectedRobot(robotId);
      let dir = "/robots/" + robotId + "/";
      let dbRef = firebase.database().ref(dir);
      let updates = {"programs":thisRobotPrograms};
      dbRef.update(updates);
    }
  }
}

function copyToMyPrograms() {
  if (!isMyProgram) {
    let codeNameDiv = document.getElementById("programName");
    let codeDescDiv = document.getElementById("programDesc");
    var dir = "users/" + Database.uid + "/programs/";
    var dbRef = firebase.database().ref(dir);
    if (myPrograms == undefined)
      myPrograms = [];
    
    myPrograms.push({"name": codeNameDiv.value,
                     "program": editor.getValue(),
                     "description": codeDescDiv.value,
                     "robot": Robot.robotId});
    
    dbRef.set(myPrograms);
    console.log("Robot program saved to my programs.");
    
    var alertDiv = document.getElementById("saved-alert");
    alertDiv.style.visibility = "visible";
    window.setTimeout(hideAlert, 2000);    
  }
}

function saveProgram() {
  if (isMyProgram) {
    let codeNameDiv = document.getElementById("programName");
    let codeDescDiv = document.getElementById("programDesc");

    if (codeNameDiv.value == "") {
       console.log("Cannot save: The program needs a name.");
       return false;
    } 
    else if(editor.getValue() == "") {
       console.log("Cannot save: The program is empty.");
       return false;
    }
    else {
      var dir = "users/" + Database.uid + "/programs/";
      var dbRef = firebase.database().ref(dir);
      
      if (myPrograms == undefined)
        myPrograms = [];
      
      if (currentProgramId == null) {
        currentProgramId = myPrograms.length;
        myPrograms.push({"name": codeNameDiv.value,
                       "program": editor.getValue(),
                       "description": codeDescDiv.value,
                       "robot": Robot.robotId});
      } else {
        myPrograms[currentProgramId].name = codeNameDiv.value;
        myPrograms[currentProgramId].program = editor.getValue();
        myPrograms[currentProgramId].description = codeDescDiv.value;
        myPrograms[currentProgramId].robot = Robot.robotId;
      }
      
      dbRef.set(myPrograms);
      console.log("Program saved.");
      
      var alertDiv = document.getElementById("saved-alert");
      alertDiv.style.visibility = "visible";
      window.setTimeout(hideAlert, 2000);
      return true;
    }
  }
}

function hideAlert() {
  var alertDiv = document.getElementById("saved-alert");
  alertDiv.style.visibility = "hidden";
}

function deleteProgram() {
  if (isMyProgram && myPrograms!=null) {
    var confirmation = confirm("Are you sure you want to delete this program?");
    if (confirmation) {
      var dir = 'users/' + Database.uid + '/programs/';
      var dbRef = firebase.database().ref(dir);
      myPrograms.splice(currentProgramId, 1);
      dbRef.set(myPrograms);
      resetProgram();
    }
  } else {
    var confirmation = confirm("Are you sure you want to delete " + robotPrograms[selectedRobotId][currentProgramId].name  + " from " + robotNames[selectedRobotId] + "?");
    if (confirmation) {
      var temp = [...robotPrograms[selectedRobotId]];
      temp.splice(currentProgramId, 1);
      robotPrograms[selectedRobotId] = [...temp];
      var dir = 'robots/' + selectedRobotId + '/programs/';
      var dbRef = firebase.database().ref(dir);
      dbRef.set(temp);
      resetProgram();
      setSelectedRobot(selectedRobotId);
    }
  }
}

