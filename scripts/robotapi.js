/*
* Robot class for defining the API functions
*/
function Robot(robotId, apiDiv) {
  /*
  * The robot has an instance of the database
  */
  Robot.robotId = robotId;
  Robot.apiDiv = apiDiv;
  
  Robot.faces = null;
  Robot.bellyScreens = null;
  Robot.sounds = null;
  
  Robot.setRobotId = function(robotId) {
    Robot.robotId = robotId;
    Robot.initialize();
  }

  Robot.initialize = function(apiDiv) {
    if (apiDiv != undefined)
      Robot.apiDiv = apiDiv;

    var dbRefAPI = firebase.database().ref(
      '/robots/' + Robot.robotId + '/customAPI/');
    dbRefAPI.on("value", Robot._updateRobotAPI);
    
    console.log("Robot initialized.");
  }

  Robot.getAPIHTML = function() {
    // TODO: This should be automatically generated
    var apiText = "";
    apiText += Robot._getAPICardHTML("robot.speak(text)",
                        "Makes the robot speak the given text out loud.",
                       "<b>text</b> is a String within single or double quotes",
                       "robot.speak(\"Hello world\");");
    apiText += Robot._getAPICardHTML("robot.setSpeechBubble(text)",
                        "Sets the robot's speech bubble to the given text.",
                       "<b>text</b> is a String within single or double quotes",
                       "robot.setSpeechBubble(\"Hello world\");");
    apiText += Robot._getAPICardHTML("robot.setFace(faceIndex)",
                        "Sets the robot's face to one of pre-designed faces.",
                       "<b>faceIndex</b> is an Integer between 0 and numberOfFaces-1, available faces are:" + Robot._getFaceNames(),
                       "robot.setFace(0);");
    apiText += Robot._getAPICardHTML("robot.sleep(duration)",
                        "Makes the robot sleep for the specified duration.",
                       "<b>duration</b> is an Integer that specifies how long the robot will sleep/wait/do nothing in <i>milliseconds</i>",
                       "robot.sleep(1000);");
    return apiText;
  }
  
  Robot._getAPICardHTML = function(title, description, params, example) {
    var cardText = "";
    cardText += "<div class='card mb-3'>";
    cardText += "<div class='card-body'>";
    cardText += "<h5 class='card-title'>" + title + "</h5>";
    cardText += "<h6 class='card-subtitle mb-2 text-muted'><i>" + description + "</i></h6>";
    cardText += "<p class='card-text'>" + params + "</p>";
    cardText += "<hr>";
    cardText += "<b>Example:</b> <samp>" + example + "</samp>";
    cardText += "</div></div>"
    return cardText;
  }
  
  Robot._getFaceNames = function() {
    var namesText = "<ul>";
    for (var i=0; i<Robot.faces.length; i++) {
      namesText += "<li>" + i + ": "+ Robot.faces[i].name + "</li>";
    }
    namesText += "</ul>";
    return namesText;
  }

  /*
  * Function called when a new value is received from the database
  * @param snapshot is a snapshot of the part of the database that
  * the callback was registered
  */
  Robot._updateRobotAPI = function(snapshot) {
    var apiData = snapshot.val();
    Robot.faces = apiData.states.faces;
    Robot.bellyScreens = apiData.inputs.bellyScreens;
    Robot.sounds = apiData.actions.sounds;

    if (Robot.apiDiv != undefined) {
      Robot.apiDiv.innerHTML = Robot.getAPIHTML();
    }
  }
  
  Robot._requestRobotAction = function(actionName, params) {
    var dbRef = firebase.database().ref("/robots/" + Robot.robotId
                                      + "/actions/" + actionName + "/");
    dbRef.update(params);
  }
  
  Robot._requestRobotState = function(stateName, newState) {
    var dbRef = firebase.database().ref("/robots/" + Robot.robotId + "/state/");
    var updates = {};
    updates[stateName] = newState;
    dbRef.update(updates);
  }

  this.speak = function(text) {
    console.log("Speaking");
    Robot._requestRobotAction("speak", {text:text});
  }
  
  this.setSpeechBubble = function(text) {
    console.log("Setting speech bubble");
    Robot._requestRobotState("currentText", text);
  }

  this.setFace = function(faceIndex){
    console.log("Setting face to " + faceIndex);
    if (faceIndex < 0 || faceIndex>=Robot.faces.length)
      console.log("Wrong face index.");
    else
      Robot._requestRobotState("currentFace", faceIndex);
  }
  
  this.playSound = function(soundIndex){
    console.log("Playing sound: " + soundIndex);
    Robot._requestRobotAction("sound", {index:soundIndex});
  }

  this.sleep = async function(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
  }
  // TODO: Add other actions
}
