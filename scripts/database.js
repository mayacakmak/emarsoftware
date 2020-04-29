/*
 * Database class for interfacing with the Firebase realtime database
 */
function Database(config, readyCallback) {
  Database.isAnonymous = false;
  Database.uid = null;
  Database.isLogging = true;
  Database.session = new Date().getTime();

  /*
   * If somethings need to be initialized only after the database connection
   * has been established, the Database.readyCallback static variable should be
   * set to the initialization function. If it is not null, it will be called
   * when successful sign in happens.
   */
  Database.readyCallback = readyCallback;

  /*
   * Firebase configuration information obntained from the Firebase console
   */
  Database.config = config;

  /*
   * Function to initialize firebase and sign in anonymously
   */
  Database.initialize = function () {
    Database.app = firebase.initializeApp(Database.config);
    firebase.auth().onAuthStateChanged(Database.handleAuthStateChange);
    // Database.signInAnonymously();
    // DON'T SIGN IN ANONYMOUSLY
    // SIGN IN WITH GOOGLE
  };

  /*
   * Callback function for when a library is dynamically loaded
   * Will need to wait for all libraries to be loaded before
   * initializing the database.
   */
  Database.nLibrariesLoaded = 0;
  Database.libraryLoadCallbak = function () {
    Database.nLibrariesLoaded++;
    if (Database.nLibrariesLoaded == 3) {
      Database.initialize();
    }
  };

  Database.loadJSLibrary = function (path) {
    var js = document.createElement('script');
    js.type = 'text/javascript';
    js.src = path;
    js.onreadystatechange = Database.libraryLoadCallbak;
    js.onload = Database.libraryLoadCallbak;
    document.head.appendChild(js);
  };

  Database.loadJSLibrary(
    (src = 'https://www.gstatic.com/firebasejs/6.3.0/firebase-app.js')
  );
  Database.loadJSLibrary(
    (src = 'https://www.gstatic.com/firebasejs/6.3.0/firebase-auth.js')
  );
  Database.loadJSLibrary(
    (src = 'https://www.gstatic.com/firebasejs/6.3.0/firebase-database.js')
  );

  Database.signInAnonymously = function () {
    console.log("?????");
    // if (Database.uid == null) {
    //   firebase.auth().signInAnonymously().catch(Database.handleError);
    // }
  };

  Database.signInWithGoogle = function () {
    console.log('sign in with google');
    if (Database.uid == null) {
      console.log('uid null')
      var provider = new firebase.auth.GoogleAuthProvider();
      firebase.auth().useDeviceLanguage();
      firebase
        .auth()
        .signInWithPopup(provider)
        .then(function (result) {
          // This gives you a Google Access Token. You can use it to access the Google API.
          var token = result.credential.accessToken;
          // The signed-in user info.
          var user = result.user;
        })
        .catch(function (error) {
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          // The email of the user's account used.
          var email = error.email;
          // The firebase.auth.AuthCredential type that was used.
          var credential = error.credential;
          // ...
          console.log(error);
        });
    }
  }

  Database.initializeUserData = function(user) {
    const { uid, displayName } = user;
    var dir = 'users/' + uid;
    var dbRef = firebase.database().ref(dir);
    dbRef.once('value').then(function (snapshot) {
      var robot = snapshot.child('robot').val(); // If robot exists
      console.log('robot', robot);
      if (robot == null) { // Need to add new user information to the database
        var upd = {
          name: displayName,
          robot: {
            customAPI: {
              actions: {
                presetSpeak: {
                  0: "Hello",
                },
                sounds: {
                  0: {
                    name: "beep0",
                    path: "https://firebasestorage.googleapis.com/v0/b/emar-database.appspot.com/o/sounds%2FALL_POSES_DELETED.wav?alt=media&token=f3b26b7a-8780-4a29-9257-fde528636df4",
                  },
                },
              },
              inputs: {},
              states: {},
            },
            actions: {
              neck: {
                panAngle: '',
                tiltAngle: '',
              },
              sound: {
                index: -1,
              },
              speak: {
                text: '',
              }
            },
            inputs: {
              tactile: {
                sensor0: 1,
                sensor1: 1,
                sensor2: 1,
              },
            },
            name: '',
            state: {
              currentBellyScreen: '0',
              currentEyes: "random",
              currentFace: 1,
              currendLEDR: 128,
              currendLEDG: 0,
              currendLEDB: 128,
              currentText: '',
            }
          },
          public: {
            public: true,
          }
        };
        dbRef.update(upd, function(error) {
          console.log(error);
        });
      }
    });
    
  }

  Database.handleError = function (error) {
    var errorCode = error.code;
    var errorMessage = error.message;
    console.log('Error ' + errorCode + ': ' + errorMessage);
  };

  Database.handleAuthStateChange = function (user) {
    if (user) {
      Database.initializeUserData(user);
      Database.isAnonymous = user.isAnonymous;
      Database.uid = user.uid;
      Database.displayName = user.displayName;
      Database.profilePic = user.photoURL;

      if (!Database.isAnonymous) {
        console.log('Signed in as ' + user.displayName);
      } else {
        console.log('Signed in anonymously as ' + user.uid);
      }

      // Create directory in database to save this user's data
      Database.logEvent('SessionStarted');

      if (Database.readyCallback != null || Database.readyCallback != undefined) {
        Database.readyCallback();
        if (window.location.href.includes('signin')) {
          window.location.href = 'index.html';
        }
      }
    } else {
      console.log('User is signed out.');
      if (!window.location.href.includes('signin')) {
        window.location.href = 'signin.html';
      }
    }
  };

  Database.signOut = function () {
    firebase.auth().signOut().then(function() {
      console.log("Sign out successful");
    }).catch(Database.handleError);
    Database.uid = null;
  };

  Database.logEvent = function (eventName, eventLog) {
    if (Database.isLogging) {
      if (eventLog == undefined) eventLog = {};
      var date = new Date();
      var dir = 'users/' + Database.uid + '/analytics/' + Database.session;
      var dbRef = firebase.database().ref(dir);
      eventLog['timeStamp'] = date.getTime();
      eventLog['date'] = date.toDateString();
      eventLog['time'] = date.toTimeString();
      eventLog['screen'] = window.location.href;
      var newEventLog = {};
      newEventLog['SessionStarted'] = eventLog;
      dbRef.update(newEventLog);
      console.log('Logging event: ----------');
      console.log(newEventLog);
    }
  };
}
