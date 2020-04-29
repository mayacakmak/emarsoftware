var config = new Config();
var db = new Database(config.config, databaseReadyCallback);

function databaseReadyCallback() {
  console.log('currUser', firebase.auth().currentUser.uid);
}

function signInGoogle() {
  Database.signInWithGoogle();
}

function signIn(email, password) {
  window.location.href = 'main.html';
}

function signUp(name, email, password) {
  window.location.href = 'main.html';
}
