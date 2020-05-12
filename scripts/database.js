/*
 * Database class for interfacing with the Firebase realtime database
 */
function Database(config, readyCallback) {
  Database.isAnonymous = false;
  Database.uid = null;
  Database.displayName = null;
  Database.isLogging = true;

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
    Database.signInAnonymously();
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
    if (Database.uid == null) {
      firebase.auth().signInAnonymously().then(() => {
        const name = firebase.auth().currentUser.displayName;
        if (name === null && !window.location.href.includes('signin.html')) {
          window.location.href = 'signin.html';
        } else {
          Database.displayName = name;
        }
      }).catch(Database.handleError);
    }
  };

  Database.handleSignIn = function () {
    const displayName = Database.displayName;
    console.log('handleSignIn', displayName);
    var dir = 'users/' + displayName;
    var dbRef = firebase.database().ref(dir);
    dbRef.once('value').then(function (snapshot) {
      var robot = snapshot.child('robot').val(); // If robot exists
      console.log('robot', robot);
      if (robot == null) {
        // Need to add new user information to the database
        var upd = {
          name: displayName,
          robot: {
            customAPI: {
              actions: {
                presetSpeak: {
                  0: 'Hello',
                },
                sounds: {
                  0: {
                    name: 'beep0',
                    path:
                      'https://firebasestorage.googleapis.com/v0/b/emar-database.appspot.com/o/sounds%2FALL_POSES_DELETED.wav?alt=media&token=f3b26b7a-8780-4a29-9257-fde528636df4',
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
              },
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
              currentEyes: 'random',
              currentFace: 1,
              currentLEDR: 128,
              currentLEDG: 0,
              currentLEDB: 128,
              currentText: '',
            },
          },
          public: {
            public: true,
          },
        };
        dbRef.set(upd, function (error) {
          if (error) {
            console.log('error', error);
          } else {
            console.log('set user data successfully');
          }
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
      Database.isAnonymous = user.isAnonymous;
      Database.uid = user.uid;

      if (!Database.isAnonymous) {
        console.log('Signed in as ' + user.displayName);
      } else {
        console.log('Signed in anonymously as ' + user.displayName);
        console.log('UID:', user.uid);  
      }

      // Create directory in database to save this user's data
      Database.logEvent('SessionStarted');

      if (Database.readyCallback != null || Database.readyCallback != undefined)
        Database.readyCallback();
    } else {
      console.log('User is signed out.');
    }
  };

  Database.signOut = function () {
    firebase.auth().signOut().catch(Database.handleError);
    Database.uid = null;
  };

  Database.logEvent = function (eventName, eventLog) {
    if (Database.isLogging) {
      if (eventLog == undefined) eventLog = {};
      var dir = 'users/' + Database.uid;
      var dbRef = firebase.database().ref(dir);
      var date = new Date();
      eventLog['timeStamp'] = date.getTime();
      eventLog['date'] = date.toDateString();
      eventLog['time'] = date.toTimeString();
      var newEventLog = {};
      newEventLog[eventName] = eventLog;
      dbRef.update(newEventLog);
      console.log('Logging event: ----------');
      console.log(newEventLog);
    }
  };
}
