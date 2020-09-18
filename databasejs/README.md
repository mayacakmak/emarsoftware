# databasejs
Wrapper for some of the standard Firebase real-time database functionality

### Include database.js in your project

**Option 1:** Include the latest version hosted on Github Pages with the following line.

```html
<script src="https://mayacakmak.github.io/databasejs/scripts/database.js"></script>
```

**Option 2:** Download or clone this repository. Copy or move `database.js` into the `scripts/` directory of your project.
Somewhere at the bottom of your .html file include the following line.

```html
<script src="scripts/database.js"></script>
```

### Create a Database instance

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

Then create an instance within your .js file with the following constructor, giving it the config information and, optionally, a callback function to be called when the databse is ready.

```javascript
var db = new Database(config, databaseReadyCallback);
```

### Use Database functionality

Here is an example function that writes data into your Firebase database:

```javascript
function writeToDatabase() {
  var dir = "/";
  var dbRef = firebase.database().ref(dir);
	dbRef.set({test:"dummy data"});
}
```

Here is an example of receiving data from Firebase (once when first connection is established and later anytime there is a value change in the database):

```javascript
function valueChangeCallback(snapshot) {
  var database = snapshot.val();
  console.log(database);
}

function databaseReadyCallback() {
  // Register value change callback when the database is ready.
  var dbRef = firebase.database().ref('/');
  dbRef.on("value", valueChangeCallback);
}
```

### More information on Firebase

Check out the [Firebase documentation](https://firebase.google.com/docs).

For reference, here's the [CodePen project](https://codepen.io/mayacakmak/project/editor/AKazPV) involving `database.js` and and an example `index.js` with the above sample code.
