/* Back-end of robot states and actions
triggered by changes in the database*/

function RobotBackend(robotId, scale) {
  
  RobotBackend.robotId = robotId;
  
  RobotBackend.belly = null;
  RobotBackend.sound = null;
  RobotBackend.face = null;

  RobotBackend.initializeAPI = function() {
    var dbRefAPI = firebase.database().ref(
      '/robots/' + RobotBackend.robotId + '/customAPI/');
    dbRefAPI.on("value", RobotBackend.updateRobotAPI);
  }

  RobotBackend.initializeFace = function() {
    RobotBackend.face = new Face();
    RobotBackend.sound = new Sound();
    
    var dbRefState = firebase.database().ref(
      '/robots/' + RobotBackend.robotId + '/state/');
    dbRefState.on("value", RobotBackend.eyesChangeReceived);
    dbRefState.on("value", RobotBackend.updateRobotFace);
    
    var dbRefActions = firebase.database().ref(
      '/robots/' + RobotBackend.robotId + '/actions/');
    dbRefActions.on("value", RobotBackend.speakReceived);
    dbRefActions.on("value", RobotBackend.soundReceived);
  }

  RobotBackend.initializeBelly = function() {
    RobotBackend.belly = new Belly(robotId, scale);
    
    var dbRefState = firebase.database().ref(
      '/robots/' + RobotBackend.robotId + '/state/');
    dbRefState.on("value", Belly.updateRobotBelly);
    var dbRefAPI = firebase.database().ref(
      '/robots/' + RobotBackend.robotId + '/customAPI/');
    dbRefAPI.on("value", Belly.updateRobotBelly);
  }
  
  RobotBackend.resetRobotAction = function(actionName, updates) {
    var dbRef = firebase.database().ref(
      "/robots/" + RobotBackend.robotId + "/actions/" + actionName + "/");
    dbRef.update(updates);
  }

  /* ACTIONS */

  RobotBackend.isSpeaking = false;
  RobotBackend.speakReceived = function(snapshot) {
    var robotActions = snapshot.val();
    var sentence = robotActions.speak.text;
    if (sentence != "") {
      if (!RobotBackend.isSpeaking)
      {
        RobotBackend.isSpeaking = true;
        console.log(">>>>>>>>>   Speaking sentence " + sentence);
        Sound.speak(sentence);
        RobotBackend.resetRobotAction("speak", {text:""});
      }
    } else {
      RobotBackend.isSpeaking = false;
    }
  }

  RobotBackend.isMakingSound = false;
  RobotBackend.soundReceived = function(snapshot) {
    var robotActions = snapshot.val();
    var soundIndex = Number(robotActions.sound.index);
    if (soundIndex != -1) {
      if (!RobotBackend.isMakingSound)
      {
        if (Sound.sounds != null && Sound.sounds.length > 0) {
          if (soundIndex<0 || soundIndex>=Sound.sounds.length)
            soundIndex = 0;

          RobotBackend.isMakingSound = true;
          var soundInfo = Sound.sounds[soundIndex];
          console.log(">>>>>>>>>   Making sound " + soundInfo.name);
          Sound.makeSound(soundIndex);
          RobotBackend.resetRobotAction("sound", {index:-1});
        }
      }
    } else {
      RobotBackend.isMakingSound = false;
    }
  }
  
  /* STATE CHANGES */

  RobotBackend.eyesChangeReceived = function(snapshot) {
    var robotState = snapshot.val();
    Face.setLookAt(robotState.currentEyes);
    Face.draw();
  }

  RobotBackend.updateRobotAPI = function(snapshot) {
    var apiData = snapshot.val();
      
    if (RobotBackend.belly != null)
      Belly.bellyScreens = apiData.inputs.bellyScreens;

    if (RobotBackend.face != null)
      Face.faces = apiData.states.faces;

    if (RobotBackend.sound != null) {
      // Load sounds only once in the beginning
      if (Sound.sounds == null) {
        var newSounds = apiData.actions.sounds;
        if (newSounds != undefined && newSounds.length > 0)
          Sound.loadSounds(newSounds);
      }
    }
  }

  RobotBackend.updateRobotFace = function(snapshot) {
    var robotState = snapshot.val();
    var faceIndex = robotState.currentFace;

    if (Face.faces != null && Face.faces.length > 0) {
      if (faceIndex<0 || faceIndex>=Face.faces.length)
        faceIndex = 0;
      var faceParameters = Face.faces[faceIndex];
      Face.updateState(robotState);
      Face.updateParameters(faceParameters);
    } else {
      alert("This robot has no faces. Use the 'Robot Setup' tool to add faces.");
    }
  }
}


