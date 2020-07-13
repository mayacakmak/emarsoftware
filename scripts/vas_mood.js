var config = new Config();
var db = new Database(config.config, databaseReadyCallback);
var moodSlider = document.getElementById("moodslider");
var mood = "not changed";
var date = new Date();
var dir;
var dbRef;
function databaseReadyCallback() {
  dir =
      "users/" +
      firebase.auth().currentUser.displayName +
      "/VAS/" +
      date.toDateString() +
      "/mood";
  dbRef = firebase.database().ref(dir);
}

moodSlider.oninput = function() {
  mood = this.value;
};

function backToIndexPage() {
  window.location.href = 'index.html';
}

function recordMood() {
  if (mood === "not changed") {
    alert("Please move the slider to indicate your mood levels.");
    return;
  } else {
    dir =
      "users/" +
      firebase.auth().currentUser.displayName +
      "/VAS/" +
      date.toDateString() +
      "/mood";
    dbRef = firebase.database().ref(dir);
    dbRef.push().set({
      timestamp: date.toLocaleString(),
      moodValue: this.mood
    });
    console.log("Logging mood: ----------");
    window.location.href = "index.html";
  }
}
