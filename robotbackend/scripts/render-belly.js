var config = new Config();
var db = new Database(config.config, initializeRenderBelly);

function initializeRenderBelly() {

  var currentRobot = 0;
  var robotParam = Config.getURLParameter("robot");
  if (robotParam != null)
    currentRobot = Number(robotParam);
  console.log("currentRobot: " + currentRobot);
  
  var robot = new RobotBackend(currentRobot);
  RobotBackend.initializeAPI();
  RobotBackend.initializeBelly();
  
}

