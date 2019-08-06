var svgNS = "http://www.w3.org/2000/svg";

var currentState = null;
var currentFaceParameters = null;
var currentLookAt = "none";

/*
* Face class for creating the robot face
*/
function Face() {

  Face.eyes = new Eyes();

  // List of available faces (with all face parameter info)
  Face.faces = null;

  Face.draw = function() {

    var faceDiv = document.getElementById("robotFace");
    var faceWidth = faceDiv.clientWidth;
    var faceHeight = Math.round(faceWidth/0.5625);
    if (Face.parameters.isHorizontal)
      faceHeight = Math.round(faceWidth*0.5625);

    faceDiv.style.height = faceHeight + "px";  
    faceDiv.style.backgroundColor = Face.parameters.backgroundColor;

    var svg = document.getElementById("faceSVG");
    svg.innerHTML = "";
    svg.setAttribute("viewBox", "0 0 " + faceWidth + " " + faceHeight);

    Face.drawBackground();
    Eyes.draw();

    if (Face.parameters.hasMouth)
      Face.drawMouth(false, false);

    if (Face.parameters.hasNose)
      Face.drawNose();

    Face.drawSpeechBubble(Face.parameters.hasText);
  }
  
  Face.setLookAt = function(where) {
    if (where == "random") {
      Eyes.isLookingAround = true;
    }
    else {
      Eyes.isLookingAround = false;
      Eyes.currentLookAt = where;
    }
  }

  Face.drawBackground = function() {
    var svg = document.getElementById("faceSVG");
    var svgHeight = svg.clientHeight;
    var svgWidth = svg.clientWidth;

    var background = document.getElementById("backgroundRect");
    var bubbleExists = (background != null);
    if (!background)
      background = document.createElementNS(svgNS, "rect");
    background.setAttribute("id", "backgroundRect");
    background.setAttribute("height", svgWidth);
    background.setAttribute("width", svgWidth);
    background.setAttribute("cx", 0);
    background.setAttribute("cy", 0);
    background.setAttribute("fill", Face.parameters.backgroundColor);
    svg.appendChild(background);
  }
  
  Face.drawSpeechBubble = function(hasText) {
    var svg = document.getElementById("faceSVG");
    var svgHeight = svg.clientHeight;
    var svgWidth = svg.clientWidth;

    var bubble = document.getElementById("bubbleRect");
    var bubbleExists = (bubble != null);
    var arrow = document.getElementById("bubbleArrow");
    var arrowExists = (arrow != null);
    var bubbleText = document.getElementById("bubbleText");
    var bubbleTextExists = (bubbleText != null);

    console.log("bubbleExists:" + bubbleExists);
    console.log("arrowExists:" + arrowExists);
    console.log("bubbleTextExists:" + bubbleTextExists);
    console.log(bubbleText);

    if (hasText) {
      if (!bubbleExists)
        bubble = document.createElementNS(svgNS, "rect");
      if (!arrowExists)
        arrow = document.createElementNS(svgNS, "polygon");
      if (!bubbleTextExists)
        bubbleText = document.createElementNS(svgNS, "text");

      bubble.setAttribute("id", "bubbleRect");
      bubble.setAttribute("height", Face.parameters.bubbleHeight);
      bubble.setAttribute("width", svgWidth);
      bubble.setAttribute("cx", 0);
      bubble.setAttribute("cy", 0);
      bubble.setAttribute("fill", Face.parameters.bubbleColor);

      arrow.setAttribute("id", "bubbleArrow");
      var arrowSize = 12;
      arrow.setAttribute("points", (svgWidth/2-arrowSize) + "," + Face.parameters.bubbleHeight + " " + (svgWidth/2) + "," + (Face.parameters.bubbleHeight + arrowSize) + " " + (svgWidth/2+arrowSize) + "," + Face.parameters.bubbleHeight);
      arrow.setAttribute("fill", Face.parameters.bubbleColor);

      bubbleText.setAttribute("id", "bubbleText");
      bubbleText.setAttribute("x", svgWidth/2);
      bubbleText.setAttribute("y", Face.parameters.bubbleHeight/2);
      bubbleText.setAttribute("text-anchor", "middle");
      bubbleText.setAttribute("alignment-baseline", "middle");
      bubbleText.setAttribute("fill", Face.parameters.fontColor);

      var speechBubbleText = "...";
      if (currentState != null && currentState.currentText != "")
        speechBubbleText = currentState.currentText;

      bubbleText.innerHTML = speechBubbleText;
      bubbleText.style.fontSize = Face.parameters.fontSize;

      if (!arrowExists)
        svg.appendChild(arrow);
      if (!bubbleExists)
        svg.appendChild(bubble);
      if (!bubbleTextExists)
        svg.appendChild(bubbleText);
    }
    else {
      if (arrowExists)
        svg.removeChild(arrow);
      if (bubbleExists)
        svg.removeChild(bubble);
      if (bubbleTextExists)
        svg.removeChild(bubbleText);
    }
  }

  Face.drawNose = function() {

    var svg = document.getElementById("faceSVG");
    var svgHeight = svg.clientHeight;
    var svgWidth = svg.clientWidth;

    var nose = document.getElementById("nose");
    var noseExists = (nose != null);
    if (!noseExists) {
      nose = document.createElementNS(svgNS, "ellipse");
    }

    nose.setAttribute("id", "nose");
    nose.setAttribute("cx", "50%");
    nose.setAttribute("cy", Face.parameters.noseYPercent + "%");
    nose.setAttribute("rx", Face.parameters.noseRPercent + "%");
    // nose.setAttribute("ry", Face.parameters.noseRPercent + "%");
    nose.setAttribute("fill", Face.parameters.noseColor);

    if (!noseExists)
      svg.appendChild(nose);
  }
  
  
// Check this out for more mouth shapes:
// https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths

  Face.isMouthInverted = false;
  Face.isMouthExtended = false;
  Face.smileMouth = function() {
    Face.isMouthInverted = false;
    Face.isMouthExtended = true;
    Face.drawMouth();
  }

  Face.neutralMouth = function() {
    Face.isMouthInverted = false;
    Face.isMouthExtended = false;
    Face.drawMouth();
  }

  Face.sadMouth = function() {
    Face.isMouthInverted = true;
    Face.isMouthExtended = true;
    Face.drawMouth();
  }

  Face.drawMouth = function() {
    var svg = document.getElementById("faceSVG");
    var svgHeight = svg.clientHeight;
    var svgWidth = svg.clientWidth;

    /* Draw the rectangle first */
    // var rect = document.createElementNS(svgNS, "rect");
    // rect.setAttribute("x", (50-Face.parameters.mouthWPercent/2) + "%");
    // rect.setAttribute("y", Face.parameters.mouthYPercent + "%");
    // rect.setAttribute("width", Face.parameters.mouthWPercent + "%");
    // rect.setAttribute("height", Face.parameters.mouthH);
    // rect.setAttribute("rx", 10);
    // rect.setAttribute("ry", 10);
    // rect.setAttribute("fill", Face.parameters.mouthColor);  

    var path = document.getElementById("mouth");
    var mouthExists = (path != null);
    if (!mouthExists) {
      path = document.createElementNS(svgNS, "path");
    }

    var mouthX = svgWidth * 0.5;
    var mouthY = svgHeight * Face.parameters.mouthYPercent / 100.0;
    var mouthHeight = Face.parameters.mouthH;
    var mouthTop = mouthY-mouthHeight/2;
    var mouthWidth = svgWidth * Face.parameters.mouthWPercent/100.0;

    var updatedMouthHeight = mouthHeight;
    var updatedMouthWidth = mouthWidth;
    if (Face.isMouthExtended) {
      updatedMouthHeight += 20;
      updatedMouthWidth += 10;
    }
    if (Face.isMouthInverted)
      updatedMouthHeight = -updatedMouthHeight;

    path.setAttribute("d", "M" + (mouthX - updatedMouthWidth) + " " + mouthTop +
                      " C "+ (mouthX - updatedMouthWidth + Face.parameters.mouthSlope) + " " + (mouthTop+updatedMouthHeight) +
                      ", " + (mouthX + updatedMouthWidth - Face.parameters.mouthSlope) + " " + (mouthTop+updatedMouthHeight) + 
                      ", " + (mouthX + updatedMouthWidth) + " " + mouthTop);


    path.setAttribute("stroke-width", Face.parameters.mouthStrokeWidth);
    path.setAttribute("stroke", Face.parameters.mouthColor);
    path.setAttribute("fill", "transparent");
    path.setAttribute("id", "mouth");

    if (!mouthExists)
      svg.appendChild(path);
  }

  Face.parameters = {
    eyeOutlineThickness: 2,
    eyeShapeRatio: 2.0,
    hasReflection: true,
    hasInnerPupil: false,
    hasEyelid: true,
    hasBlinking: true,
    backgroundColor:"#E3B265",
    eyeCenterDistPercent:25,
    eyeYPercent:50,
    isLEDEyes:0,
    /* V1 style eyes*/
    eyeOuterRadiusPercent:15,
    eyeInnerRadiusPercent:5,
    eyeOuterColor:"#FFD",
    eyeInnerColor:"#000",
    eyelidOffset: 10,
    backgroundColor:"#000",
    hasEyeLines:1,
    eyeLineStrokeWidth:10,
    hasPupil:1,
    eyePupilRadius: 10,
    eyePupilRadiusPercent: 2,
    eyePupilColor: "#AAAAAA",
    pupilXOffset: 1,
    pupilYOffset: 1,
    /* V2 style eyes*/
    eyeWPercent:30,
    eyeHPercent:50,
    betweenCircleDistancePercent:15,
    eyeBackgroundColor:"#222",
    eyeLEDOffColor:"#444",
    eyeLEDOnColor:"#86CCEE",
    nCircles:9,
    hasText: 0,
    text:"Hello, my name is EMAR",
    bubbleHeight: 50,
    bubbleColor: "#666666",
    fontSize: 25,
    fontColor: "#222222",
    avgBlinkTime: 9000,
    avgLookaroundTime: 4000,
    minLookaroundTime: 2000,
    /* Mouth */
    hasMouth: 1,
    mouthWPercent: 10,
    mouthYPercent: 80,
    mouthH: 25,
    mouthR: 5,
    mouthColor: "#222222",
    mouthStrokeWidth: 10,
    mouthSlope: 20,
    hasNose: 0,
    noseRPercent: 2,
    noseYPercent: 65,
    noseColor: "#222222",
  }
  
  /* Callback function for when the parameter database is updated*/
  Face.updateParameters = function(newParameters) {

    console.log("updateParameters");
    for (var i=0; i<Object.keys(newParameters).length; i++)
    {
      var key = Object.keys(newParameters)[i];
      var param = newParameters[key];
      if (param.type == "number" || param.type == "boolean") {
        Face.parameters[key] = Number(newParameters[key].current);
      }
      else {
        Face.parameters[key] = String(newParameters[key].current);
      }
    }
    Face.draw();
  }

  Face.updateState = function(state) {
    console.log("updateState");
    currentState = state;
  }
  
  // FRONT END STUFF:

//   function updateUserFaceList(snapshot) {
//     var database = snapshot.val();

//     var myFaceList = document.getElementById("myFaceList");
//     myFaceList.innerHTML = "";

//     allFaceIndexes = {};

//     if (uid !== null) {
//       var userData = database.users[uid];

//       nMyConfigs = 0;
//       if (userData.faces != null && userData.faces != undefined)
//         nMyConfigs = userData.faces.length;

//       nConfigs = nMyConfigs;
//       currentConfig = userData.currentFace;

//       if (nMyConfigs > 0) {
//         for (var i = 0; i < nMyConfigs; i++) {
//           allFaceIndexes[i] = { user: uid, index: i };

//           var thumbHTML = "<a>";
//           var imgSrc = getThumbImage(snapshot, uid, i);
//           if (i == currentConfig)
//             thumbHTML += "<img  class='face-thumb-selected' ";
//           else
//             thumbHTML += "<img  class='face-thumb' ";

//           thumbHTML += "src='" + imgSrc + "' ";
//           thumbHTML += "onclick='selectedFaceChanged(" + i + ")'>";
//           thumbHTML += "</a>";

//           myFaceList.innerHTML += thumbHTML;

//         }
//       }

//     } else {
//       console.log("You are not signed in.");
//     }

//     var allUserKeys = Object.keys(database.users);

//     var otherFaceList = document.getElementById("otherFaceList");
//     if (otherFaceList != undefined)
//       otherFaceList.innerHTML = "";

//     for (var j = 0; j < allUserKeys.length; j++) {
//       var id = allUserKeys[j];
//       if (id != uid) {
//         var userData = database.users[id];

//         var nUserConfigs = 0;
//         if (userData.faces != null && userData.faces != undefined)
//           nUserConfigs = userData.faces.length;

//         if (nUserConfigs > 0) {
//           for (i = 0; i < nUserConfigs; i++) {
//             allFaceIndexes[i + nConfigs] = { user: id, index: i };

//             thumbHTML = "<a>";
//             imgSrc = getThumbImage(snapshot, id, i);

//             if ((i == 0 && nConfigs == 0) || i + nConfigs == currentConfig)
//               thumbHTML += "<img  class='face-thumb-selected' ";
//             else
//               thumbHTML += "<img  class='face-thumb' ";

//             thumbHTML += "src='" + imgSrc + "' ";
//             thumbHTML += "onclick='selectedFaceChanged(" + (i + nConfigs) + ")'>";
//             thumbHTML += "</a>";

//             if (otherFaceList != undefined)
//               otherFaceList.innerHTML += thumbHTML;
//             else
//               myFaceList.innerHTML += thumbHTML;

//           }
//           nConfigs += nUserConfigs;
//         }
//       }
//     }
//   }

//   var robotFaces = [];
//   function updateRobotFaceList(snapshot, isSetup) {
//     var robotFaceList = document.getElementById("robotFaceList");
//     if (robotFaceList != undefined)
//       robotFaceList.innerHTML = "";

//     var database = snapshot.val();
//     var robotData = database.robots[currentRobot];

//     if (robotData.customAPI.states != undefined)
//       robotFaces = robotData.customAPI.states.faces;

//     for (var i=0; i<robotFaces.length; i++) {
//       var thumbImg = ""; 
//       var thumbHTML = "";
//       var faceParameters = robotFaces[i];
//       if (faceParameters !== null)
//         thumbImg = faceParameters.thumb;

//       if (isSetup)
//         thumbHTML += "<div class='deletable-thumb'>";
//       else
//         thumbHTML += "<a>";

//       if (!isSetup && i == robotData.state.currentFace)
//         thumbHTML += "<div class='thumb-and-name'><img  class='face-thumb-selected' ";
//       else
//         thumbHTML += "<div class='thumb-and-name'><img  class='face-thumb' ";

//       thumbHTML += "src='" + thumbImg;

//       if (!isSetup)
//         thumbHTML += "' onclick='currentFaceChanged(" + i + ")";
//       thumbHTML += "' > <p>" + faceParameters.name + "</p> </div>";

//       if (isSetup)
//         thumbHTML += "<div class='delete-x-button'><button type='button' onclick='removeRobotFace(" + i + ")' class='btn btn-secondary btn-circle-sm'>X</button></div>";

//       if (isSetup)
//         thumbHTML += "</div>";
//       else
//         thumbHTML += "</a>";

//       robotFaceList.innerHTML += thumbHTML;
//     }
//   }

//   /*
//   * When a different face is selected by a user, change the corresponding parameter in the database
//   */
//   function selectedFaceChanged(newFaceIndex) {
//     if (uid !== null) {
//       var dir = "users/" + uid;
//       var dbRef = firebase.database().ref(dir);
//       dbRef.update({ currentFace: newFaceIndex });
//       hasNewParams = true;
//     }
//   }

//   function currentFaceChanged(newFaceIndex) {
//     if (uid !== null) {
//       var dir = "robots/" + currentRobot + "/state";
//       var dbRef = firebase.database().ref(dir);
//       dbRef.update({ currentFace: newFaceIndex });
//       hasNewParams = true;
//     }
//   }

//   function faceRenamed() {
//     if (uid !== null) {
//       var user = allFaceIndexes[currentConfig].user;
//       var index = allFaceIndexes[currentConfig].index;
//       var dir = "users/" + user;
//       var dbRef = firebase.database().ref(dir + "/faces/" + index + "/");
//       var newParamObj = {};
//       var faceName = document.getElementById("faceName");
//       newParamObj.name = faceName.value;
//       dbRef.update(newParamObj);
//     }
//   }

//   // Update
//   function updateFaceThumb(user, id) {
//     var svg = document.getElementById("faceSVG");
//     var imgsrc = svg2img(svg);
//     var dbRef = firebase.database().ref('users/' + user + '/faces/' + id + '/');
//     var newThumb = {thumb:imgsrc};
//     dbRef.update(newThumb);
//   }

//   function getThumbImage(snapshot, user, id) {
//     var database = snapshot.val();
//     var userData = database.users[user];
//     var faceParameters = userData.faces[id];
//     var thumbImg = ""; 
//     if (faceParameters !== null && faceParameters !== undefined)
//       thumbImg = faceParameters.thumb;
//     return thumbImg;
//   }

//   function svg2img(svg){
//       var xml = new XMLSerializer().serializeToString(svg);
//       var svg64 = btoa(xml); //for utf8: btoa(unescape(encodeURIComponent(xml)))
//       var b64start = 'data:image/svg+xml;base64,';
//       var image64 = b64start + svg64;
//       return image64;
//   }

//   function addPresetFace() {
//     var dir = 'robots/' + (currentRobot) + "/customAPI/state/";
  //   var user = allFaceIndexes[currentConfig].user;
  //   var index = allFaceIndexes[currentConfig].index;
  //   faces.push({user:user, index:index});
  //   var dbRef = firebase.database().ref(dir);
  //   dbRef.update({presetFaces:faces});
  // }
  
}
