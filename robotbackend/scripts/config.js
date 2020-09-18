function Config() {
  this.config = {
    apiKey: "AIzaSyAisnI9BEW_Uc0-z1ad25nB6eNXEEQ_xQQ",
    authDomain: "emar-database.firebaseapp.com",
    databaseURL: "https://emar-database.firebaseio.com",
    projectId: "emar-database",
    storageBucket: "emar-database.appspot.com",
    messagingSenderId: "672114317207"
  };
  
  Config.getURLParameter = function(paramName) {
    var url = window.location.toString();
    var urlParamIndex = url.indexOf(paramName+"=");
    var paramValue = null;
    if (urlParamIndex != -1) {
      var valueIndex = urlParamIndex + paramName.length + 1;
      paramValue = url.substring(valueIndex);
      console.log(paramName + ":" + paramValue);
    }
    return paramValue;
  }
}
  
