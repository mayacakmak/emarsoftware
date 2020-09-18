# robotapijs

Javascript library for EMAR robot backend functionality provided through Firebase database updates.

### Include robotapi.js in your project

Note that robotapijs depends on [databasejs](https://github.com/mayacakmak/databasejs/blob/master/README.md#databasejs) so be sure to include `database.js` as well.

**Option 1:** Include the latest version hosted on Github Pages with the following line.

```html
<script src="https://mayacakmak.github.io/robotapijs/scripts/robotapi.js"></script>
```

**Option 2:** Download or clone this repository. Copy or move `robotapi.js` into the `scripts/` directory of your project.
Somewhere at the bottom of your .html file include the following line.

```html
<script src="scripts/robotapi.js"></script>
```

### Create a Robot and Database instance

First, obtian the config information of your Firebase database and add it into the .js file where you will create the Database instance, e.g.:
```javascript
var config = {
    apiKey: "AIzaSyAisnI9BEW_Uc0-z1ad25nB6eNXEEQ_xQQ",
    authDomain: "emar-database.firebaseapp.com",
    databaseURL: "https://emar-database.firebaseio.com",
    projectId: "emar-database",
    storageBucket: "emar-database.appspot.com",
    messagingSenderId: "672114317207"
};
```

Then create an instance of Robot and Database within your .js file with the following constructors, giving it the config information and, optionally, a callback function to be called when the databse is ready.

```javascript
var robot = new Robot(0);
var db = new Database(config, databaseReadyCallback);
```

Here the `databaseReadyCallback` needs to call the `robot.initialize()` function before the other robot functions can be called, e.g.:

```javascript
function databaseReadyCallback() {
  Robot.initialize();
}
```

This constructs an instance of robot with ID number 0. To change the robot ID dynamicalluy use the following function:

```javascript
robot.setRobotID(1);
```

### Use Robot functionality

Here is an example function that calls different robot functions which can be called once the robot is initialized:

```javascript
function testRobotActions() {
  (async () => {
    robot.setFace(0);
    robot.playSound(1);
    await robot.sleep(2000);
    robot.speak("Hello world");
    robot.setSpeechBubble("Hello world");
  })();
}
```

### Access Robot API information

If you would like to display the available robot functions somewhere in your HTML just hand an HTML div to the initialize function as follows:

```javascript
function databaseReadyCallback() {
  var apiDiv = document.getElementById("apiDiv");
  Robot.initialize(apiDiv);
}
```

A demo of accessing the different robot APIs is available on the [github page](https://mayacakmak.github.io/robotapijs/) of this project.

For reference, here's the [CodePen project](https://codepen.io/mayacakmak/project/editor/ABprmo) involving `robotapi.js` and and an example `index.js` with the above sample code.
