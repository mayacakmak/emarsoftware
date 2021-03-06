var progress = 0;

/*
 * Belly class for creating the user interface on the robot's belly tablet
 */
function Belly(robotId, scale, resizeAxis) {
  Belly.robotId = robotId;
  Belly.currentScreen = -1;
  Belly.bellyScreens = null;
  Belly.scale = scale;
  Belly.resizeAxis = resizeAxis;

  Belly.updateRobotBelly = function (snapshot) {
    var robotState = snapshot.val();
    var bellyHTML = '';
    var len = Belly.bellyScreens.length;

    let newScreenIndex = robotState.currentBellyScreen;

    // Make sure it is a valid screen index
    if (newScreenIndex != undefined && Belly.bellyScreens != null) {
      newScreenIndex = Number(robotState.currentBellyScreen);
      progress = (newScreenIndex * 100) / len;
      if (newScreenIndex >= 0 && newScreenIndex < Belly.bellyScreens.length) {
        bellyHTML += renderBellyScreen(newScreenIndex, Belly);
      } else {
        console.log('Screen index out of range.');
      }
    } else {
      console.log('Screen index is not valid.');
      console.log('newScreenIndex: ' + newScreenIndex);
      console.log(Belly.bellyScreens);
      console.log(robotState);
    }
  };

  Belly.infoButtonClicked = function (screenID) {
    if (
      Belly.bellyScreens[screenID].navButtonList &&
      Belly.bellyScreens[screenID].navButtonList.faqButton &&
      Belly.bellyScreens[screenID].navButtonList.faqButton.content
    ) {
      document.getElementById('modalBody').innerHTML =
        Belly.bellyScreens[screenID].navButtonList.faqButton.content;
      $('#faqModal').modal('show');
    }
  };

  Belly.progressBarClicked = function (screenID) {
    if (
      Belly.bellyScreens[screenID].navButtonList &&
      Belly.bellyScreens[screenID].navButtonList.progressBar &&
      Belly.bellyScreens[screenID].navButtonList.progressBar.content
    ) {
      window.location.href = 'index.html'; 
    }
  };

  Belly.exitButtonClicked = function (screenID) {
    if (
      Belly.bellyScreens[screenID].navButtonList &&
      Belly.bellyScreens[screenID].navButtonList.exitButton
    ) {
      window.location.href = 'index.html';
    }
  };

  Belly.backButtonClicked = function (screenID) {
    if (
      Belly.bellyScreens[screenID].navButtonList &&
      Belly.bellyScreens[screenID].navButtonList.backButton
    ) {
      var date = new Date();
      Belly.bellyScreens[screenID].navButtonList.backButton.lastPressed = date.getTime();
      var dir = 'robots/' + Belly.robotId + '/customAPI/inputs/';
      var dbRef = firebase.database().ref(dir);
      var updates = { bellyScreens: Belly.bellyScreens };
      dbRef.update(updates);
    }
  };

  Belly.bellyInputReceived = function (target, screenID, itemID) {
    // TODO: clean up the the non "list" parts of database once backwards compatibility issues are gone
    var date = new Date();
    if (target.name == 'slider') {
      Belly.bellyScreens[screenID].slider.current = target.value;
      Belly.bellyScreens[screenID].slider.lastChanged = date.getTime();
    }

    if (target.name == 'at') {
      Belly.bellyScreens[screenID].at.current = target.value;
      Belly.bellyScreens[screenID].at.lastChanged = date.getTime();
    }

    if (target.name == 'contact') {
      Belly.bellyScreens[screenID].contact.current = target.value;
      Belly.bellyScreens[screenID].contact.lastChanged = date.getTime();
    }

    if (target.name == 'asterisk') {
      Belly.bellyScreens[screenID].asterisk.current = target.value;
      Belly.bellyScreens[screenID].asterisk.lastChanged = date.getTime();
    }

    if (target.name == 'book') {
      Belly.bellyScreens[screenID].book.current = target.value;
      Belly.bellyScreens[screenID].book.lastChanged = date.getTime();
    }

    if (target.name == 'victory') {
      Belly.bellyScreens[screenID].victory.current = target.value;
      Belly.bellyScreens[screenID].victory.lastChanged = date.getTime();
    }

    if (target.name == 'hand') {
      Belly.bellyScreens[screenID].hand.current = target.value;
      Belly.bellyScreens[screenID].hand.lastChanged = date.getTime();
    }

    if (target.name == 'up') {
      Belly.bellyScreens[screenID].up.current = target.value;
      Belly.bellyScreens[screenID].up.lastChanged = date.getTime();
    }

    if (target.name == 'down') {
      Belly.bellyScreens[screenID].down.current = target.value;
      Belly.bellyScreens[screenID].down.lastChanged = date.getTime();
    }

    if (target.name == 'left') {
      Belly.bellyScreens[screenID].left.current = target.value;
      Belly.bellyScreens[screenID].left.lastChanged = date.getTime();
    }

    if (target.name == 'right') {
      Belly.bellyScreens[screenID].right.current = target.value;
      Belly.bellyScreens[screenID].right.lastChanged = date.getTime();
    }

    if (target.name == 'checkbox') {
      Belly.bellyScreens[screenID].checkboxes.list[itemID].value =
        target.checked;
      Belly.bellyScreens[screenID].checkboxes.list[
        itemID
      ].lastChanged = date.getTime();
    }

    if (target.name == 'button') {
      if (Belly.bellyScreens[screenID].buttons.list[itemID].link) {
        window.location.href =
          Belly.bellyScreens[screenID].buttons.list[itemID].link;
      } else {
        Belly.bellyScreens[screenID].buttons.list[
          itemID
        ].lastPressed = date.getTime();
      }
    }

    if (target.name == 'imageButton') {
      Belly.bellyScreens[screenID].imageButtons.list[
        itemID
      ].lastPressed = date.getTime();
    }

    if (target.name == 'textInput') {
      Belly.bellyScreens[screenID].textInput.value = document.getElementById(
        target.id
      ).value;
    }

    var dir = 'robots/' + Belly.robotId + '/customAPI/inputs/';
    var dbRef = firebase.database().ref(dir);
    var updates = { bellyScreens: Belly.bellyScreens };
    dbRef.update(updates);
  };
}

