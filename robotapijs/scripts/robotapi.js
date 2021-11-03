/*
* Robot class for defining the API functions
*/
function Robot(robotId, apiDiv) {

  Robot.robotId = robotId;
  Robot.apiDiv = apiDiv;
  
  Robot.faces = null;
  Robot.bellyScreens = null;
  Robot.currentScreen = -1;
  Robot.sounds = null;
  Robot.tactile = null;
  Robot.motors = null;
  Robot.poses = null;
  
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
    
    var dbRefInput = firebase.database().ref(
      '/robots/' + Robot.robotId + '/inputs/');
    dbRefInput.on("value", Robot._updateRobotInput);

    console.log("Robot initialized.");
  }

  Robot.getAPIHTML = function() {
    // TODO: This should be automatically generated
    var apiText = "";
    apiText += Robot._getAPICardHTML("robot.speak(text)",
                        "Makes the robot speak the given text out loud.",
                       "<b>text</b> is a String within single or double quotes",
                       "robot.speak(\"Hello world\");");
    apiText += Robot._getAPICardHTML("robot.moveNeck(rotate, tilt, pan, turn)",
                        "Increments the robot's neck move the indicated angles.",
                       "<b>rotate</b> is an Integer representing the left/right tilt angle in degrees.<br>" +
                       "<b>tilt</b> is an Integer representing the up/down tilt angle in degrees.<br>" +
                       "<b>pan</b> is an Integer representing the horizontal movement in degrees.<br>" +
                       "<b>turn</b> is an Integer representing the left/right rotation angle in degrees.",
                       "robot.moveNeck(0, -30, 0, 0);");
    if (Robot.poses != null && Robot.poses.length > 0)
      apiText += Robot._getAPICardHTML("robot.inputPose(poseIndex)",
                        "Changes the robot's pose to one of its preset poses.",
                      "<b>poseIndex</b> is an Integer between 0 and " +
                        (Robot.poses.length-1) +  ", available poses are:" +
                        Robot._getPoseNames(),
                      "robot.inputPose(0);");
    apiText += Robot._getAPICardHTML("robot.setSpeechBubble(text)",
                        "Sets the robot's speech bubble to the given text.",
                       "<b>text</b> is a String within single or double quotes",
                       "robot.setSpeechBubble(\"Hello world\");");
    if (Robot.sounds != null && Robot.sounds.length>0)
      apiText += Robot._getAPICardHTML("robot.playSound(soundIndex)",
                        "Makes the robot play one of its preset sounds.",
                       "<b>soundIndex</b> is an Integer between 0 and " +
                        (Robot.sounds.length-1) +  ", available sounds are:" +
                        Robot._getSoundNames(),
                       "robot.playSound(0);");
    if (Robot.faces != null && Robot.faces.length>0)
      apiText += Robot._getAPICardHTML("robot.setFace(faceIndex)",
                        "Sets the robot's face to one of pre-designed faces.",
                       "<b>faceIndex</b> is an Integer between 0 and " +
                        (Robot.faces.length-1) + ", available faces are:" +
                        Robot._getFaceNames(),
                       "robot.setFace(0);");
    if (Robot.bellyScreens != null && Robot.bellyScreens.length>0){
      apiText += Robot._getAPICardHTML("robot.setScreen(screenIndex)",
                        "Sets the robot's belly screen to one of pre-designed screens.",
                       "<b>screenIndex</b> is an Integer between 0 and " +
                        (Robot.bellyScreens.length-1) + ", available screens are:" +
                        Robot._getScreenNames(),
                       "robot.setScreen(0);");
      apiText += Robot._getAPICardHTML(
        'robot.setScreenByName(screenName)',
        "Sets the robot's belly screen to one of pre-designed screens.",
        '<b>screenName</b> is an String. ' +
          'Available screens are:' +
          Robot._getScreenNames(),
        'robot.setScreenByName("Screen-0");'
      );
      apiText += Robot._getAPICardHTML(
        'robot.setLargeInstruction(screenIndex, text)',
        "Sets the text of a specific robot belly screen.",
        '<b>screenIndex</b> is an integer corresponding to a specific belly screen. ' +
        '<b>text</b> is an String. ',
        'robot.setLargeInstruction(0, "Hello!");'
      );
      apiText += Robot._getAPICardHTML(
        'robot.setSmallInstruction(screenIndex, text)',
        'Sets the small instruction text of a specific robot belly screen.',
        '<b>screenIndex</b> is an integer corresponding to a specific belly screen. ' +
          '<b>text</b> is an String. ',
        'robot.setSmallInstruction(0, "Hello!");'
      );
      apiText += Robot._getAPICardHTML("(sliderValue) robot.getSliderValue()",
                        "Obtains the current value of the slider on the screen.",
                       "<b>sliderValue</b> is an Integer between 0 and 100 indicating the current value of the slider.",
                       "var sliderValue = robot.getSliderValue();");
      // apiText += Robot._getAPICardHTML(
      //   '(textInputValue) robot.getTextInputValue()',
      //   'Obtains the current text from the text area field on the screen.',
      //   '<b>textInputValue</b> is an String indicating the current value of the text area field.',
      //   'var textInputValue = robot.getTextInputValue();'
      // );
      apiText += Robot._getAPICardHTML(
        '(textInputValue) robot.getScreenSavedTextInputValue(screenIndex)',
        'Obtains the current text from the text area field on a specific screen, if it was stored in a saved text field.',
        '<b>textInputValue</b> is an String indicating the current value of the text area field.',
        'var textInputValue = robot.getScreenSavedTextInputValue(1);'
      );
      apiText += Robot._getAPICardHTML("(buttonName) robot.waitForButton()",
                        "Makes the robot wait until a button in the screen is pressed and returns the name of the pressed button.",
                       "<b>buttonName</b> is a String that indicates the name of the button that was pressed.",
                       "var buttonName = await robot.waitForButton();");
    }

    apiText += Robot._getAPICardHTML("(sensorValue) robot.getTactileSensor(sensorName)",
                        "Obtains the current value of the indicated tactile sensor.",
                       "<b>sensorName</b> is an String corresponding to the specific sensor. (TODO include list of names here once finalized) <br>"+
                       "<b>sensorValue</b> is an Interger corresponding to the current value of the sensor. (TODO include range and meaning here once finalized)",
                       "var sensorValue = robot.getTactileSensor(\"sensor1\");");
    apiText += Robot._getAPICardHTML("robot.sleep(duration)",
                        "Makes the robot sleep for the specified duration.",
                       "<b>duration</b> is an Integer that specifies how long the robot will sleep/wait/do nothing in <i>milliseconds</i>",
                       "await robot.sleep(1000);");


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
  
  
  Robot._getScreenNames = function() {
    return Robot._getNames(Robot.bellyScreens);
  }

  Robot._getSoundNames = function() {
    return Robot._getNames(Robot.sounds);
  }

  Robot._getFaceNames = function() {
    return Robot._getNames(Robot.faces);
  }

  Robot._getPoseNames = function() {
    return Robot._getNames(Robot.poses);
  }

  Robot._getNames = function(objectList) {
    var namesText = "<ul>";
    for (var i=0; i<objectList.length; i++) {
      namesText += "<li>" + i + ": "+ objectList[i].name + "</li>";
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
    if (apiData.states != undefined)
      Robot.faces = apiData.states.faces;
      Robot.poses = apiData.states.poses;
    if (apiData.inputs != undefined)
      Robot.bellyScreens = apiData.inputs.bellyScreens;
    if (apiData.actions != undefined)
      Robot.sounds = apiData.actions.sounds;      

    if (Robot.apiDiv != undefined) {
      Robot.apiDiv.innerHTML = Robot.getAPIHTML();
    }
  }

  Robot._updateRobotInput = function(snapshot) {
    var inputData = snapshot.val();
    if (inputData != null)
      Robot.tactile = inputData.tactile;
  }
  
  Robot.logData = async function(sliderValue, activity, location, scale) {
      var currTime = Date.now();
      var currDate = new Date().toDateString();
      var dir =
        'study_users/' +
        firebase.auth().currentUser.displayName +
        '/data/' +
        activity +
        '/' +
        currDate; 
      var dbRef = firebase.database().ref(dir);
      dbRef.push().set({
        time: currTime,
        value: sliderValue,
        location,
        scale
      });
    }
  
  this.getSliderValue = function() {
    var sliderValue = null;
    if (Robot.bellyScreens!=null && Robot.currentScreen>=0 
        && Robot.currentScreen < Robot.bellyScreens.length) {
      if (Number(Robot.bellyScreens[Robot.currentScreen].slider.isShown) == 1)
        sliderValue = Number(Robot.bellyScreens[Robot.currentScreen].slider.current);
    }
    return sliderValue;
  }

  this.getTextInputValue = function() {
    var textInputValue = null;
    if (
      Robot.bellyScreens != null &&
      Robot.currentScreen >= 0 &&
      Robot.currentScreen < Robot.bellyScreens.length
    ) {
      if (Number(Robot.bellyScreens[Robot.currentScreen].textInput.isShown) == 1)
        textInputValue =
          Robot.bellyScreens[Robot.currentScreen].textInput.value;
    }
    return textInputValue;
  }

  this.getScreenSavedTextInputValue = function (screenIndex) {
    var textInputValue = null;
    if (
      Robot.bellyScreens != null &&
      screenIndex >= 0 &&
      screenIndex < Robot.bellyScreens.length && 
      Robot.bellyScreens[screenIndex].savedTextInput &&
      Robot.bellyScreens[screenIndex].savedTextInput.isShown
    ) {
      if (Number(Robot.bellyScreens[screenIndex].savedTextInput.isShown) == 1)
        textInputValue = Robot.bellyScreens[screenIndex].savedTextInput.value;
    }
    return textInputValue;
  };

  this.getTactileSensor = function(sensorName) {
    var sensorValue = null;
    if (Robot.tactile!=null) {
      sensorValue = Robot.tactile[sensorName]
    }
    return sensorValue;
  }

  this.waitForButton = async function(name) {
    var buttonPressed = null;
    
    if (Robot.bellyScreens!=null && Robot.currentScreen>=0 
        && Robot.currentScreen < Robot.bellyScreens.length) {
      var buttonList = Robot.bellyScreens[Robot.currentScreen].buttons.list;
      if (buttonList != undefined || buttonlist.length > 0) {
        if (name == undefined)
          buttonPressed = await this._waitForAnyButton();
        else
          buttonPressed = await this._waitForSpecificButton(name);
      }
    }
    else {
      console.log("The robot has no belly screen.");
    }
    
    return buttonPressed;
  } 
  
  this._waitForAnyButton = async function() {
    var date = new Date();
    var buttonList = Robot.bellyScreens[Robot.currentScreen].buttons.list;
    var buttonPressed = null;
    
    console.log("Will wait for any button.");
    var waiting = true;
    while (waiting) {
      buttonList = Robot.bellyScreens[Robot.currentScreen].buttons.list;
      if (
        Robot.bellyScreens[Robot.currentScreen].navButtonList &&
        Robot.bellyScreens[Robot.currentScreen].navButtonList.backButton &&
        Robot.bellyScreens[Robot.currentScreen].navButtonList.backButton.lastPressed
      ) {
        buttonList.push(
          Robot.bellyScreens[Robot.currentScreen].navButtonList.backButton
        );
      }
      for (var i = 0; i < buttonList.length; i++) {
        var button = buttonList[i];
        var currentTime = date.getTime();
        var buttonTime = button.lastPressed;
        if (buttonTime > currentTime) {
          buttonPressed = buttonList[i].name;
          waiting = false;
        }
      }
      if (waiting)
        await this.sleep(100);           
    }
    return buttonPressed;
  }
  
  this._waitForSpecificButton = async function(name) {
    var date = new Date();
    var buttonIndex = -1;
    var buttonList = Robot.bellyScreens[Robot.currentScreen].buttons.list;
    
    for (var i=0; i<buttonList.length; i++) {
      if (buttonList[i].name == name)
        buttonIndex = i;
    }
    
    if (buttonIndex == -1) {
      console.log("Warning: There is no button: " + name);
      return null;
    }
    else {
      console.log("Will wait for button: " + name);
      var waiting = true;
      while (waiting) {
        buttonList = Robot.bellyScreens[Robot.currentScreen].buttons.list;
        var button = buttonList[buttonIndex];
        var currentTime = date.getTime();
        var buttonTime = button.lastPressed;
        if (buttonTime>currentTime)
          waiting = false;
        else
          await this.sleep(100);           
      }
      return name;
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

  Robot._requestRobotStates = function (stateNames, newStates) {
    var dbRef = firebase.database().ref('/robots/' + Robot.robotId + '/state/');
    var updates = {};
    stateNames.forEach((elem, index) => {
      updates[elem] = newStates[index];
    })
    dbRef.update(updates);
  };

  Robot._requestRobotScreen = function (screenIndex, newState) {
    var dbRef = firebase.database().ref('/robots/' + Robot.robotId + '/customAPI/inputs/bellyScreens/' + screenIndex);
    dbRef.update(newState);
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
  
  this.setScreen = function(screenIndex){
    console.log("Setting screen to " + screenIndex);
    if (screenIndex < 0 || screenIndex>=Robot.bellyScreens.length)
      console.log("Wrong screen index.");
    else {
      Robot.currentScreen = screenIndex;
      Robot._requestRobotState("currentBellyScreen", screenIndex);
    }
  }

  this.setScreenByName = function (screenName) {
    let screenIndex = Robot.bellyScreens.findIndex((screen) => screen.name === screenName);
    console.log('Setting screen to ' + screenIndex);
    if (screenIndex < 0 || screenIndex >= Robot.bellyScreens.length)
      console.log('Wrong screen index.');
    else {
      Robot.currentScreen = screenIndex;
      Robot._requestRobotState('currentBellyScreen', screenIndex);
    }
  };

  this.setMotor = function (index, name, value, motorState) {
    console.log('Setting motor ' + name + ' to ' + value);
    console.log('Motor state', motorState);
    let newState =  [...motorState.slice(0, index), {...motorState[index], value }, ...motorState.slice(index + 1)];
    console.log(newState);
    Robot._requestRobotState('motors', newState);
  }

  this.setExcitement = function (value) {
    Robot._requestRobotState('excitement', value);
  }

  this.setMotors = function (updatedMotorState) {
    Robot._requestRobotState('motors', updatedMotorState);
  }
  
  this.setPose = function (index, name, poseState, motorState) {
    console.log('Setting pose ' + name);
    let newState = [
      ...poseState.slice(0, index),
      {
        ...poseState[index],
        lastPressed: Date.now(),
      },
      ...poseState.slice(index + 1),
    ];
    let newMotorState = motorState;
    poseState[index].motors.forEach((elem, index) => {
      newMotorState[index].value = elem
    });
    Robot._requestRobotStates(['poses', 'motors'], [newState, newMotorState])
  }

  this.inputPose = function (index) {
    var dbRefMotor = firebase.database().ref('/robots/' + Robot.robotId + '/state/motors/');
    var currentMotorState = null;
    dbRefMotor.on('value', (snapshot) => {
      currentMotorState = snapshot.val();
    })
    var dbRefPose = firebase.database().ref('/robots/' + Robot.robotId + '/state/poses/');
    var poseState = null;
    var poseStateName = null;
    dbRefPose.on('value', (snapshot) => {
      poseState = snapshot.val();
      poseStateName = poseState[index].name;
    })
    if (currentMotorState && poseState) {
      console.log('Updating pose to ' + index + ': ' + poseStateName);
      this.setPose(index, poseStateName, poseState, currentMotorState);
    }
  }

  this.updatePoseAPI = function(newPoseState) {
    var dbRef = firebase.database().ref('/robots/' + Robot.robotId + '/customAPI/states/poses/');
    var updates = {};
    newPoseState.forEach((elem, index) => {
      updates[index] = {name: elem.name ? elem.name : 'Pose ' + index};
    });
    updates[newPoseState.length] = null;
    dbRef.update(updates);
  }

  this.saveNewPose = function (newPoseState) {
    Robot._requestRobotState('poses', newPoseState);
    this.updatePoseAPI(newPoseState);
  }

  this.deletePose = function(index, poseState) {
    if (index > -1 && index < poseState.length) { 
      Robot._requestRobotState(
        'poses',
        poseState.filter((item, idx) => index !== idx)
      );
      this.updatePoseAPI(poseState.filter((item, idx) => index !== idx));
    }
  }

  this.setLargeInstruction = function (screenIndex, text) {
    if (screenIndex < 0 || screenIndex>=Robot.bellyScreens.length)
      console.log("Wrong screen index.");
    else {
      updated = { ...Robot.bellyScreens[screenIndex] };
      updated.instructionLarge.text = text;
      Robot._requestRobotScreen(screenIndex, updated);
    }
  }

  this.setSmallInstruction = function (screenIndex, text) {
    if (screenIndex < 0 || screenIndex >= Robot.bellyScreens.length)
      console.log('Wrong screen index.');
    else {
      updated = { ...Robot.bellyScreens[screenIndex] };
      updated.instructionSmall.text = text;
      Robot._requestRobotScreen(screenIndex, updated);
    }
  };
  
  this.setEyes = function(value) {
    Robot._requestRobotState("currentEyes", value);
  }
  
  this.playSound = function(soundIndex){
    console.log("Playing sound: " + soundIndex);
    Robot._requestRobotAction("sound", {index:soundIndex});
    //TODO: Implement callback for when action is done
  }

  this.moveNeck = function(rotate, tilt, pan, turn) {
    // Get current motorState and update
    var dbRef = firebase.database().ref('/robots/' + Robot.robotId + '/state/motors/');
    var newState = null
    dbRef.on('value', (snapshot) => {
      var currentState = snapshot.val();
      newState = currentState;
      currentState.forEach((elem, index) => {
        if (elem.name == 'Left/Right Tilt' && rotate != 0) {
          if (rotate > 0)
            newState[index].value = Math.min(elem.max, elem.value + rotate);
          else
            newState[index].value = Math.max(elem.min, elem.value + rotate);
        }
        else if (elem.name == 'Up/Down Tilt' && tilt != 0) {
          if (tilt > 0)
            newState[index].value = Math.min(elem.max, elem.value + tilt);
          else
            newState[index].value = Math.max(elem.min, elem.value + tilt);
        }
        else if (elem.name == 'Neck' && pan != 0) {
          if (pan > 0)
            newState[index].value = Math.min(elem.max, elem.value + pan);
          else
            newState[index].value = Math.max(elem.min, elem.value + pan);
        }
        else if (elem.name == 'Rotate' && turn != 0) {
          if (turn > 0)
            newState[index].value = Math.min(elem.max, elem.value + turn);
          else
            newState[index].value = Math.max(elem.min, elem.value + turn);
        }
      })
    })
    this.setMotors(newState);
    console.log('MotorState values: L/R=' + newState[0].value
      + ', U/D=' + newState[1].value
      + ', Neck=' + newState[2].value
      + ', Rotate=' + newState[3].value);
    //TODO: Implement callback for when action is done
  }

  this.sleep = async function(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
  }
  
  this.logData = async function (sliderValue, activity, location, scale) {
    Robot.logData(sliderValue, activity, location, scale);
  }
  
  // TODO: Add other actions
}
