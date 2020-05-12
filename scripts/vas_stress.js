var config = new Config();
var db = new Database(config.config, databaseReadyCallback);
var stressSlider = document.getElementById("stresslider");
var stress = "not changed";
var date = new Date();
var dir_stress;
var dbRefStress;
function databaseReadyCallback() {
  dir_stress = "users/" + firebase.auth().currentUser.uid + "/VAS/" + date.toDateString() + "/stress"
  dbRefStress = firebase.database().ref(dir_stress);
}
// Slider input events
stressSlider.oninput = function() {
  stress = this.value;
};

function recordStress() {
  if (stress === "not changed") {
    alert("Please move the slider to indicate your stress levels.");
    return;
  } else {
    dir_stress = "users/" + firebase.auth().currentUser.uid + "/VAS/" + date.toDateString() + "/stress";
    dbRefStress = firebase.database().ref(dir_stress);
    dbRefStress.push().set({
      timestamp: date.toLocaleString(),
      stressValue: this.stress
    });
    console.log("Logging stress: ----------");
  }
  window.location.href = "datain_mood.html";
}