function renderBellyScreen(newScreenIndex, Belly, screenDivId = 'screenDiv') {
  var bellyHTML = '<div ';
  if (screenDivId !== 'screenDiv') {
    bellyHTML += " style='pointer-events: none;'>";
  } else {
    bellyHTML += '>';
  }
  // Make sure it is a different screen from the currently displayed one
  if (newScreenIndex != Belly.currentScreen) {
    Belly.currentScreen = newScreenIndex;
    var screen = Belly.bellyScreens[Belly.currentScreen];

    var screenDiv = document.getElementById(screenDivId);
    // Set screen color
    if (screen.backgroundColor) {
      screenDiv.style.backgroundColor = screen.backgroundColor;
    }

    /*********
           Navigation Buttons
          *********/
    if (screen.navButtonList) {
      // bellyHTML += `
      //   <div style="position: absolute; top: 0; right: 0; padding-right: 10px; padding-top: 10px;">
      //     <button type="button" class="btn btn-info" onclick="Belly.infoButtonClicked(
      //   `
      //   + Belly.currentScreen +
      //   `
      //     )">
      //   `
      //   + (screen.informationButton.label ? screen.informationButton.label : "?") +
      //   `
      //     </button>
      //   </div>
      // `;
      bellyHTML += `<div style="position: absolute; top: 0; right: 0; padding-right: 6px; padding-top: 6px;">`;
      if (
        screen.navButtonList.backButton &&
        screen.navButtonList.backButton.isShown
      ) {
        bellyHTML +=
          `
        <button type="button" class="btn btn-info" onclick="Belly.backButtonClicked(
         ` +
          Belly.currentScreen +
          `
          )"><img src='https://firebasestorage.googleapis.com/v0/b/emar-database.appspot.com/o/images%2Fnoun_back_2342730.png?alt=media&token=1f7d46d8-3efb-4835-b204-fb54f677ff64'
          style='width: 20px; height: 20px;'/></button>
        `;
      }
      if (
        screen.navButtonList.progressBar &&
        screen.navButtonList.progressBar.isShown
      ) {
        bellyHTML +=
          `
        <button type="button" class="btn btn-info" onclick="Belly.progressBarClicked(
         ` +
          Belly.currentScreen +
          `
          )"><progress id="file" value=` + progress + ` max="100"></progress></button>
        `;
      }
      if (
        screen.navButtonList.faqButton &&
        screen.navButtonList.faqButton.isShown
      ) {
        bellyHTML +=
          `
        <button type="button" class="btn btn-info" onclick="Belly.infoButtonClicked(
         ` +
          Belly.currentScreen +
          `
          )"><img src='https://firebasestorage.googleapis.com/v0/b/emar-database.appspot.com/o/images%2Fnoun_Question_727762.png?alt=media&token=f511b8c6-347b-4f72-bd4e-03f6098e7dc0'
          style='width: 20px; height: 20px;'/></button>
        `;
      }
      if (
        screen.navButtonList.exitButton &&
        screen.navButtonList.exitButton.isShown
      ) {
        bellyHTML +=
          `
        <button type="button" class="btn btn-info" onclick="Belly.exitButtonClicked(
         ` +
          Belly.currentScreen +
          `
          )"><img src='https://firebasestorage.googleapis.com/v0/b/emar-database.appspot.com/o/images%2Fnoun_Power_3595741.png?alt=media&token=dad6aa73-1db3-4168-be23-6cbf7a3bbfed'
          style='width: 20px; height: 20px;'/></button>
        `;
      }
      bellyHTML += `</div>`;
    }

    /*********
           Text instructions
          *********/
    if (screen.instructionLarge.isShown) {
      var largeInstruction = screen.instructionLarge.text;
      var fontFamily = ((fontFamily) => {
        switch (fontFamily) {
          case 'Courier':
            return 'font-family: "Lucida Console", Courier, monospace;';
          case 'Times':
            return 'font-family: "Times New Roman", Times, serif;';
          default:
            return 'font-family: Arial, Helvetica, sans-serif;';
        }
      })(screen.instructionLarge.fontFamily);
      bellyHTML +=
        "<div class='screen-element instruction-large' style='z-index: 2; " +
        fontFamily +
        "'>" +
        largeInstruction +
        '</div> ';
    }

    if (screen.instructionSmall.isShown) {
      var smallInstruction = screen.instructionSmall.text;
      var fontFamily = ((fontFamily) => {
        switch (fontFamily) {
          case 'Courier':
            return 'font-family: "Lucida Console", Courier, monospace;';
          case 'Times':
            return 'font-family: "Times New Roman", Times, serif;';
          default:
            return 'font-family: Arial, Helvetica, sans-serif;';
        }
      })(screen.instructionSmall.fontFamily);
      bellyHTML +=
        "<div class='screen-element instruction-small' style='z-index: 2; " +
        fontFamily +
        "'>" +
        smallInstruction +
        '</div>';
    }

    /*********
           Images
          *********/
    if (screen.images && screen.images.isShown && screen.images.list) {
      bellyHTML += "<div style='flex-direction: row'>";
      screen.images.list.forEach((element) => {
        console.log(element);
        var position = '';
        if (
          element.location.position &&
          element.location.position === 'absolute'
        ) {
          position += 'position: absolute;';
          if (element.location.top !== undefined) {
            position += 'top: ' + element.location.top + '; ';
          }
          if (element.location.bottom !== undefined) {
            position += 'bottom: ' + element.location.bottom + '; ';
          }
          if (element.location.left !== undefined) {
            position += 'left: ' + element.location.left + '; ';
          }
          if (element.location.right !== undefined) {
            position += 'right: ' + element.location.right + '; ';
          }
        } else {
          position += 'position: relative;';
        }
        position += "'";
        bellyHTML +=
          "<img src='" +
          element.path +
          "' style='border: none; " +
          position +
          "width='" +
          element.size.x +
          "' height='" +
          element.size.y +
          "'/>";
      });
      bellyHTML += '</div>';
    }

    /*********
           Slider
          *********/
    if (screen.slider.isShown) {
      var sliderMin = screen.slider.min;
//       var sliderCurrent = screen.slider.current;
      // Start slider at middle
      var sliderCurrent = (screen.slider.max + screen.slider.min) / 2;
      var sliderMax = screen.slider.max;
      bellyHTML += "<div class='screen-element mt-4'  style='z-index: 2'>";
      bellyHTML +=
        "<div class='min-value screen-item'  style='z-index: 2'>" +
        sliderMin +
        '</div>';
      bellyHTML +=
        "<input type='range' class='screen-slider' name='slider'" +
        " onchange='Belly.bellyInputReceived(this, " +
        Belly.currentScreen +
        ")'" +
        " value='" +
        sliderCurrent +
        "' min='0' max='100'>";
      bellyHTML += "<div class='max-value screen-item'>" + sliderMax + '</div>';
      bellyHTML += '</div>';
    }

    /*********
     at
    *********/
    if (screen.at && screen.at.isShown) {
      var atCurrent = screen.at.current;
      bellyHTML += "<div class='screen-element mt-4'>";
      bellyHTML += "<div class='value screen-item'>" + atCurrent + '</div>';
      bellyHTML += '</div>';
    }

    /*********
     contact
    *********/
   if (screen.contact && screen.contact.isShown) {
      var contactCurrent = screen.contact.current;
      bellyHTML += "<div class='screen-element mt-4'>";
      bellyHTML += "<div class='value screen-item'>" + contactCurrent + '</div>';
      bellyHTML += '</div>';
    }

    /*********
     asterisk
    *********/
   if (screen.asterisk && screen.asterisk.isShown) {
      var asteriskCurrent = screen.asterisk.current;
      bellyHTML += "<div class='screen-element mt-4'>";
      bellyHTML += "<div class='value screen-item'>" + asteriskCurrent + '</div>';
      bellyHTML += '</div>';
    }

    /*********
     book
    *********/
   if (screen.book && screen.book.isShown) {
      var bookCurrent = screen.book.current;
      bellyHTML += "<div class='screen-element mt-4'>";
      bellyHTML += "<div class='value screen-item'>" + bookCurrent + '</div>';
      bellyHTML += '</div>';
    }

    /*********
     victory
    *********/
   if (screen.victory && screen.victory.isShown) {
    var victoryCurrent = screen.victory.current;
      bellyHTML += "<div class='screen-element mt-4'>";
      bellyHTML += "<div class='value screen-item'>" + victoryCurrent + '</div>';
      bellyHTML += '</div>';
    }

    /*********
     hand
    *********/
   if (screen.hand && screen.hand.isShown) {
    var handCurrent = screen.hand.current;
      bellyHTML += "<div class='screen-element mt-4'>";
      bellyHTML += "<div class='value screen-item'>" + handCurrent + '</div>';
      bellyHTML += '</div>';
    }

    /*********
     up
    *********/
   if (screen.up && screen.up.isShown) {
    var upCurrent = screen.up.current;
      bellyHTML += "<div class='screen-element mt-4'>";
      bellyHTML += "<div class='value screen-item'>" + upCurrent + '</div>';
      bellyHTML += '</div>';
    }

    /*********
     down
    *********/
   if (screen.down && screen.down.isShown) {
    var downCurrent = screen.down.current;
      bellyHTML += "<div class='screen-element mt-4'>";
      bellyHTML += "<div class='value screen-item'>" + downCurrent + '</div>';
      bellyHTML += '</div>';
    }

  /*********
     left
    *********/
   if (screen.left && screen.left.isShown) {
    var leftCurrent = screen.left.current;
      bellyHTML += "<div class='screen-element mt-4'>";
      bellyHTML += "<div class='value screen-item'>" + leftCurrent + '</div>';
      bellyHTML += '</div>';
    }

    /*********
     right
    *********/
   if (screen.right && screen.right.isShown) {
    var rightCurrent = screen.right.current;
      bellyHTML += "<div class='screen-element mt-4'>";
      bellyHTML += "<div class='value screen-item'>" + rightCurrent + '</div>';
      bellyHTML += '</div>';
    }


    /*********
           Checkboxes
          *********/
    if (screen.checkboxes.isShown) {
      bellyHTML +=
        "<div class='d-flex justify-content-center flex-wrap screen-element mt-4' >";
      if (screen.checkboxes.names != undefined) {
        for (var j = 0; j < screen.checkboxes.names.length; j++) {
          var name = screen.checkboxes.names[j];
          bellyHTML +=
            "<div class='deletable-button mr-2 border border-light screen-item' >";
          bellyHTML +=
            "<div  style='z-index: 2'><input type='checkbox'  style='z-index: 2'name='checkbox' " +
            "onchange='Belly.bellyInputReceived(this," +
            Belly.currentScreen +
            ',' +
            j +
            ")'>" +
            name +
            '</div>';
          bellyHTML += '</div>';
        }
      }
      bellyHTML += '</div>';
    }

    /*********
           Text input field
          *********/
    if (screen.textInput && screen.textInput.isShown === 1) {
      bellyHTML += "<div class='screen-element mt-4 style='z-index: 2'>";
      bellyHTML +=
        '<textarea id="textInput" name="textInput" rows="4" cols="50"';
      bellyHTML +=
        ' placeholder="' +
        (screen.textInput.text ? screen.textInput.text : '') +
        '"';
      bellyHTML +=
        " onchange='Belly.bellyInputReceived(this," +
        Belly.currentScreen +
        ")'";
      bellyHTML += '></textarea>';
      bellyHTML += '</div>';
    }

    /*********
           Buttons
          *********/
    if (screen.buttons.isShown) {
      bellyHTML +=
        "<div class='d-flex justify-content-center flex-wrap screen-element mt-4'  style='z-index: 2'>";

      if (screen.buttons.list != undefined) {
        for (var j = 0; j < screen.buttons.list.length; j++) {
          var name = screen.buttons.list[j].name;

          // Buttons with images
          if (screen.buttons.list[j].url) {
            var url = screen.buttons.list[j].url;
            bellyHTML +=
              "<div style='align-self: start'>" +
              "<button class='btn btn-secondary mx-2 screen-item' " +
              "onclick='Belly.bellyInputReceived(this," +
              Belly.currentScreen +
              ',' +
              j +
              ")' name='button'>" +
              '<div><img  src=' +
              url +
              " width='60' height='60'/></div><p style='font-size:16;color:white'>" +
              name +
              '</p></button>';
            // Buttons with text
            if (screen.buttons.list[j].label) {
              bellyHTML +=
                '<h2 style="max-width: 160px">' +
                screen.buttons.list[j].label +
                '</h2>';
            }
            bellyHTML += '</div>';
          }

          // Buttons that have neither label nor image
          // TODO: Why is .name and .label a different thing?
          if (!screen.buttons.list[j].url && !screen.buttons.list[j].label) {
            bellyHTML +=
              "<div class='mt-2'>" +
              "<button class='btn btn-secondary mx-2 screen-item' " +
              "onclick='Belly.bellyInputReceived(this," +
              Belly.currentScreen +
              ',' +
              j +
              ")' name='button'>" +
              name +
              '</button></div>';
          }
        }
      }
      bellyHTML += '</div>';
    }
    screenDiv.innerHTML = bellyHTML;

    if (Belly.scale == 'small') {
      var largeInstructionElements = document.getElementsByClassName(
        'instruction-large'
      );
      var smallInstructionElements = document.getElementsByClassName(
        'instruction-small'
      );
      var otherElements = document.getElementsByClassName('screen-item');

      if (Belly.resizeAxis == 'width') {
        for (var i = 0; i < largeInstructionElements.length; i++)
          largeInstructionElements[i].style.fontSize = '3vw';
        for (var i = 0; i < smallInstructionElements.length; i++)
          smallInstructionElements[i].style.fontSize = '2vw';
        for (var i = 0; i < otherElements.length; i++)
          otherElements[i].style.fontSize = '1.5vw';
      } else {
        for (var i = 0; i < largeInstructionElements.length; i++)
          largeInstructionElements[i].style.fontSize = '3vh';
        for (var i = 0; i < smallInstructionElements.length; i++)
          smallInstructionElements[i].style.fontSize = '2vh';
        for (var i = 0; i < otherElements.length; i++)
          otherElements[i].style.fontSize = '1.5vh';
      }
    } else if (Belly.scale == 'medium') {
      var largeInstructionElements = document.getElementsByClassName(
        'instruction-large'
      );
      var smallInstructionElements = document.getElementsByClassName(
        'instruction-small'
      );
      var otherElements = document.getElementsByClassName('screen-item');

      if (Belly.resizeAxis == 'width') {
        for (var i = 0; i < largeInstructionElements.length; i++)
          largeInstructionElements[i].style.fontSize = '4.5vw';
        for (var i = 0; i < smallInstructionElements.length; i++)
          smallInstructionElements[i].style.fontSize = '3vw';
        for (var i = 0; i < otherElements.length; i++)
          otherElements[i].style.fontSize = '2.25vw';
      } else {
        for (var i = 0; i < largeInstructionElements.length; i++)
          largeInstructionElements[i].style.fontSize = '4.5vh';
        for (var i = 0; i < smallInstructionElements.length; i++)
          smallInstructionElements[i].style.fontSize = '3vh';
        for (var i = 0; i < otherElements.length; i++)
          otherElements[i].style.fontSize = '2.25vh';
      }
    }
    bellyHTML += '</div>';
  } else {
    console.log('Screen has not changed.');
  }
  return bellyHTML;
}
