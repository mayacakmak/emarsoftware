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
}

