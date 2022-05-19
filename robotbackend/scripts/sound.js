/*
* Sound class for robot voice and sounds
*/
function Sound() {

// var grammar =
//   "#JSGF V1.0; grammar emar; public <greeting> = hello | hi; <person> = maya | alisa;";
// var recognition = new window.webkitSpeechRecognition();
// var speechRecognitionList = new window.webkitSpeechGrammarList();
  Sound.voices;
  Sound.selectedVoice;
  Sound.sounds = null;

  Sound.loadSounds = function(soundList) {
    Sound.sounds = soundList;
    for (var i=0; i<Sound.sounds.length; i++) {
      var soundElementName = "sound" + i;
      var soundElementHTML = "<audio style='display: none;' id='" + soundElementName +
          "' preload src='" + Sound.sounds[i].path + "'>"
      document.body.innerHTML += soundElementHTML;
      console.log("Loading sound " + Sound.sounds[i].name);
    }
    var purrElementHTML = "<audio style='display: none;' id='sound-1' preload src='https://firebasestorage.googleapis.com/v0/b/emar-database.appspot.com/o/sounds%2F1220.wav?alt=media&token=9b989425-6c46-43a7-abe6-cce6384b4b51'></audio>";
    document.body.innerHTML += purrElementHTML;
  }

  Sound.makeSound = function(soundIndex) {
    return new Promise(function(resolve, reject) {
      var soundElementName = "sound" + soundIndex;
      var this_sound = document.getElementById(soundElementName);
      var play_promise = this_sound.play();
      if (play_promise) {
        play_promise.then(function() {}).catch(
          function(error) {
            reject(error);
          }
        )
      }
      this_sound.onended = function() {
        resolve("finished playing sound " + soundIndex);
      }
    })
  }

  Sound.loadVoice = function(isCreateSelector) {
    //speechRecognitionList.addFromString(grammar, 1);
    //recognition.grammars = speechRecognitionList;
    //recognition.continuous = true;
    //recognition.lang = 'en-US';
    //recognition.interimResults = false;
    //recognition.maxAlternatives = 1;
    // document.body.onclick = function() {
    //   recognition.start();
    //   console.log('Ready to receive a color command.');
    // }

    // Execute loadVoices.
    Sound.loadVoiceOptions(isCreateSelector);

    // Chrome loads voices asynchronously.
    window.speechSynthesis.onvoiceschanged = function(e) {
      Sound.loadVoiceOptions(isCreateSelector);
    };
  }

  // Fetch the list of voices and populate the voice options.
  Sound.loadVoiceOptions = function(isCreateSelector) {
    // Fetch the available voices.
    Sound.voices = speechSynthesis.getVoices();
  }

  Sound.changeVoice = function() {
    console.log("changing voice");
    var voiceSelect = document.getElementById("voice");
    selectedVoice = voices.filter(function(voice) {
      return voice.name == voiceSelect.value;
    })[0];
  }

  // function restart() {
  //   recognition.start
  // }
  // recognition.onresult = function(event) {
  //   var inputSpeech = event.results[0][0].transcript;
  //   console.log('Result received: ' + inputSpeech);
  //   say(inputSpeech);
  //   //window.setTimeout(restart, 1000);
  // }

  Sound.voiceStartCallback = function() {
      console.log("Voice started");
  }

  Sound.voiceEndCallback = function() {
      console.log("Voice ended");
  }

  Sound.speak = function(text) {
    console.log("called speak");
    var lang = "en-US";
    /*Check that your browser supports test to speech*/

    // var parameters = {
    //   onstart: voiceStartCallback,
    //   onend: voiceEndCallback
    // }

    responsiveVoice.speak(text,"UK English Female"); //, parameters);

    // if ("speechSynthesis" in window) {
    if (false) {
      var msg = new SpeechSynthesisUtterance();
      var voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        //console.log("Your browser supports " + voices.length + " voices");
        //console.log(voices);
        msg.voice = voices.filter(function(voice) {
          return voice.lang == lang;
        })[0];
      }
      msg.voice = selectedVoice;
      // msg.voiceURI = 'native';
      // msg.volume = 0.8; // 0 to 1
      // msg.rate = 0.9; // 0.1 to 10
      // msg.pitch = 0.9; //0 to 2
      // msg.lang = lang;
      msg.onend = function(e) {
        console.log("Finished in " + e.elapsedTime + " milliseconds.");
      };
      msg.text = text;
      console.log("SPEAKING NOW-----" + msg.text);
      speechSynthesis.speak(msg);
    }
  }

  // function speak(e) {
  //   // Get the text input element.
  //   var speechMsgInput = document.getElementById('speech-msg');
  //   if (speechMsgInput.value.length > 0) {
  //     say(speechMsgInput.value);
  //   }
  // }
}