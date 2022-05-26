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
    var robotState = snapshot?.val ? snapshot.val() : snapshot;
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
    var date = new Date();
    if (target.name == 'slider') {
      Belly.bellyScreens[screenID].slider.current = target.value;
      var timestamp = date.getTime();
      // convert JavaScript Date object in milliseconds to show the 
      // Unix Timestamp into standard date/time format. For instance, 
      // “1607110465663” will show up as “Date: 4/12/2020 19:34:25”. 
      var standardDate = new Date(timestamp);
      Belly.bellyScreens[screenID].slider.lastChanged = "Date: "+standardDate.getDate()+
                                                        "/"+(standardDate.getMonth()+1)+
                                                        "/"+standardDate.getFullYear()+
                                                        " "+standardDate.getHours()+
                                                        ":"+standardDate.getMinutes()+
                                                        ":"+standardDate.getSeconds();
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
      Belly.bellyScreens[screenID].checkboxes['list'][itemID].value =
        target.checked;
      Belly.bellyScreens[screenID].checkboxes['list'][
        itemID
      ].lastChanged = date.getTime();
    }

    if (target.name == 'button') {
      if (Belly.bellyScreens[screenID].buttons['list'][itemID].link) {
        window.location.href =
          Belly.bellyScreens[screenID].buttons['list'][itemID].link;
      } else {
        Belly.bellyScreens[screenID].buttons['list'][
          itemID
        ].lastPressed = date.getTime();
      }
    }

    if (target.name == 'imageButton') {
      Belly.bellyScreens[screenID].imageButtons['list'][
        itemID
      ].lastPressed = date.getTime();
    }

    if (target.name == 'textInput') {
      // Belly.bellyScreens[screenID].textInput.value = document.getElementById(
      //   target.id
      // ).value;
    }

    if (target.name == 'savedTextInput') {
      Belly.bellyScreens[screenID].savedTextInput.value = document.getElementById(
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
          )"><progress id="file" value=` +
          progress +
          ` max="100"></progress></button>
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
    let largeTextScale = window.location.href.includes('bellyEdit')
      ? '50%'
      : '90%';
    let smallTextScale = window.location.href.includes('bellyEdit')
      ? '43%'
      : '75%';
    if (screen.instructionLarge.isShown) {
      var largeInstruction = screen.instructionLarge.text;
      var fontFamily = ((fontFamily) => {
        switch (fontFamily) {
          case 'Courier':
            return `font-family: Courier New, serif;`;
          case 'Times':
            return `font-family: 'Times New Roman', Times, serif;`;
          default:
            return 'font-family: Arial, Helvetica, sans-serif;';
        }
      })(screen.instructionLarge.fontFamily);
      bellyHTML +=
        "<div class='screen-element instruction-large' style='z-index: 2; " +
        fontFamily +
        `'><p style="margin: 3px; background-color: rgba(255, 255, 255, 0.5); font-size: ` +
        largeTextScale +
        // `; font-family: Courier New, serif;">` +
        `; ` + fontFamily +  `">` +
        largeInstruction +
        '</p></div> ';
    }

    if (screen.instructionSmall.isShown) {
      var smallInstruction = screen.instructionSmall.text;
      var fontFamily = ((fontFamily) => {
        switch (fontFamily) {
          case 'Courier':
            return `font-family: Courier New, serif;`;
          case 'Times':
            return `font-family: 'Times New Roman', Times, serif;`;
          default:
            return 'font-family: Arial, Helvetica, sans-serif;';
        }
      })(screen.instructionSmall.fontFamily);
      bellyHTML +=
        "<div class='screen-element instruction-small' style='z-index: 2; " +
        fontFamily +
        `'><p style="background-color: rgba(255, 255, 255, 0.5); margin: 3%; font-size: ` +
        smallTextScale +
        // `; font-family: Courier New, serif;">` +
        `; ` +
        fontFamily +
        `">` +
        smallInstruction +
        '</p></div>';
    }

    /*********
           Icons
          *********/

    
           
    if (screen.icons && screen.icons['list']) {
      // bellyHTML += "<div style='flex-direction: row'>";
      screen.icons['list'].forEach((element) => {
        console.log(element);
        
        bellyHTML += '<i class="' + element.type + '"style="position:absolute; top:' + element.position.y + '%; left: ' + element.position.x + '%; font-size: ' + element.size + 'px;"></i>'
        // <i class="fa fa-hand-peace-o"></i>
      })
      // bellyHTML += '</div>';
    }

    // visualization sliders
    // function torti(value) {
    //   alert(value)
    // }

    if (screen.vizSliders && screen.vizSliders['list']) {
      screen.vizSliders['list'].forEach((element) =>
        {if (element == "mood") {
          
          bellyHTML += '<h3 id="m-thanks" style="visibility: hidden; position: relative; top: 20%;">Thanks for sharing!</h3><div style="display: flex; flex-direction: row;" id="mood-options"> <button style="font-size:3.5em; margin: .5em;" onclick="moodLow()">🙁</button> <button style="font-size:3.5em; margin: .5em;" onclick="moodNeutral()">😐</button> <button style="font-size:3.5em; margin: .5em;" onclick="moodHigh()">🙂</button> </div>'
          // bellyHTML += '<div><input type="range" min="1" max="3" value="2" onchange="torti(value)"><input type="submit" onclick="alert(value)" value="Submit"></input></div>'
        } else if (element == "stress"){
          bellyHTML += '<h3 id="s-thanks" style="visibility: hidden; position: relative; top: 20%">Thanks for sharing!</h3><div style="display: flex, flex-direction: row;" id="stress-options"> <button style="font-size:3.5em; margin: .5em;" onclick="stressHigh()">🙁</button> <button style="font-size:3.5em; margin: .5em;" onclick="stressNeutral()">😐</button> <button style="font-size:3.5em; margin: .5em;" onclick="stressLow()">🙂</button> </div>'
        }}
        // bellyHTML += '<h2>' + element + '</h2>'
      )
    }

    // if ('vizSliders' in bellyScreens[selectedBellyScreen]) {
    //   bellyHTML += '<h2>taco</h2>'
    // }
   

    // Setting ID's for visualizations

    bellyHTML += "<div id=" + `turkey${Belly.currentScreen}` + "></div>";
    console.log("turkey" + Belly.currentScreen.toString());
    renderVisuals(Belly, Belly.currentScreen);
    
    // const tag = document.getElementById('turkey'+ Belly.currentScreen.toString());
    
    /*********
           Images
          *********/
    if (screen.images && screen.images.isShown && screen.images['list']) {
      bellyHTML += "<div style='flex-direction: row'>";
      screen.images['list'].forEach((element) => {
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
            position += 'position: relative;'
          }
        alignment = ''
        if (element.alignment == 'left') {
          alignment = 'left: -200px;'
        } else if (element.alignment == 'right') {
          alignment = 'left: 200px;'
        }
        position += "'";
        bellyHTML +=
          "<img src='" +
          element.path +
          "' style='border: none;" +
          alignment +
          position + 
          "width='" +
          element.size.x +
          "' height='" +
          element.size.y +
          "' z-index = -1" +
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
        `<div class='min-value screen-item'  style='z-index: 2'><p style="background-color: rgba(255, 255, 255, 0.5); margin: 3%;font-size: 100%; font-family: Courier New, serif;">` +
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
      bellyHTML +=
        `<div class='max-value screen-item'><p style="background-color: rgba(255, 255, 255, 0.5); margin: 3%;font-size: 100%; font-family: Courier New, serif;">` +
        sliderMax +
        '</div>';
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
        '<textarea id="textInput" name="textInput" rows="3" cols="50"';
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
           SAVED Text input field
          *********/
    if (screen.savedTextInput && screen.savedTextInput.isShown === 1) {
      bellyHTML += "<div class='screen-element mt-4 style='z-index: 2'>";
      bellyHTML +=
        '<textarea id="savedTextInput" name="savedTextInput" rows="3" cols="50"';
      bellyHTML +=
        ' placeholder="' +
        (screen.savedTextInput.text ? screen.savedTextInput.text : '') +
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
      let buttonTextScale = window.location.href.includes('bellyEdit')
        ? '1vw'
        : '2.5vw';

      if (screen.buttons['list'] != undefined) {
        for (var j = 0; j < screen.buttons['list'].length; j++) {
          var name = screen.buttons['list'][j].name;

          // Buttons with images
          if (screen.buttons['list'][j].url) {
            var url = screen.buttons['list'][j].url;
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
              ` width='60' height='60'/></div><p style='font-size: ` +
              buttonTextScale +
              `;color:white'>` +
              name +
              '</p></button>';
            // Buttons with text
            if (screen.buttons['list'][j].label) {
              bellyHTML +=
                `<h2 style="max-width: 160px; font-size: ` +
                buttonTextScale +
                `;">` +
                screen.buttons['list'][j].label +
                '</h2>';
            }
            bellyHTML += '</div>';
          }

          // Buttons that have neither label nor image
          // TODO: Why is .name and .label a different thing?
          if (!screen.buttons['list'][j].url && !screen.buttons['list'][j].label) {
            bellyHTML +=
              "<div class='mt-2'>" +
              "<button class='btn btn-secondary mx-2 screen-item' " +
              "onclick='Belly.bellyInputReceived(this," +
              Belly.currentScreen +
              ',' +
              j +
              `)' name='button' style="font-size: `
              + buttonTextScale + 
              `;">` +
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
        for (var i = 0; i < otherElements.length; i++) {
          if (window.location.href.includes('bellyEdit')) {
            otherElements[i].style.fontSize = '0.8vw';
          } else {
            otherElements[i].style.fontSize = '1.5vw';
          }
        }
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

// function updateVizData(type, level) {
//   var today = new Date();
//   today = today.getDay()
// }

function moodLow() {
  var today = new Date();
  var day = today.getMonth() + "-" + today.getDate() + "-" + today.getFullYear();
  // alert(today.getMonth() + "-" + today.getDate() + "-" + today.getFullYear());
  // updateVizData('mood', 'low')

  // var today = new Date();
  // today = today.getDay()
  var dir = `robotapi/weeklyMood/${day}/"🙁"`;
  var dbRef = firebase.database().ref(dir);
  
  // FieldValue = require('firebase-admin').firestore.FieldValue;
  // dbRef.update(Firestore.FieldValue.increment(1))
  var data

  dbRef.once('value', (snap)=>{
    if (snap.val()) {
      data = snap.val();
    } else {
      data = 0;
    }
    

    dbRef.set(data + 1)
  })

  var options = document.getElementById("mood-options");
  options.style.visibility = 'hidden';

  var thanks = document.getElementById("m-thanks");
  thanks.style.visibility = "visible";
}

function moodNeutral() {
  var today = new Date();
  var day = today.getMonth() + "-" + today.getDate() + "-" + today.getFullYear();
  // updateVizData('mood', 'neutral')

  var dir = `robotapi/weeklyMood/${day}/"😐"`;
  var dbRef = firebase.database().ref(dir);

  var data

  dbRef.once('value', (snap)=>{
    data = snap.val();
    dbRef.set(data + 1)

  })

  var options = document.getElementById("mood-options");
  options.style.visibility = 'hidden';

  var thanks = document.getElementById("m-thanks");
  thanks.style.visibility = "visible";
}

function moodHigh() {
  var today = new Date();
  var day = today.getMonth() + "-" + today.getDate() + "-" + today.getFullYear();
  // updateVizData('mood', 'high')

  var dir = `robotapi/weeklyMood/${day}/"🙂"`;
  var dbRef = firebase.database().ref(dir);

  var data

  dbRef.once('value', (snap)=>{
    data = snap.val();
    dbRef.set(data + 1)
  })

  var options = document.getElementById("mood-options");
  options.style.visibility = 'hidden';

  var thanks = document.getElementById("m-thanks");
  thanks.style.visibility = "visible";
}


function stressLow() {
  var today = new Date();
  var day = today.getMonth() + "-" + today.getDate() + "-" + today.getFullYear();

  var dir = `robotapi/weeklyStress/${day}/"🙂"`;
  var dbRef = firebase.database().ref(dir);

  var data

  dbRef.once('value', (snap)=>{
    data = snap.val();
    dbRef.set(data + 1)

  })

  var options = document.getElementById("stress-options");
  options.style.visibility = 'hidden';

  var thanks = document.getElementById("s-thanks");
  thanks.style.visibility = "visible";
}

function stressNeutral() {
  var today = new Date();
  var day = today.getMonth() + "-" + today.getDate() + "-" + today.getFullYear();

  var dir = `robotapi/weeklyStress/${day}/"😐"`;
  var dbRef = firebase.database().ref(dir);

  var data

  dbRef.once('value', (snap)=>{
    data = snap.val();
    dbRef.set(data + 1)

  })

  var options = document.getElementById("stress-options");
  options.style.visibility = 'hidden';

  var thanks = document.getElementById("s-thanks");
  thanks.style.visibility = "visible";
}

function stressHigh() {
  var today = new Date();
  var day = today.getMonth() + "-" + today.getDate() + "-" + today.getFullYear();

  var dir = `robotapi/weeklyStress/${day}/"🙁"`;
  var dbRef = firebase.database().ref(dir);

  var data

  dbRef.once('value', (snap)=>{
    data = snap.val();
    dbRef.set(data + 1)

  })

  var options = document.getElementById("stress-options");
  options.style.visibility = 'hidden';

  var thanks = document.getElementById("s-thanks");
  thanks.style.visibility = "visible";
}

// window.onload = ()=>{renderVisuals()};

function renderVisuals(Belly, screen) {
  setTimeout(()=>{
    console.log('cheese');
    console.log('turkey'+screen.toString());
    console.log(document.getElementById('turkey'+screen.toString()));
    console.log(screen);

    var screen_data = Belly.bellyScreens[screen];
  
    if (screen_data.visualizations) {
      for (let k = 0; k < screen_data.visualizations.list.length; k++) {
        // if (screen.screen_data.visualizations.list[k] == "community_mood") {
        //   addStaticVisCommunityMood(screen);
        // }
    
        if (screen_data.visualizations && screen_data.visualizations.list[k] == 'community_mood') {
          addStaticVisCommunityMood(screen);
          
        } else if (screen_data.visualizations.list[k] == 'static_com_stress') {
          addStaticVisCommunityStress(screen);
        } else if (screen_data.visualizations.list[k] == 'weekly_stress_finals') {
          addStaticVisWeeklyStressFinals(screen);
        } else if (screen_data.visualizations.list[k] == 'weekly_mood_finals') {
          addStaticVisWeeklyMoodFinals(screen);
        } else if (screen_data.visualizations.list[k] == 'weekly_stress_thanksgiving') {
          addStaticVisWeeklyStressThanksgiving(screen);
        } else if (screen_data.visualizations.list[k] == 'weekly_mood_thanksgiving') {
          addStaticVisWeeklyMoodThanksgiving(screen);
        } else if (screen_data.visualizations.list[k] == 'com_stress_touch') {
          addStaticVisCommunityStressTouch(screen);
        } else if (screen_data.visualizations.list[k] == 'com_mood_touch') {
          addStaticVisCommunityMoodTouch(screen);
        } 
          else if (screen_data.visualizations.list[k] == 'weekly_stress') {
          addStaticVisWeeklyStress(screen);
        } else if (screen_data.visualizations.list[k] == 'weekly_mood') {
          addStaticVisWeeklyMood(screen);
        }
      }
    }
  }, 100)
  // var target = document.getElementById('turkey' + screen.toString());
  // while (target == null) {
  //   var target = document.getElementById('turkey' + screen.toString());
  // }
  
  // var bellyScreens = Belly.bellyScreens;
  // console.log(Belly['bellyScreens'][0]['visualizations']['list'].length);
  // for (let i = 0; i < bellyScreens.length; i++) {
  //   var tag = document.getElementById("turkey" + i.toString())
  //   console.log(tag);

  //   if (screen.visualizations) {
  //     console.log(screen.screen_data.visualizations.list);
 
    // }
  // }
}

function addStaticVisCommunityMoodTouch(screen) {
  firebase.database().ref('robotapi/communityMood').on('value', (snap)=>{
  console.log("moods")
  console.log(snap.val())
  let total = 0;
  let data = snap.val();
  console.log("data")
  console.log(data)
  console.log("total")
  let dataVal = Object.values(data);
  for (let i = 0; i < dataVal.length; i++) {
    console.log("data in index i")
    console.log(dataVal[i])
    total += dataVal[i];
  }
  console.log(total)
  console.log("low")
  let low = ((dataVal[0] * 100) / total);
  console.log(low)
  console.log("med")
  let med = ((dataVal[1] * 100) / total);
  console.log(med)
  console.log("high")
  let high = ((dataVal[2] * 100) / total);
  console.log(high)
  console.log("arr")
  let arr = [low, med, high];
  console.log(arr)
  console.log("PIE DICTIONARY")
  let keys = Object.keys(arr);
  let vals = Object.values(arr);
  console.log(keys)
  console.log(vals)
  var mapping = [
    {x: "🙁", value: dataVal[0]},
    {x: "😐", value: dataVal[1]},
    {x: "🙂", value: dataVal[2]}
  ];
  console.log(mapping)
  // create a pie chart and set the data
  chart = anychart.pie(mapping);
  chart.palette(["#FF0000", "#FAF9F6", "#008000"]);
  // set title
  chart.title("Mood Levels by Community Percentage");
  // set the position of labels
  //chart.labels().position("outside");
  // set the container id
  chart.container("turkey" + screen.toString());
  // initiate drawing the chart
  chart.draw();
  });
}

  function addStaticVisCommunityStressTouch(screen) {
    firebase.database().ref('robotapi/communityStress').on('value', (snap)=>{
        
        console.log("stress")
        console.log(snap.val())
        let total = 0;
        let data = snap.val();
        console.log("data")
        console.log(data)
        console.log("total")
        let dataVal = Object.values(data);
        for (let i = 0; i < dataVal.length; i++) {
          total += dataVal[i];
        }
        console.log(total)
        console.log("med")
        let med = ((dataVal[0] * 100) / total);
        console.log(med)
        console.log("low")
        let low = ((dataVal[1] * 100) / total);
        console.log(low)
        console.log("high")
        let high = ((dataVal[2] * 100) / total);
        console.log(high)
        console.log("arr")
        let arr = [low, med, high];
        console.log(arr)
        console.log("PIE DICTIONARY")
        let keys = Object.keys(arr);
        let vals = Object.values(arr);
        console.log(keys)
        console.log(vals)
        var mapping = [
          // order of firebase
          {x: "🙁", value: dataVal[0]},
          {x: "😐", value: dataVal[1]},
          {x: "🙂", value: dataVal[2]}
        ];
        console.log(mapping)
        // create a pie chart and set the data
        chart = anychart.pie(mapping);
        chart.palette(["#008000", "#FAF9F6", "#FF0000"]);
        // set the position of labels
        //chart.labels().position("outside");
        // set title
        chart.title("Stress Levels by Community Percentage");
        // set the container id
        chart.container("turkey" + screen.toString());
        // initiate drawing the chart
        chart.draw();
      });
    }



function addStaticVisCommunityMood(screen) {
  firebase.database().ref('robotapi/communityMood').on('value', (snap)=>{
  console.log("moods")
  console.log(snap.val())
  let total = 0;
  let data = snap.val();
  console.log("data")
  console.log(data)
  console.log("total")
  let dataVal = Object.values(data);
  for (let i = 0; i < dataVal.length; i++) {
    console.log("data in index i")
    console.log(dataVal[i])
    total += dataVal[i];
  }
  console.log(total)
  console.log("low")
  let low = ((dataVal[0] * 100) / total);
  console.log(low)
  console.log("med")
  let med = ((dataVal[1] * 100) / total);
  console.log(med)
  console.log("high")
  let high = ((dataVal[2] * 100) / total);
  console.log(high)
  console.log("arr")
  let arr = [low, med, high];
  console.log(arr)
  console.log("PIE DICTIONARY")
  let keys = Object.keys(arr);
  let vals = Object.values(arr);
  console.log(keys)
  console.log(vals)
  var mapping = [
    {x: "🙁", value: dataVal[0]},
    {x: "😐", value: dataVal[1]},
    {x: "🙂", value: dataVal[2]}
  ];
  console.log(mapping)
  // create a pie chart and set the data
  chart = anychart.pie(mapping);
  chart.palette(["#FF0000", "#FAF9F6", "#008000"]);
  // set title
  chart.title("Mood Levels by Community Percentage");
  // set the position of labels
  chart.labels().position("outside");
  // set the container id
  chart.container("turkey" + screen.toString());
  // initiate drawing the chart
  chart.draw();
  });
}

  function addStaticVisCommunityStress(screen) {
    firebase.database().ref('robotapi/communityStress').on('value', (snap)=>{
        
        console.log("stress")
        console.log(snap.val())
        let total = 0;
        let data = snap.val();
        console.log("data")
        console.log(data)
        console.log("total")
        let dataVal = Object.values(data);
        for (let i = 0; i < dataVal.length; i++) {
          total += dataVal[i];
        }
        console.log(total)
        console.log("med")
        let med = ((dataVal[0] * 100) / total);
        console.log(med)
        console.log("low")
        let low = ((dataVal[1] * 100) / total);
        console.log(low)
        console.log("high")
        let high = ((dataVal[2] * 100) / total);
        console.log(high)
        console.log("arr")
        let arr = [low, med, high];
        console.log(arr)
        console.log("PIE DICTIONARY")
        let keys = Object.keys(arr);
        let vals = Object.values(arr);
        console.log(keys)
        console.log(vals)
        var mapping = [
          // order of firebase
          {x: "🙁", value: dataVal[0]},
          {x: "😐", value: dataVal[1]},
          {x: "🙂", value: dataVal[2]}
        ];
        console.log(mapping)
        // create a pie chart and set the data
        chart = anychart.pie(mapping);
        chart.palette(["#008000", "#FAF9F6", "#FF0000"]);
        // set the position of labels
        chart.labels().position("outside");
        // set title
        chart.title("Stress Levels by Community Percentage");
        // set the container id
        chart.container("turkey" + screen.toString());
        // initiate drawing the chart
        chart.draw();
      });
    }

function addStaticVisWeeklyStressFinals(screen) {
  firebase.database().ref('robotapi/weeklyStress/FinalsWeek').on('value', (snap)=>{
    console.log("mon moods")
    console.log(snap.val())
    let finalsData = Object.values(snap.val());
    let finalsKeys = Object.keys(snap.val());
    console.log("finals Keys")
    console.log(finalsKeys)
    let monKeyIdx = finalsKeys.indexOf("Mon");
    let tueKeyIdx = finalsKeys.indexOf("Tue");
    let wedKeyIdx = finalsKeys.indexOf("Wed");
    let thursKeyIdx = finalsKeys.indexOf("Thurs");
    let friKeyIdx = finalsKeys.indexOf("Fri");
    let satKeyIdx = finalsKeys.indexOf("Sat");
    let sunKeyIdx = finalsKeys.indexOf("Sun");
    console.log(monKeyIdx)
    let monData = finalsData[monKeyIdx];
    let tueData = finalsData[tueKeyIdx];
    let wedData = finalsData[wedKeyIdx];
    let thursData = finalsData[thursKeyIdx];
    let friData = finalsData[friKeyIdx];
    let satData = finalsData[satKeyIdx];
    let sunData = finalsData[sunKeyIdx];
    console.log("mon data")
    console.log(monData)

  console.log("mon vals")
  console.log(Object.values(monData))
  let monVals = Object.values(monData);
  let monMax = Math.max(...monVals);
  console.log("mon max")
  console.log(monMax)
  let tueMax = Math.max(...Object.values(tueData));
  let wedMax = Math.max(...Object.values(wedData));
  let thursMax = Math.max(...Object.values(thursData));
  let friMax = Math.max(...Object.values(friData));
  let satMax = Math.max(...Object.values(satData));
  let sunMax = Math.max(...Object.values(sunData));

  let monMoodIdx = Object.values(monData).indexOf(monMax);
  console.log(monMoodIdx)
  let monMoods = Object.keys(monData);
  console.log(monMoods)
  let monMood = monMoods[monMoodIdx];
  console.log(monMood)

  if (monMood === '"🙁"') {
      monMood = 2;
  } else if(monMood === '"🙂"') {
    monMood = 0;
  } else {
    monMood = 1;
  }

  console.log(monMood)

  let wedMoodIdx = Object.values(wedData).indexOf(wedMax);
  console.log(wedMoodIdx)
  let wedMoods = Object.keys(wedData);
  console.log(wedMoods)
  let wedMood = wedMoods[wedMoodIdx];
  console.log(wedMood)

  if (wedMood === '"🙁"') {
      wedMood = 2;
  } else if(wedMood === '"🙂"') {
    wedMood = 0;
  } else {
    wedMood = 1;
  }

  console.log(wedMood)

  let tueMoodIdx = Object.values(tueData).indexOf(tueMax);
  console.log(tueMoodIdx)
  let tueMoods = Object.keys(tueData);
  console.log(tueMoods)
  let tueMood = tueMoods[tueMoodIdx];
  console.log(tueMood)

  if (tueMood === '"🙁"') {
      tueMood = 2;
  } else if(tueMood === '"🙂"') {
    tueMood = 0;
  } else {
    tueMood = 1;
  }

  console.log(tueMood)

  let friMoodIdx = Object.values(friData).indexOf(friMax);
  console.log(friMoodIdx)
  let friMoods = Object.keys(friData);
  console.log(friMoods)
  let friMood = friMoods[friMoodIdx];
  console.log(friMood)

  if (friMood === '"🙁"') {
      friMood = 2;
  } else if(friMood === '"🙂"') {
    friMood = 0;
  } else {
    friMood = 1;
  }

  console.log(friMood)

  let satMoodIdx = Object.values(satData).indexOf(satMax);
  console.log(satMoodIdx)
  let satMoods = Object.keys(satData);
  console.log(satMoods)
  let satMood = satMoods[satMoodIdx];
  console.log(satMood)

  if (satMood === '"🙁"') {
      satMood = 2;
  } else if(satMood === '"🙂"') {
    satMood = 0;
  } else {
    satMood = 1;
  }

  console.log(satMood)

  let sunMoodIdx = Object.values(sunData).indexOf(sunMax);
  console.log(sunMoodIdx)
  let sunMoods = Object.keys(sunData);
  console.log(sunMoods)
  let sunMood = sunMoods[sunMoodIdx];
  console.log(sunMood)

  if (sunMood === '"🙁"') {
      sunMood = 2;
  } else if(sunMood === '"🙂"') {
    sunMood = 0;
  } else {
    sunMood = 1;
  }

  console.log(sunMood)

  let thursMoodIdx = Object.values(thursData).indexOf(thursMax);
  console.log(thursMoodIdx)
  let thursMoods = Object.keys(thursData);
  console.log(thursMoods)
  let thursMood = thursMoods[thursMoodIdx];
  console.log(thursMood)

  if (thursMood === '"🙁"') {
      thursMood = 2;
  } else if(thursMood === '"🙂"') {
    thursMood = 0;
  } else {
    thursMood = 1;
  }

  console.log(thursMood)

  var mapping = [
    // order of firebase
    {x: "Mon", value: monMood},
    {x: "Tue", value: tueMood},
    {x: "Wed", value: wedMood},
    {x: "Thurs", value: thursMood},
    {x: "Fri", value: friMood},
    {x: "Sat", value: satMood},
    {x: "Sun", value: sunMood}
  ];
  console.log(mapping)
  // create a pie chart and set the data
  var chart = anychart.line(mapping);
  chart.yScale().minimum(0);
  chart.yScale().maximum(2);
  

  // set title
  chart.title("Stress Levels of Finals Week");

  var xAxis = chart.xAxis();

var yTitle = chart.yAxis().title();
yTitle.enabled(true);
yTitle.text("2 = 🙁, 1 = 😐, 0 = 🙂");
yTitle.align("bottom");

  // set the container id
  chart.container("turkey" + screen.toString());
  // initiate drawing the chart
  chart.draw();   
});
}

function addStaticVisWeeklyStress(screen) {
  firebase.database().ref('robotapi/weeklyStress/').on('value', (snap)=>{
    console.log("mon moods")
    console.log(snap.val())
    let finalsData = Object.values(snap.val());
    let finalsKeys = Object.keys(snap.val());
    console.log("finals Keys")
    console.log(finalsKeys)
    let monKeyIdx = finalsKeys.indexOf("3-18-2022");
      let tueKeyIdx = finalsKeys.indexOf("4-10-2022");
      let wedKeyIdx = finalsKeys.indexOf("4-11-2022");
      let thursKeyIdx = finalsKeys.indexOf("4-12-2022");
      let friKeyIdx = finalsKeys.indexOf("4-13-2022");
    //let satKeyIdx = finalsKeys.indexOf("Sat");
    //let sunKeyIdx = finalsKeys.indexOf("Sun");
    console.log(monKeyIdx)
    let monData = finalsData[monKeyIdx];
    let tueData = finalsData[tueKeyIdx];
    let wedData = finalsData[wedKeyIdx];
    let thursData = finalsData[thursKeyIdx];
    let friData = finalsData[friKeyIdx];
    //let satData = finalsData[satKeyIdx];
    //let sunData = finalsData[sunKeyIdx];
    console.log("mon data")
    console.log(monData)

  console.log("mon vals")
  console.log(Object.values(monData))
  let monVals = Object.values(monData);
  let monMax = Math.max(...monVals);
  console.log("mon max")
  console.log(monMax)
  let tueMax = Math.max(...Object.values(tueData));
  let wedMax = Math.max(...Object.values(wedData));
  let thursMax = Math.max(...Object.values(thursData));
  let friMax = Math.max(...Object.values(friData));
  //let satMax = Math.max(...Object.values(satData));
  //let sunMax = Math.max(...Object.values(sunData));

  let monMoodIdx = Object.values(monData).indexOf(monMax);
  console.log(monMoodIdx)
  let monMoods = Object.keys(monData);
  console.log(monMoods)
  let monMood = monMoods[monMoodIdx];
  console.log(monMood)

  if (monMood === '"🙁"') {
      monMood = 2;
  } else if(monMood === '"🙂"') {
    monMood = 0;
  } else {
    monMood = 1;
  }

  console.log(monMood)

  let wedMoodIdx = Object.values(wedData).indexOf(wedMax);
  console.log(wedMoodIdx)
  let wedMoods = Object.keys(wedData);
  console.log(wedMoods)
  let wedMood = wedMoods[wedMoodIdx];
  console.log(wedMood)

  if (wedMood === '"🙁"') {
      wedMood = 2;
  } else if(wedMood === '"🙂"') {
    wedMood = 0;
  } else {
    wedMood = 1;
  }

  console.log(wedMood)

  let tueMoodIdx = Object.values(tueData).indexOf(tueMax);
  console.log(tueMoodIdx)
  let tueMoods = Object.keys(tueData);
  console.log(tueMoods)
  let tueMood = tueMoods[tueMoodIdx];
  console.log(tueMood)

  if (tueMood === '"🙁"') {
      tueMood = 2;
  } else if(tueMood === '"🙂"') {
    tueMood = 0;
  } else {
    tueMood = 1;
  }

  console.log(tueMood)

  let friMoodIdx = Object.values(friData).indexOf(friMax);
  console.log(friMoodIdx)
  let friMoods = Object.keys(friData);
  console.log(friMoods)
  let friMood = friMoods[friMoodIdx];
  console.log(friMood)

  if (friMood === '"🙁"') {
      friMood = 2;
  } else if(friMood === '"🙂"') {
    friMood = 0;
  } else {
    friMood = 1;
  }

  console.log(friMood)
/*
  let satMoodIdx = Object.values(satData).indexOf(satMax);
  console.log(satMoodIdx)
  let satMoods = Object.keys(satData);
  console.log(satMoods)
  let satMood = satMoods[satMoodIdx];
  console.log(satMood)

  if (satMood === '"🙁"') {
      satMood = 2;
  } else if(satMood === '"🙂"') {
    satMood = 0;
  } else {
    satMood = 1;
  }

  console.log(satMood)

  let sunMoodIdx = Object.values(sunData).indexOf(sunMax);
  console.log(sunMoodIdx)
  let sunMoods = Object.keys(sunData);
  console.log(sunMoods)
  let sunMood = sunMoods[sunMoodIdx];
  console.log(sunMood)

  if (sunMood === '"🙁"') {
      sunMood = 2;
  } else if(sunMood === '"🙂"') {
    sunMood = 0;
  } else {
    sunMood = 1;
  }

  console.log(sunMood)
*/
  let thursMoodIdx = Object.values(thursData).indexOf(thursMax);
  console.log(thursMoodIdx)
  let thursMoods = Object.keys(thursData);
  console.log(thursMoods)
  let thursMood = thursMoods[thursMoodIdx];
  console.log(thursMood)

  if (thursMood === '"🙁"') {
      thursMood = 2;
  } else if(thursMood === '"🙂"') {
    thursMood = 0;
  } else {
    thursMood = 1;
  }

  console.log(thursMood)

  var mapping = [
    // order of firebase
    {x: "Mon", value: monMood},
    {x: "Tue", value: tueMood},
    {x: "Wed", value: wedMood},
    {x: "Thurs", value: thursMood},
    {x: "Fri", value: friMood}
    //{x: "Sat", value: satMood},
    //{x: "Sun", value: sunMood}
  ];
  console.log(mapping)
  // create a pie chart and set the data
  var chart = anychart.line(mapping);
  chart.yScale().minimum(0);
  chart.yScale().maximum(2);
  

  // set title
  chart.title("Weekly Stress Levels");

  var xAxis = chart.xAxis();

var yTitle = chart.yAxis().title();
yTitle.enabled(true);
yTitle.text("2 = 🙁, 1 = 😐, 0 = 🙂");
yTitle.align("bottom");

  // set the container id
  chart.container("turkey" + screen.toString());
  // initiate drawing the chart
  chart.draw();   
});
}

function addStaticVisWeeklyStressThanksgiving() {
  firebase.database().ref('robotapi/weeklyStress/ThanksgivingWeek').on('value', (snap)=>{
    console.log("mon moods")
    console.log(snap.val())
    let finalsData = Object.values(snap.val());
    let finalsKeys = Object.keys(snap.val());
    console.log("finals Keys")
    console.log(finalsKeys)
    let monKeyIdx = finalsKeys.indexOf("Mon");
    let tueKeyIdx = finalsKeys.indexOf("Tue");
    let wedKeyIdx = finalsKeys.indexOf("Wed");
    let thursKeyIdx = finalsKeys.indexOf("Thurs");
    let friKeyIdx = finalsKeys.indexOf("Fri");
    let satKeyIdx = finalsKeys.indexOf("Sat");
    let sunKeyIdx = finalsKeys.indexOf("Sun");
    console.log(monKeyIdx)
    let monData = finalsData[monKeyIdx];
    let tueData = finalsData[tueKeyIdx];
    let wedData = finalsData[wedKeyIdx];
    let thursData = finalsData[thursKeyIdx];
    let friData = finalsData[friKeyIdx];
    let satData = finalsData[satKeyIdx];
    let sunData = finalsData[sunKeyIdx];
    console.log("mon data")
    console.log(monData)

  console.log("mon vals")
  console.log(Object.values(monData))
  let monVals = Object.values(monData);
  let monMax = Math.max(...monVals);
  console.log("mon max")
  console.log(monMax)
  let tueMax = Math.max(...Object.values(tueData));
  let wedMax = Math.max(...Object.values(wedData));
  let thursMax = Math.max(...Object.values(thursData));
  let friMax = Math.max(...Object.values(friData));
  let satMax = Math.max(...Object.values(satData));
  let sunMax = Math.max(...Object.values(sunData));

  let monMoodIdx = Object.values(monData).indexOf(monMax);
  console.log(monMoodIdx)
  let monMoods = Object.keys(monData);
  console.log(monMoods)
  let monMood = monMoods[monMoodIdx];
  console.log(monMood)

  if (monMood === '"🙁"') {
      monMood = 2;
  } else if(monMood === '"🙂"') {
    monMood = 0;
  } else {
    monMood = 1;
  }

  console.log(monMood)

  let wedMoodIdx = Object.values(wedData).indexOf(wedMax);
  console.log(wedMoodIdx)
  let wedMoods = Object.keys(wedData);
  console.log(wedMoods)
  let wedMood = wedMoods[wedMoodIdx];
  console.log(wedMood)

  if (wedMood === '"🙁"') {
      wedMood = 2;
  } else if(wedMood === '"🙂"') {
    wedMood = 0;
  } else {
    wedMood = 1;
  }

  console.log(wedMood)

  let tueMoodIdx = Object.values(tueData).indexOf(tueMax);
  console.log(tueMoodIdx)
  let tueMoods = Object.keys(tueData);
  console.log(tueMoods)
  let tueMood = tueMoods[tueMoodIdx];
  console.log(tueMood)

  if (tueMood === '"🙁"') {
      tueMood = 2;
  } else if(tueMood === '"🙂"') {
    tueMood = 0;
  } else {
    tueMood = 1;
  }

  console.log(tueMood)

  let friMoodIdx = Object.values(friData).indexOf(friMax);
  console.log(friMoodIdx)
  let friMoods = Object.keys(friData);
  console.log(friMoods)
  let friMood = friMoods[friMoodIdx];
  console.log(friMood)

  if (friMood === '"🙁"') {
      friMood = 2;
  } else if(friMood === '"🙂"') {
    friMood = 0;
  } else {
    friMood = 1;
  }

  console.log(friMood)

  let satMoodIdx = Object.values(satData).indexOf(satMax);
  console.log(satMoodIdx)
  let satMoods = Object.keys(satData);
  console.log(satMoods)
  let satMood = satMoods[satMoodIdx];
  console.log(satMood)

  if (satMood === '"🙁"') {
      satMood = 2;
  } else if(satMood === '"🙂"') {
    satMood = 0;
  } else {
    satMood = 1;
  }

  console.log(satMood)

  let sunMoodIdx = Object.values(sunData).indexOf(sunMax);
  console.log(sunMoodIdx)
  let sunMoods = Object.keys(sunData);
  console.log(sunMoods)
  let sunMood = sunMoods[sunMoodIdx];
  console.log(sunMood)

  if (sunMood === '"🙁"') {
      sunMood = 2;
  } else if(sunMood === '"🙂"') {
    sunMood = 0;
  } else {
    sunMood = 1;
  }

  console.log(sunMood)

  let thursMoodIdx = Object.values(thursData).indexOf(thursMax);
  console.log(thursMoodIdx)
  let thursMoods = Object.keys(thursData);
  console.log(thursMoods)
  let thursMood = thursMoods[thursMoodIdx];
  console.log(thursMood)

  if (thursMood === '"🙁"') {
      thursMood = 2;
  } else if(thursMood === '"🙂"') {
    thursMood = 0;
  } else {
    thursMood = 1;
  }

  console.log(thursMood)

  var mapping = [
    // order of firebase
    {x: "Mon", value: monMood},
    {x: "Tue", value: tueMood},
    {x: "Wed", value: wedMood},
    {x: "Thurs", value: thursMood},
    {x: "Fri", value: friMood},
    {x: "Sat", value: satMood},
    {x: "Sun", value: sunMood}
  ];
  console.log(mapping)
  // create a pie chart and set the data
  var chart = anychart.line(mapping);
  chart.yScale().minimum(0);
  chart.yScale().maximum(2);
  

  // set title
  chart.title("Stress Levels of Thanksgiving Week");

  var xAxis = chart.xAxis();

var yTitle = chart.yAxis().title();
yTitle.enabled(true);
yTitle.text("2 = 🙁, 1 = 😐, 0 = 🙂");
yTitle.align("bottom");

  // set the container id
  chart.container("turkey" + screen.toString());
  // initiate drawing the chart
  chart.draw();   
});
}

function addStaticVisWeeklyMoodThanksgiving(screen) {
  firebase.database().ref('robotapi/weeklyMood/ThanksgivingWeek').on('value', (snap)=>{
    console.log("mon moods")
    console.log(snap.val())
    let finalsData = Object.values(snap.val());
    let finalsKeys = Object.keys(snap.val());
    console.log("finals Keys")
    console.log(finalsKeys)
    let monKeyIdx = finalsKeys.indexOf("Mon");
    let tueKeyIdx = finalsKeys.indexOf("Tue");
    let wedKeyIdx = finalsKeys.indexOf("Wed");
    let thursKeyIdx = finalsKeys.indexOf("Thurs");
    let friKeyIdx = finalsKeys.indexOf("Fri");
    let satKeyIdx = finalsKeys.indexOf("Sat");
    let sunKeyIdx = finalsKeys.indexOf("Sun");
    console.log(monKeyIdx)
    let monData = finalsData[monKeyIdx];
    let tueData = finalsData[tueKeyIdx];
    let wedData = finalsData[wedKeyIdx];
    let thursData = finalsData[thursKeyIdx];
    let friData = finalsData[friKeyIdx];
    let satData = finalsData[satKeyIdx];
    let sunData = finalsData[sunKeyIdx];
    console.log("mon data")
    console.log(monData)

  console.log("mon vals")
  console.log(Object.values(monData))
  let monVals = Object.values(monData);
  let monMax = Math.max(...monVals);
  console.log("mon max")
  console.log(monMax)
  let tueMax = Math.max(...Object.values(tueData));
  let wedMax = Math.max(...Object.values(wedData));
  let thursMax = Math.max(...Object.values(thursData));
  let friMax = Math.max(...Object.values(friData));
  let satMax = Math.max(...Object.values(satData));
  let sunMax = Math.max(...Object.values(sunData));

  let monMoodIdx = Object.values(monData).indexOf(monMax);
  console.log(monMoodIdx)
  let monMoods = Object.keys(monData);
  console.log(monMoods)
  let monMood = monMoods[monMoodIdx];
  console.log(monMood)

  if (monMood === '"🙁"') {
      monMood = 0;
  } else if(monMood === '"🙂"') {
    monMood = 2;
  } else {
    monMood = 1;
  }

  console.log(monMood)

  let wedMoodIdx = Object.values(wedData).indexOf(wedMax);
  console.log(wedMoodIdx)
  let wedMoods = Object.keys(wedData);
  console.log(wedMoods)
  let wedMood = wedMoods[wedMoodIdx];
  console.log(wedMood)

  if (wedMood === '"🙁"') {
      wedMood = 0;
  } else if(wedMood === '"🙂"') {
    wedMood = 2;
  } else {
    wedMood = 1;
  }

  console.log(wedMood)

  let tueMoodIdx = Object.values(tueData).indexOf(tueMax);
  console.log(tueMoodIdx)
  let tueMoods = Object.keys(tueData);
  console.log(tueMoods)
  let tueMood = tueMoods[tueMoodIdx];
  console.log(tueMood)

  if (tueMood === '"🙁"') {
      tueMood = 0;
  } else if(tueMood === '"🙂"') {
    tueMood = 2;
  } else {
    tueMood = 1;
  }

  console.log(tueMood)

  let friMoodIdx = Object.values(friData).indexOf(friMax);
  console.log(friMoodIdx)
  let friMoods = Object.keys(friData);
  console.log(friMoods)
  let friMood = friMoods[friMoodIdx];
  console.log(friMood)

  if (friMood === '"🙁"') {
      friMood = 0;
  } else if(friMood === '"🙂"') {
    friMood = 2;
  } else {
    friMood = 1;
  }

  console.log(friMood)

  let satMoodIdx = Object.values(satData).indexOf(satMax);
  console.log(satMoodIdx)
  let satMoods = Object.keys(satData);
  console.log(satMoods)
  let satMood = satMoods[satMoodIdx];
  console.log(satMood)

  if (satMood === '"🙁"') {
      satMood = 0;
  } else if(satMood === '"🙂"') {
    satMood = 2;
  } else {
    satMood = 1;
  }

  console.log(satMood)

  let sunMoodIdx = Object.values(sunData).indexOf(sunMax);
  console.log(sunMoodIdx)
  let sunMoods = Object.keys(sunData);
  console.log(sunMoods)
  let sunMood = sunMoods[sunMoodIdx];
  console.log(sunMood)

  if (sunMood === '"🙁"') {
      sunMood = 0;
  } else if(sunMood === '"🙂"') {
    sunMood = 2;
  } else {
    sunMood = 1;
  }

  console.log(sunMood)

  let thursMoodIdx = Object.values(thursData).indexOf(thursMax);
  console.log(thursMoodIdx)
  let thursMoods = Object.keys(thursData);
  console.log(thursMoods)
  let thursMood = thursMoods[thursMoodIdx];
  console.log(thursMood)

  if (thursMood === '"🙁"') {
      thursMood = 0;
  } else if(thursMood === '"🙂"') {
    thursMood = 2;
  } else {
    thursMood = 1;
  }

  console.log(thursMood)

  var mapping = [
    // order of firebase
    {x: "Mon", value: monMood},
    {x: "Tue", value: tueMood},
    {x: "Wed", value: wedMood},
    {x: "Thurs", value: thursMood},
    {x: "Fri", value: friMood},
    {x: "Sat", value: satMood},
    {x: "Sun", value: sunMood}
  ];
  console.log(mapping)
  // create a pie chart and set the data
  var chart = anychart.line(mapping);
  chart.yScale().minimum(0);
  chart.yScale().maximum(2);
  

  // set title
  chart.title("Mood Levels of Thanksgiving Week");

  var xAxis = chart.xAxis();

var yTitle = chart.yAxis().title();
yTitle.enabled(true);
yTitle.text("0 = 🙁, 1 = 😐, 2 = 🙂");
yTitle.align("bottom");

  // set the container id
  chart.container("turkey" + screen.toString());
  // initiate drawing the chart
  chart.draw();   
});
  }

function addStaticVisWeeklyMoodFinals(screen) {
  firebase.database().ref('robotapi/weeklyMood/FinalsWeek').on('value', (snap)=>{
    console.log("mon moods")
    console.log(snap.val())
    let finalsData = Object.values(snap.val());
    let finalsKeys = Object.keys(snap.val());
    console.log("finals Keys")
    console.log(finalsKeys)
    let monKeyIdx = finalsKeys.indexOf("Mon");
    let tueKeyIdx = finalsKeys.indexOf("Tue");
    let wedKeyIdx = finalsKeys.indexOf("Wed");
    let thursKeyIdx = finalsKeys.indexOf("Thurs");
    let friKeyIdx = finalsKeys.indexOf("Fri");
    let satKeyIdx = finalsKeys.indexOf("Sat");
    let sunKeyIdx = finalsKeys.indexOf("Sun");
    console.log(monKeyIdx)
    let monData = finalsData[monKeyIdx];
    let tueData = finalsData[tueKeyIdx];
    let wedData = finalsData[wedKeyIdx];
    let thursData = finalsData[thursKeyIdx];
    let friData = finalsData[friKeyIdx];
    let satData = finalsData[satKeyIdx];
    let sunData = finalsData[sunKeyIdx];
    console.log("mon data")
    console.log(monData)

  console.log("mon vals")
  console.log(Object.values(monData))
  let monVals = Object.values(monData);
  let monMax = Math.max(...monVals);
  console.log("mon max")
  console.log(monMax)
  let tueMax = Math.max(...Object.values(tueData));
  let wedMax = Math.max(...Object.values(wedData));
  let thursMax = Math.max(...Object.values(thursData));
  let friMax = Math.max(...Object.values(friData));
  let satMax = Math.max(...Object.values(satData));
  let sunMax = Math.max(...Object.values(sunData));

  let monMoodIdx = Object.values(monData).indexOf(monMax);
  console.log(monMoodIdx)
  let monMoods = Object.keys(monData);
  console.log(monMoods)
  let monMood = monMoods[monMoodIdx];
  console.log(monMood)

  if (monMood === '"🙁"') {
      monMood = 0;
  } else if(monMood === '"🙂"') {
    monMood = 2;
  } else {
    monMood = 1;
  }

  console.log(monMood)

  let wedMoodIdx = Object.values(wedData).indexOf(wedMax);
  console.log(wedMoodIdx)
  let wedMoods = Object.keys(wedData);
  console.log(wedMoods)
  let wedMood = wedMoods[wedMoodIdx];
  console.log(wedMood)

  if (wedMood === '"🙁"') {
      wedMood = 0;
  } else if(wedMood === '"🙂"') {
    wedMood = 2;
  } else {
    wedMood = 1;
  }

  console.log(wedMood)

  let tueMoodIdx = Object.values(tueData).indexOf(tueMax);
  console.log(tueMoodIdx)
  let tueMoods = Object.keys(tueData);
  console.log(tueMoods)
  let tueMood = tueMoods[tueMoodIdx];
  console.log(tueMood)

  if (tueMood === '"🙁"') {
      tueMood = 0;
  } else if(tueMood === '"🙂"') {
    tueMood = 2;
  } else {
    tueMood = 1;
  }

  console.log(tueMood)

  let friMoodIdx = Object.values(friData).indexOf(friMax);
  console.log(friMoodIdx)
  let friMoods = Object.keys(friData);
  console.log(friMoods)
  let friMood = friMoods[friMoodIdx];
  console.log(friMood)

  if (friMood === '"🙁"') {
      friMood = 0;
  } else if(friMood === '"🙂"') {
    friMood = 2;
  } else {
    friMood = 1;
  }

  console.log(friMood)

  let satMoodIdx = Object.values(satData).indexOf(satMax);
  console.log(satMoodIdx)
  let satMoods = Object.keys(satData);
  console.log(satMoods)
  let satMood = satMoods[satMoodIdx];
  console.log(satMood)

  if (satMood === '"🙁"') {
      satMood = 0;
  } else if(satMood === '"🙂"') {
    satMood = 2;
  } else {
    satMood = 1;
  }

  console.log(satMood)

  let sunMoodIdx = Object.values(sunData).indexOf(sunMax);
  console.log(sunMoodIdx)
  let sunMoods = Object.keys(sunData);
  console.log(sunMoods)
  let sunMood = sunMoods[sunMoodIdx];
  console.log(sunMood)

  if (sunMood === '"🙁"') {
      sunMood = 0;
  } else if(sunMood === '"🙂"') {
    sunMood = 2;
  } else {
    sunMood = 1;
  }

  console.log(sunMood)

  let thursMoodIdx = Object.values(thursData).indexOf(thursMax);
  console.log(thursMoodIdx)
  let thursMoods = Object.keys(thursData);
  console.log(thursMoods)
  let thursMood = thursMoods[thursMoodIdx];
  console.log(thursMood)

  if (thursMood === '"🙁"') {
      thursMood = 0;
  } else if(thursMood === '"🙂"') {
    thursMood = 2;
  } else {
    thursMood = 1;
  }

  console.log(thursMood)

  var mapping = [
    // order of firebase
    {x: "Mon", value: monMood},
    {x: "Tue", value: tueMood},
    {x: "Wed", value: wedMood},
    {x: "Thurs", value: thursMood},
    {x: "Fri", value: friMood},
    {x: "Sat", value: satMood},
    {x: "Sun", value: sunMood}
  ];
  console.log(mapping)
  // create a pie chart and set the data
  var chart = anychart.line(mapping);
  chart.yScale().minimum(0);
  chart.yScale().maximum(2);
  

  // set title
  chart.title("Mood Levels of Finals Week");

  var xAxis = chart.xAxis();

var yTitle = chart.yAxis().title();
yTitle.enabled(true);
yTitle.text("0 = 🙁, 1 = 😐, 2 = 🙂");
yTitle.align("bottom");

  // set the container id
  chart.container("turkey" + screen.toString());
  // initiate drawing the chart
  chart.draw();   
});
  }

  function addStaticVisWeeklyMood(screen) {
    firebase.database().ref('robotapi/weeklyMood/').on('value', (snap)=>{
      console.log("mon moods")
      console.log(snap.val())
      let finalsData = Object.values(snap.val());
      let finalsKeys = Object.keys(snap.val());
      console.log("finals Keys")
      console.log(finalsKeys)
      
      let monKeyIdx = finalsKeys.indexOf("3-18-2022");
      let tueKeyIdx = finalsKeys.indexOf("4-10-2022");
      let wedKeyIdx = finalsKeys.indexOf("4-11-2022");
      let thursKeyIdx = finalsKeys.indexOf("4-12-2022");
      let friKeyIdx = finalsKeys.indexOf("4-13-2022");
      //let satKeyIdx = finalsKeys.indexOf("Sat");
      //let sunKeyIdx = finalsKeys.indexOf("Sun");
      console.log(monKeyIdx)
      let monData = finalsData[monKeyIdx];
      let tueData = finalsData[tueKeyIdx];
      let wedData = finalsData[wedKeyIdx];
      let thursData = finalsData[thursKeyIdx];
      let friData = finalsData[friKeyIdx];
      //let satData = finalsData[satKeyIdx];
      //let sunData = finalsData[sunKeyIdx];
      console.log("mon data")
      console.log(monData)
  
    console.log("mon vals")
    console.log(Object.values(monData))
    let monVals = Object.values(monData);
    let monMax = Math.max(...monVals);
    console.log("mon max")
    console.log(monMax)
    let tueMax = Math.max(...Object.values(tueData));
    let wedMax = Math.max(...Object.values(wedData));
    let thursMax = Math.max(...Object.values(thursData));
    let friMax = Math.max(...Object.values(friData));
    //let satMax = Math.max(...Object.values(satData));
    //let sunMax = Math.max(...Object.values(sunData));
  
    let monMoodIdx = Object.values(monData).indexOf(monMax);
    console.log(monMoodIdx)
    let monMoods = Object.keys(monData);
    console.log(monMoods)
    let monMood = monMoods[monMoodIdx];
    console.log(monMood)
  
    if (monMood === '"🙁"') {
        monMood = 0;
    } else if(monMood === '"🙂"') {
      monMood = 2;
    } else {
      monMood = 1;
    }
  
    console.log(monMood)
  
    let wedMoodIdx = Object.values(wedData).indexOf(wedMax);
    console.log(wedMoodIdx)
    let wedMoods = Object.keys(wedData);
    console.log(wedMoods)
    let wedMood = wedMoods[wedMoodIdx];
    console.log(wedMood)
  
    if (wedMood === '"🙁"') {
        wedMood = 0;
    } else if(wedMood === '"🙂"') {
      wedMood = 2;
    } else {
      wedMood = 1;
    }
  
    console.log(wedMood)
  
    let tueMoodIdx = Object.values(tueData).indexOf(tueMax);
    console.log(tueMoodIdx)
    let tueMoods = Object.keys(tueData);
    console.log(tueMoods)
    let tueMood = tueMoods[tueMoodIdx];
    console.log(tueMood)
  
    if (tueMood === '"🙁"') {
        tueMood = 0;
    } else if(tueMood === '"🙂"') {
      tueMood = 2;
    } else {
      tueMood = 1;
    }
  
    console.log(tueMood)
  
    let friMoodIdx = Object.values(friData).indexOf(friMax);
    console.log(friMoodIdx)
    let friMoods = Object.keys(friData);
    console.log(friMoods)
    let friMood = friMoods[friMoodIdx];
    console.log(friMood)
  
    if (friMood === '"🙁"') {
        friMood = 0;
    } else if(friMood === '"🙂"') {
      friMood = 2;
    } else {
      friMood = 1;
    }
  
    console.log(friMood)
  /*
    let satMoodIdx = Object.values(satData).indexOf(satMax);
    console.log(satMoodIdx)
    let satMoods = Object.keys(satData);
    console.log(satMoods)
    let satMood = satMoods[satMoodIdx];
    console.log(satMood)
  
    if (satMood === '"🙁"') {
        satMood = 0;
    } else if(satMood === '"🙂"') {
      satMood = 2;
    } else {
      satMood = 1;
    }
  
    console.log(satMood)
  
    let sunMoodIdx = Object.values(sunData).indexOf(sunMax);
    console.log(sunMoodIdx)
    let sunMoods = Object.keys(sunData);
    console.log(sunMoods)
    let sunMood = sunMoods[sunMoodIdx];
    console.log(sunMood)
  
    if (sunMood === '"🙁"') {
        sunMood = 0;
    } else if(sunMood === '"🙂"') {
      sunMood = 2;
    } else {
      sunMood = 1;
    }
  
    console.log(sunMood)
  */
    let thursMoodIdx = Object.values(thursData).indexOf(thursMax);
    console.log(thursMoodIdx)
    let thursMoods = Object.keys(thursData);
    console.log(thursMoods)
    let thursMood = thursMoods[thursMoodIdx];
    console.log(thursMood)
  
    if (thursMood === '"🙁"') {
        thursMood = 0;
    } else if(thursMood === '"🙂"') {
      thursMood = 2;
    } else {
      thursMood = 1;
    }
  
    console.log(thursMood)
  
    var mapping = [
      // order of firebase
      {x: "Mon", value: monMood},
      {x: "Tue", value: tueMood},
      {x: "Wed", value: wedMood},
      {x: "Thurs", value: thursMood},
      {x: "Fri", value: friMood}
      //{x: "Sat", value: satMood},
      //{x: "Sun", value: sunMood}
    ];
    console.log(mapping)
    // create a pie chart and set the data
    var chart = anychart.line(mapping);
    chart.yScale().minimum(0);
    chart.yScale().maximum(2);
    
  
    // set title
    chart.title("Weekly Mood Levels");
  
    var xAxis = chart.xAxis();
  
  var yTitle = chart.yAxis().title();
  yTitle.enabled(true);
  yTitle.text("0 = 🙁, 1 = 😐, 2 = 🙂");
  yTitle.align("bottom");
  
    // set the container id
  chart.container("turkey" + screen.toString());
  // initiate drawing the chart
  chart.draw();  
  });
    }
