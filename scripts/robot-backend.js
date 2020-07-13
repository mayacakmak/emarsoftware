/* Back-end of robot states and actions
triggered by changes in the database*/

function RobotBackend(robotId, scale) {
  RobotBackend.robotId = robotId;
  
  RobotBackend.belly = null;
  RobotBackend.sound = null;
  RobotBackend.face = null;

  // Loading from Users now instead
  RobotBackend.initializeAPI = function() {
    var dbRefAPI = firebase.database().ref(
      '/users/' + Database.displayName + '/robot/customAPI/');
    dbRefAPI.on("value", RobotBackend.updateRobotAPI);
  }

  RobotBackend.initializeFace = function() {
    RobotBackend.face = new Face();
    RobotBackend.sound = new Sound();
    
    var dbRefState = firebase.database().ref(
      '/users/' + Database.displayName + '/robot/state/');
    dbRefState.on("value", Face.updateRobotFace);
    
    var dbRefActions = firebase.database().ref(
      '/users/' + Database.displayName + '/robot/actions/');
    dbRefActions.on("value", RobotBackend.speakReceived);
    dbRefActions.on("value", RobotBackend.soundReceived);
  }

  RobotBackend.initializeBelly = function() {
    RobotBackend.belly = new Belly(robotId, scale);
    
    var dbRefState = firebase.database().ref(
      '/users/' + Database.displayName + '/robot/state/');
    dbRefState.on("value", Belly.updateRobotBelly);
    
    var dbRefAPI = firebase.database().ref(
      '/users/' + Database.displayName + '/robot/customAPI/');
    dbRefAPI.on("value", Belly.updateRobotBelly);
  }
  
  RobotBackend.resetRobotAction = function(actionName, updates) {
    var dbRef = firebase.database().ref(
      "/users/" + Database.displayName + "/robot/actions/" + actionName + "/");
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

  RobotBackend.updateRobotAPI = function(snapshot) {
    var apiData = snapshot.val();
      
    if (RobotBackend.belly != null)
      Belly.bellyScreens = apiData.inputs.bellyScreens;

    if (RobotBackend.face != null)
      Face.faces = apiData.states.faces;

    if (RobotBackend.sound != null) {
      // Load sounds only once in the beginning
      if (Sound.sounds == null && apiData.actions!=undefined) {
        var newSounds = apiData.actions.sounds;
        if (newSounds != undefined && newSounds.length > 0)
          Sound.loadSounds(newSounds);
      }
    }
  }
}


