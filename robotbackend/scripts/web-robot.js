var config = new Config();
var db = new Database(config.config, initializeWebRobot);

function initializeWebRobot() {
	var currentRobot = 0;
	var robotParam = Config.getURLParameter("robot");
	if (robotParam != null)
		currentRobot = Number(robotParam);
	console.log("currentRobot: " + currentRobot);
	var robot = new RobotBackend(currentRobot, "small");
	RobotBackend.initializeAPI();
	RobotBackend.initializeFace();
	RobotBackend.initializeBelly("height");
}
