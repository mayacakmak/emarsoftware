/*
* Face class for creating the robot face
*/
function Eyes() {

  Eyes.blinkTimeoutHandle = null;
  Eyes.lookTimeoutHandle = null;
  Eyes.isLookingAround = false;

  Eyes.draw = function() {
    if (Eyes.blinkTimeoutHandle !== null) {
      window.clearTimeout(Eyes.blinkTimeoutHandle);
    }
    
    if (Eyes.lookTimeoutHandle !== null) {
      window.clearTimeout(Eyes.lookTimeoutHandle);
    }

    Eyes.drawV1Eye(50 - Face.parameters.eyeCenterDistPercent, "Left");
    Eyes.drawV1Eye(50 + Face.parameters.eyeCenterDistPercent, "Right");

    if (Eyes.isLookingAround) {
      Eyes.startLookAround();
    }
    else {
      Eyes.stopLookAround();
      Eyes.lookAt();
    }

    var nextBlink = Math.random() * Face.parameters.avgBlinkTime;
    Eyes.blinkTimeoutHandle = window.setTimeout(Eyes.blink, nextBlink);
  }

  Eyes.startBlink = function(name) {
    var anim = document.getElementById(name);
    if (anim != undefined)
      anim.beginElement();
  }

  Eyes.blink = function() {
    if (Face.parameters.hasBlinking) {
      Eyes.startBlink("closeEyeLeft");
      Eyes.startBlink("closeEyeRight");
      Eyes.startBlink("closeEyeOuterLeft");
      Eyes.startBlink("closeEyeOuterRight");
      Eyes.startBlink("closeEyeInnerLeft");
      Eyes.startBlink("closeEyeInnerRight");
      Eyes.startBlink("closeEyePupilRight");
      Eyes.startBlink("closeEyePupilLeft");
      Eyes.startBlink("closeEyeReflectionRight");
      Eyes.startBlink("closeEyeReflectionLeft");
      var nextBlink = Math.random() * Face.parameters.avgBlinkTime;
      if (Eyes.blinkTimeoutHandle != null)
        window.clearTimeout(Eyes.blinkTimeoutHandle);
      Eyes.blinkTimeoutHandle = window.setTimeout(Eyes.blink, nextBlink);    
    }
  }

  Eyes.getOuterRadiusPercent = function() {
    return Math.min(
      Face.parameters.eyeOuterRadiusPercent,
      Face.parameters.eyeOuterRadiusPercent*Face.parameters.eyeShapeRatio);
  }

  Eyes.getOuterRadius = function() {
    var svg = document.getElementById("faceSVG");
    var svgWidth = svg.clientWidth;
    return Math.round(svgWidth * Eyes.getOuterRadiusPercent() / 100.0);
  }

  Eyes.getInnerRadiusPercent = function() {
    return Math.round(Face.parameters.eyeInnerRadiusPercent * Eyes.getOuterRadiusPercent() * 0.01);
  }

  Eyes.getPupilRadiusPercent = function() {
    return Math.round(Face.parameters.eyePupilRadiusPercent * Eyes.getInnerRadiusPercent() * 0.01);
  }

  Eyes.lookAngles = {"right": 0, "left": Math.PI, "down": 0.5*Math.PI, "up":1.5*Math.PI};
  // TODO: how does this get set?
  Eyes.currentLookAt = "none";

  Eyes.lookAt = function() {
    if (Eyes.currentLookAt == "none") {
      Eyes.setEyeOffset(0,0);
    }
    else {
      var offsetRadius = 0.99*(Eyes.getOuterRadiusPercent() -
                               Eyes.getInnerRadiusPercent());
      var nextAngle = Eyes.lookAngles[Eyes.currentLookAt];
      var xOffset = Math.round(offsetRadius * Math.cos(nextAngle));
      var yOffset = Math.round(offsetRadius * Math.sin(nextAngle));
      Eyes.setEyeOffset(xOffset, yOffset);
    }
  }

  Eyes.lookAround = function() {
    var nextXOffset = 0;
    var nextYOffset = 0;

    if (Math.random() < 0.5) {
      var nextOffsetRadius =
        Math.random() * (Eyes.getOuterRadiusPercent() - Eyes.getInnerRadiusPercent());
      var nextAngle = Math.random() * Math.PI * 2;
      nextXOffset = Math.round(nextOffsetRadius * Math.sin(nextAngle));
      nextYOffset = Math.round(nextOffsetRadius * Math.cos(nextAngle));
    }
    Eyes.setEyeOffset(nextXOffset, nextYOffset);
    if (
      Eyes.isLookingAround) {
      Eyes.startLookAround();
    }
  }

  Eyes.startLookAround = function() {
    var nextLookaround = Face.parameters.minLookaroundTime + Math.random() * Face.parameters.avgLookaroundTime;
    Eyes.lookTimeoutHandle = window.setTimeout(Eyes.lookAround, nextLookaround);
  }

  Eyes.stopLookAround = function() {
    window.clearTimeout(Eyes.lookTimeoutHandle);
    //TODO: Let the database know
  }

  Eyes.setEyeOffset = function(xOffset, yOffset) {
    var reflectionOffset = Eyes.getPupilRadiusPercent() - 3;
    var svg = document.getElementById("faceSVG");
    var svgHeight = svg.clientHeight;
    var svgWidth = svg.clientWidth;
    yOffset = yOffset*Face.parameters.eyeShapeRatio*svgWidth/svgHeight;

    Eyes.setEyeCircleOffset("InnerRight", xOffset, yOffset, false);
    Eyes.setEyeCircleOffset("InnerLeft", xOffset, yOffset, true);
    Eyes.setEyeCircleOffset("PupilRight", xOffset, yOffset, false);
    Eyes.setEyeCircleOffset("PupilLeft", xOffset, yOffset, true);

    var yReflectionOffset = reflectionOffset*Face.parameters.eyeShapeRatio*svgWidth/svgHeight;
    Eyes.setEyeCircleOffset("ReflectionRight", xOffset+reflectionOffset, yOffset-yReflectionOffset, false);
    Eyes.setEyeCircleOffset("ReflectionLeft", xOffset+reflectionOffset, yOffset-yReflectionOffset, true);
  }

  Eyes.setEyeCircleOffset = function(circleName, xOffset, yOffset, isLeft) {
    var circle = document.getElementById(circleName);
    if (circle != undefined) {
      if (isLeft)
        circle.setAttribute("cx", 50 - Face.parameters.eyeCenterDistPercent + xOffset + "%");
      else 
        circle.setAttribute("cx", 50 + Face.parameters.eyeCenterDistPercent + xOffset + "%");
      circle.setAttribute("cy", Face.parameters.eyeYPercent + yOffset + "%");
    }
  }

  Eyes.drawV1Eye = function(eyeXPercent, name) {
    // Draw the eye outline circle
    Eyes.drawEyeCircleWithRadius(
      eyeXPercent,
      Face.parameters.eyeYPercent,
      Eyes.getOuterRadius() + Face.parameters.eyeOutlineThickness,
      Face.parameters.eyeShapeRatio,
      Face.parameters.eyeOutlineColor,
      name,
      true,
      false
    );

    if (Face.parameters.hasEyeLines)
      Eyes.drawEyeLines(
        eyeXPercent,
        Face.parameters.eyeYPercent,
        Face.parameters.eyeOuterRadiusPercent,
        Face.parameters.backgroundColor,
        Face.parameters.eyeLineStrokeWidth
      );

    // Draw the outer circle
    Eyes.drawEyeCircle(
      eyeXPercent,
      Face.parameters.eyeYPercent,
      Face.parameters.eyeOuterRadiusPercent,
      Face.parameters.eyeShapeRatio,
      Face.parameters.eyeOuterColor,
      "Outer" + name,
      true,
      true
    );

     // Draw the inner circle
    Eyes.drawEyeCircle(
      eyeXPercent,
      Face.parameters.eyeYPercent,
      Math.round(Eyes.getInnerRadiusPercent()),
      1.0,
      Face.parameters.eyeInnerColor,
      "Inner" + name,
      true,
      false
    );

     // Draw the pupil
    if (Face.parameters.hasPupil)
      Eyes.drawEyeCircle(
        eyeXPercent,
        Face.parameters.eyeYPercent,
        Eyes.getPupilRadiusPercent(),
        1.0,
        Face.parameters.eyePupilColor,
        "Pupil" + name,
        true,
        true
      );

    var reflectionOffset = Eyes.getPupilRadiusPercent() - 3;
    if (Face.parameters.hasReflection)
      Eyes.drawEyeCircle(
        eyeXPercent + reflectionOffset,
        Face.parameters.eyeYPercent - reflectionOffset,
        1,
        1.0,
        "#ccc",
        "Reflection" + name,
        true,
        true
      );

     // Draw the pupil
     if (Face.parameters.hasEyelid)
      Eyes.drawEyeCircle(
        eyeXPercent,
        Face.parameters.eyeYPercent-Face.parameters.eyelidOffset,
        Face.parameters.eyeOuterRadiusPercent*1.5,
        0.5,
        Face.parameters.backgroundColor,
        "Eyelid" + name,
        false,
        false
      );

  }

  Eyes.drawEyeCircle = function(
    xPercent,
    yPercent,
    radiusPercent,
    eyeShapeRatio,
    color,
    name,
    isBlinking,
    isLooking
  ) {
    var svg = document.getElementById("faceSVG");
    var svgWidth = svg.clientWidth;
    var radius = Math.round(svgWidth * radiusPercent / 100.0);
    Eyes.drawEyeCircleWithRadius(
      xPercent,
      yPercent,
      radius,
      eyeShapeRatio,
      color,
      name,
      isBlinking,
      isLooking
    );
  }

  Eyes.drawEyeCircleWithRadius = function(
    xPercent,
    yPercent,
    radius,
    eyeShapeRatio,
    color,
    name,
    isBlinking,
    isLooking
  ) {
    var svg = document.getElementById("faceSVG");
    var circle = document.createElementNS(svgNS, "ellipse");
    var svgHeight = svg.clientHeight;
    var svgWidth = svg.clientWidth;

    circle.setAttribute("id", name);
    circle.setAttribute("cx", xPercent + "%");
    circle.setAttribute("cy", yPercent + "%");
    circle.setAttribute("rx", radius);
    circle.setAttribute("ry", Math.round(radius*eyeShapeRatio));
    circle.setAttribute("fill", color);

    if (isBlinking) {
      var blinkClose = document.createElementNS(svgNS, "animate");
      blinkClose.setAttribute("id", "closeEye" + name);
      blinkClose.setAttribute("attributeName", "ry");
      blinkClose.setAttribute("from", Math.round(radius*eyeShapeRatio));
      blinkClose.setAttribute("to", "0");
      blinkClose.setAttribute("dur", "0.05s");
      circle.appendChild(blinkClose);

      var blinkOpen = document.createElementNS(svgNS, "animate");
      blinkOpen.setAttribute("id", "openEye" + name);
      blinkOpen.setAttribute("attributeName", "ry");
      blinkOpen.setAttribute("from", "0");
      blinkOpen.setAttribute("to", Math.round(radius*eyeShapeRatio));
      blinkOpen.setAttribute("dur", "0.1s");
      blinkOpen.setAttribute("begin", "closeEye" + name + ".end");
      circle.appendChild(blinkOpen);
    }
    svg.appendChild(circle);
  }

  Eyes.drawEyeLines = function(xPercent, yPercent, radiusPercent, color, strokeWidth) {
    var svg = document.getElementById("faceSVG");
    var svgHeight = svg.clientHeight;
    var svgWidth = svg.clientWidth;
    var radius = Math.round(svgWidth * radiusPercent / 100.0);
    var x = Math.round(svgWidth * xPercent / 100.0);
    var y = Math.round(svgHeight * yPercent / 100.0);
    Eyes.drawLine(x - radius, y - radius, x + radius, y + radius, color, strokeWidth);
    Eyes.drawLine(x - radius, y, x + radius, y, color, strokeWidth);
    Eyes.drawLine(x + radius, y - radius, x - radius, y + radius, color, strokeWidth);
    Eyes.drawLine(x, y - radius, x, y + radius, color, strokeWidth);
  }

  Eyes.drawLine = function(x1, y1, x2, y2, color, strokeWidth) {
    var svg = document.getElementById("faceSVG");
    var line = document.createElementNS(svgNS, "line");
    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);
    line.style.stroke = color;
    line.style.strokeWidth = strokeWidth;
    svg.appendChild(line);
  }
}
