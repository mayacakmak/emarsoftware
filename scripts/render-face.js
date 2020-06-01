var config = new Config();
var db = new Database(config.config, initializeRenderFace);

function initializeRenderFace() {
  
  var currentRobot = 0;
  var robotParam = Config.getURLParameter("robot");
  if (robotParam != null)
    currentRobot = Number(robotParam);
  console.log("currentRobot: " + currentRobot);

  var robot = new RobotBackend(currentRobot);
  RobotBackend.initializeAPI();
  RobotBackend.initializeFace();
  
  window.onresize = Face.draw;
  var svg = document.getElementById('faceSVG');
  screen.orientation.lock('landscape');

  // Log time spent in face render
  window.onbeforeunload = function () {
    calculateTime(
      sessionStorage.getItem('startFaceRenderTime'),
      new Date().getTime(),
      'faceRender'
    );
  };
  window.onfocus = function () {
    sessionStorage.setItem('startFaceRenderTime', new Date().getTime());
  };
  window.onblur = function () {
    calculateTime(
      sessionStorage.getItem('startFaceRenderTime'),
      new Date().getTime(),
      'faceRender'
    );
  };
}

function closeRobot() {
  // endFaceRenderTime = (new Date()).getTime();
  // calculateTime(
  //   sessionStorage.getItem('startFaceRenderTime'),
  //   endFaceRenderTime,
  //   'faceRender'
  // );
  // if (!backPage) {
  window.history.back();
  // } else {
  //   window.location.href = 'index.html';
  // }
}

function calculateTime(start, end, event) {
  var dur = (end - start) / 1000;
  var currDate = new Date().toDateString();
  console.log(dur);
  var dir =
    'users/' +
    firebase.auth().currentUser.displayName +
    '/' +
    event +
    '/' +
    currDate;
  var dbRef = firebase.database().ref(dir);
  dbRef.push().set({
    date: currDate,
    time_start: start,
    time_end: end,
    duration_sec: dur,
  });
  console.log('Logging diary time: ----------');
}
