var config = {
    apiKey: "AIzaSyAisnI9BEW_Uc0-z1ad25nB6eNXEEQ_xQQ",
    authDomain: "emar-database.firebaseapp.com",
    databaseURL: "https://emar-database.firebaseio.com",
    projectId: "emar-database",
    storageBucket: "emar-database.appspot.com",
    messagingSenderId: "672114317207"
};

var db = new Database(config, databaseReadyCallback);

function databaseReadyCallback() {
  console.log("Database ready.");
  var dbRef = firebase.database().ref('/');
  dbRef.on("value", valueChangeCallback);
}

function valueChangeCallback(snapshot) {
  var database = snapshot.val();
  console.log(database);
}

function writeToDatabase() {
  var dir = "/";
  var dbRef = firebase.database().ref(dir);
	dbRef.set({test:"dummy data"});
}
