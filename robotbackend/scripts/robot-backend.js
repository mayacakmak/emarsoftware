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
    dbRefState.on("value", Face.updateRobotFace);
    dbRefState.on("value", RobotBackend.checkHaptics);
    
    var dbRefActions = firebase.database().ref(
      '/robots/' + RobotBackend.robotId + '/actions/');
    dbRefActions.on("value", RobotBackend.speakReceived);
    dbRefActions.on("value", RobotBackend.soundReceived);
  }

  RobotBackend.initializeBelly = function(resizeAxis) {
    RobotBackend.belly = new Belly(robotId, scale, resizeAxis);
    
    var dbRefState = firebase.database().ref(
      '/robots/' + RobotBackend.robotId + '/state/');
    dbRefState.on("value", Belly.updateRobotBelly);
    
    // var dbRefAPI = firebase.database().ref(
      // '/robots/' + RobotBackend.robotId + '/customAPI/');
    // dbRefAPI.on("value", Belly.updateRobotBelly);
  }
  
  RobotBackend.resetRobotAction = function(actionName, updates) {
    var dbRef = firebase.database().ref(
      "/robots/" + RobotBackend.robotId + "/actions/" + actionName + "/");
    return dbRef.update(updates);
  }

  /* ACTIONS */

  RobotBackend.isSpeaking = false;
  RobotBackend.speakReceived = function(snapshot) {
    var robotActions = snapshot.val();
    if (robotActions.speak != undefined) {
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
  }

  RobotBackend.soundReceived = async function(snapshot) {
    var robotActions = snapshot.val();
    if (robotActions.sound != undefined) {
      var soundIndex = Number(robotActions.sound.index);
      if (soundIndex != -1) {
        if (Sound.sounds != null && Sound.sounds.length > 0) {
          if (soundIndex<0 || soundIndex>=Sound.sounds.length)
            soundIndex = 0;

          var soundInfo = Sound.sounds[soundIndex];
          console.log(">>>>> Queuing up sound " + soundInfo.name);
          try {
            const sound_callback = await Sound.makeSound(soundIndex)
            console.log(await sound_callback);
          }
          catch (error) {
            console.error("ERROR in sound: ", error);
            return RobotBackend.resetRobotAction("sound", {index:-1})
          }
        }
      }
    }
    return RobotBackend.resetRobotAction("sound", {index:-1});
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

  RobotBackend.checkHaptics = function(snapshot) {
    var robotState = snapshot?.val ? snapshot.val() : snapshot;
    if (robotState.headTouched && robotState.headTouched > 0) {
      Sound.makeSound(-1);
    }
  }
}


