var config = new Config();
var robot = new Robot(0);
var db = new Database(config.config, initialize);

var modalViewEnabled = [57];

var robotPrograms;
var robotNames = null;

function initialize() {
  let apiDiv = document.getElementById("robotAPIDescription");
  Robot.initialize(apiDiv);

  let dbRefRobot = firebase.database().ref('/robots/');
  dbRefRobot.once("value", updateRobotList);
}

function updateRobotList(snapshot) { 
  let robotListHTML = "";
  let programRobotListHTML = "";
  let robots = snapshot.val();
  robotNames = [];
  robotPrograms = [];

  let robotListDiv = document.getElementById("robotList");
  robotListDiv.innerHTML = "";

  // Add each robot
  for (var i=0; i<robots.length; i++) {
    robotNames.push(robots[i].name);
    robotPrograms.push(robots[i].programs);

    if (robots[i].programs != undefined && robots[i].programs.length > 0) {

      let cardDiv = document.createElement('div');
      cardDiv.setAttribute('class', 'card mb-2');
          
      let cardHeaderDiv = document.createElement('div');
      cardHeaderDiv.setAttribute('id', 'robot'+i);
      cardHeaderDiv.setAttribute('class', 'card-header');

      let expandButton = document.createElement('button');
      expandButton.setAttribute('class', 'btn btn-link btn-lg');
      expandButton.setAttribute('type', 'button');
      expandButton.setAttribute('data-toggle', 'collapse');
      expandButton.setAttribute('data-target', '#collapseRobot'+i);
      expandButton.setAttribute('aria-expanded', 'true');
      expandButton.setAttribute('aria-controls', 'collapseRobot'+i);
      expandButton.setAttribute('onclick', 'prepRobotProgram('+ i + ')');
      expandButton.innerHTML = 'Programs on ' + robots[i].name;

      let collapseDiv = document.createElement('div');
      collapseDiv.setAttribute('class', 'collapse collapsed');
      collapseDiv.setAttribute('id', 'collapseRobot'+i);
      collapseDiv.setAttribute('data-parent', '#robotList');
      collapseDiv.setAttribute('aria-labelledby', 'robot'+i);
            
      let cardBodyDiv = document.createElement('div');
      cardBodyDiv.setAttribute('class', 'card-body');
      let programDiv = document.createElement('div');
      programDiv.setAttribute('class', 'program-grid');

      if (modalViewEnabled.includes(i)) {
        // If generalizing outside of Digital Shield, can consider adding field in Firebase to enable modal view
        let operatorBtn = document.createElement('button');
        operatorBtn.setAttribute('type', 'button');
        operatorBtn.setAttribute('onclick', 'operatorView('+ i + ', "' + robots[i].name + '")');
        operatorBtn.setAttribute('class', 'btn btn-secondary');
        operatorBtn.setAttribute('data-toggle', 'modal');
        operatorBtn.setAttribute('data-target', '#runProgramModal');        
        operatorBtn.innerHTML = "Operator View";

        programDiv.appendChild(operatorBtn);
      }

      // Add each program one by one
      for (let j=0; j<robots[i].programs.length; j++){
        let itemDiv = document.createElement('div');
        itemDiv.setAttribute('class', 'program-item');
        let nameDiv = document.createElement('div');
        nameDiv.setAttribute('class', 'mb-1 font-weight-bold text-dark');
        nameDiv.innerHTML = robots[i].programs[j].name;
        let descriptionDiv = document.createElement('div');
        descriptionDiv.setAttribute('class', 'mb-2 font-weight-light');
        if (robots[i].programs[j].description == undefined ||
              robots[i].programs[j].description == "") {
          descriptionDiv.innerHTML = "<i>No description</i>";
        } 
        else {
          descriptionDiv.innerHTML = robots[i].programs[j].description;
        }

        let buttonDiv = document.createElement('div');
        buttonDiv.setAttribute('class', 'mb-1');

        let runButton = document.createElement('button');
        runButton.setAttribute('class', 'btn btn-primary');
        runButton.setAttribute('onclick', 'runProgram('+ i + ',' + j + ')');
        runButton.innerHTML = "Run";

        buttonDiv.appendChild(runButton);
        itemDiv.appendChild(nameDiv);
        itemDiv.appendChild(descriptionDiv);
        itemDiv.appendChild(buttonDiv);

        programDiv.appendChild(itemDiv);
      }

      cardHeaderDiv.appendChild(expandButton);
      cardBodyDiv.appendChild(programDiv);
      collapseDiv.appendChild(cardBodyDiv);

      cardDiv.appendChild(cardHeaderDiv);
      cardDiv.appendChild(collapseDiv);

      robotListDiv.appendChild(cardDiv);
    }
	}

}

function operatorView(robotId, robotName) {
  // Populate and open modal view for sound/movement programs
  // If generalizing outside of Digital Shield, should consider other breakdowns of names

  let modalBody = document.getElementById("runProgramModalBody");
  let modalTitle = document.getElementById("runProgramModalTitle");

  modalTitle.innerHTML = robotName;

  let movePrograms = [];
  let soundPrograms = [];

  let allPrograms = document.querySelectorAll("#collapseRobot" + robotId + " .card-body .program-grid .program-item");
  for (let i = 0; i < allPrograms.length; i++) {
    let programNameSub = allPrograms[i].firstChild.innerHTML.substring(0, 5).toLowerCase()
    if (programNameSub === "sound") {
      soundPrograms.push(allPrograms[i]);
    }
    else if (programNameSub === "activ") {
      movePrograms.push(allPrograms[i]);
    }
  }  
  
  // Build inner HTML for Modal
  let modalInnerHTML = `
    <div class="row">
      <div class="col-md-6">Movements</div>
      <div class="col-md-6">Sounds</div>
    </div>
    <div class="row">
      <div class="col-md-6">
  `;
  for (let i = 0; i < movePrograms.length; i++) {
    modalInnerHTML += movePrograms[i].innerHTML;
  }

  modalInnerHTML += `
      </div>
      <div class="col-md-6">
  `;

  for (let i = 0; i < soundPrograms.length; i++) {
    modalInnerHTML += soundPrograms[i].innerHTML;
  }

  modalInnerHTML += `
      </div>
    </div>
  `;

  modalBody.innerHTML = modalInnerHTML;
  
}

function prepRobotProgram(robotId) {
  if (robotId != Robot.robotId) {
    Robot.setRobotId(robotId);
  }
}

async function runProgram(robotId, programId) {
  let robotListDiv = document.getElementById("logClicksToggle");
  let programName = robotPrograms[robotId][programId].name

  if (robotListDiv.checked) {
    // Log timestamp to db if "Track Clicks" is toggled
    robot.logData(programId, "run_program", "robot" + robotId, programName);
    console.log("Logging in Firebase: " + programName);
  }
  
  console.log("Will run program: " + programName);
  let codeText = robotPrograms[robotId][programId].program;
  codeText = codeText.replace(/robot.sleep/g, "await robot.sleep");
  eval("(async () => {" + codeText + "})();");
}

