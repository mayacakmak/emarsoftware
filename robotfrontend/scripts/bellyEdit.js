var config = new Config();
var db = new Database(config.config, initializeEdit);

// Belly Edit Variables
var currentRobot = 0;
var bellyScreens = [];
var selectedBellyScreen = 0;
var bellySnapshot;

function initializeEdit(uid) {
  if (localStorage.getItem('savedScreens') !== null) {
    displaySavedScreens()
  }

  db.uid = uid;
  isEdit = true;

  var robotParam = Config.getURLParameter('robot');
  if (robotParam != null) currentRobot = Number(robotParam);
  console.log('currentRobot: ' + currentRobot);

  var dbUserRef = firebase.database().ref('/users/' + Database.uid + '/');
  dbUserRef.on('value', currentUserDataChanged);

  var dbInputRef = firebase
    .database()
    .ref('/robots/' + currentRobot + '/customAPI/inputs/bellyScreens/');
  // dbInputRef.on('value', updateBellyScreenList);
  dbInputRef.on('value', renderBellyScreenList);

  var dbUserRef = firebase.database().ref('/users/');
  dbUserRef.on('value', updateAllUsersFaceList);

  var dbUserRef = firebase.database().ref('/users/' + Database.uid + '/');
  dbUserRef.on('value', currentUserDataChanged);
}

function currentUserDataChanged(snapshot) {
  currentUserData = snapshot.val();
  // updateUserFaceList();
  // updateFace();
  // updateFaceEditor();
}

function updateAllUsersFaceList() {}

function setAllBellyColors(target) {
  for (let i = 0; i < bellyScreens.length; i++) {
    bellyScreens[i][target.name] = target.value;
  }
  var dir = 'robots/' + currentRobot + '/customAPI/inputs/';
  var dbRef = firebase.database().ref(dir);
  var updates = { bellyScreens: bellyScreens };
  dbRef.update(updates);
}

function renderSelectedBellyScreen(snapshot) {
  // bellySnapshot = snapshot;
  bellyScreens = snapshot.val();
  BellyScreenRenders = [];
  let bellyHTML = '';
  if (bellyScreens != undefined && bellyScreens.length > 0) {
    var bellyDiv = document.getElementById('bellyEdit');
    var screen = bellyScreens[selectedBellyScreen];
    var i = selectedBellyScreen;
    progress = (i * 100)/bellyScreens.length;
    var exitButtonChecked,
      faqButtonChecked, progressBarChecked,
      backButtonChecked, faqButtonContent = '';
    if (screen.navButtonList) {
      exitButtonChecked =
        screen.navButtonList.exitButton !== undefined &&
        screen.navButtonList.exitButton.isShown
          ? 'checked'
          : '';
      progressBarChecked =
          screen.navButtonList.progressBar !== undefined &&
          screen.navButtonList.progressBar.isShown
            ? 'checked'
            : '';
      faqButtonChecked =
        screen.navButtonList.faqButton !== undefined &&
        screen.navButtonList.faqButton.isShown
          ? 'checked'
          : '';
      faqButtonContent = (screen.navButtonList.faqButton && screen.navButtonList.faqButton.content) ? screen.navButtonList.faqButton.content : '';
      backButtonChecked =
        screen.navButtonList.backButton !== undefined &&
        screen.navButtonList.backButton.isShown
          ? 'checked'
          : '';
    }
    console.log(faqButtonChecked);
    bellyHTML =
      "<div class='left-aligned'> <input type='text' class='screen-name' name='name' onblur='changeScreenElement(this, " +
      i +
      ")' value='" +
      screen.name +
      "'> <button class='btn btn-danger btn-delete' onclick='removeScreen(" +
      i +
      `)'> Delete screen </button>
      </div>
      <div class='center-aligned'>
      <div class="dropdown">
        <button class="btn btn-sm btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          Templates
        </button>
        <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
          <button class="dropdown-item" onclick='setLayout(this)'>Text</button>
          <button class="dropdown-item" onclick='setLayout(this)'>Slider</button>
          <button class="dropdown-item" onclick='setLayout(this)'>Buttons</button>
          <button class="dropdown-item" onclick='setLayout(this)'>Checkboxes</button>
          <button class="dropdown-item" onclick='setLayout(this)'>Images</button>
          <button class="dropdown-item" onclick='setLayout(this)'>Unsaved User Text Input</button>
          <button class="dropdown-item" onclick='setLayout(this)'>Saved User Text Input</button>
        </div>
      </div>
      <div class="dropdown">
        <button class="btn btn-sm btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          Title Font
        </button>
        <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
          <button class="dropdown-item" onclick='setFontFamily("instructionLarge", this)'>Arial</button>
          <button class="dropdown-item" onclick='setFontFamily("instructionLarge", this)'>Courier</button>
          <button class="dropdown-item" onclick='setFontFamily("instructionLarge", this)'>Times</button>
        </div>
      </div>
      <div class="dropdown">
        <button class="btn btn-sm btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          Subtitle Font
        </button>
        <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
          <button class="dropdown-item" onclick='setFontFamily("instructionSmall", this)'>Arial</button>
          <button class="dropdown-item" onclick='setFontFamily("instructionSmall", this)'>Courier</button>
          <button class="dropdown-item" onclick='setFontFamily("instructionSmall", this)'>Times</button>
        </div>
      </div>
      <div class="dropdown">   
        <button class="btn btn-sm btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          Icons 
        </button>  
        <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">  
              <a class="dropdown-item" onclick='uploadIcon("fa fa-at")'> <i class="fa fa-at"></i> At </a>  
              <a class="dropdown-item" onclick='uploadIcon("fa fa-address-book")'> <i class="fa fa-address-book"></i> Contact </a>  
              <a class="dropdown-item" onclick='uploadIcon("fa fa-asterisk")'> <i class="fa fa-asterisk"></i> Asterisk </a>  
              <a class="dropdown-item" onclick='uploadIcon("fa fa-book")'><i class="fa fa-book"></i> Book </a>  
              <a class="dropdown-item" onclick='uploadIcon("fa fa-hand-peace-o")'><i class="fa fa-hand-peace-o"></i> Victory </a>  
              <a class="dropdown-item" onclick='uploadIcon("fa fa-hand-paper-o")'><i class="fa fa-hand-paper-o"></i> Hand </a>  
              <a class="dropdown-item" onclick='uploadIcon("fa fa-arrow-circle-o-up")'><i class="fa fa-arrow-circle-o-up"></i> Up </a>  
              <a class="dropdown-item" onclick='uploadIcon("fa fa-arrow-circle-o-down")'><i class="fa fa-arrow-circle-o-down"></i> Down </a>  
              <a class="dropdown-item" onclick='uploadIcon("fa fa-arrow-circle-o-left")'><i class="fa fa-arrow-circle-o-left"></i> Left </a>  
              <a class="dropdown-item" onclick='uploadIcon("fa fa-arrow-circle-o-right")'><i class="fa fa-arrow-circle-o-right"></i> Right </a>  
        </div>  
      </div>  
      <div style="display: flex; flex-direction: row;">
      <input type='color' onchange='setScreenColor(this)' name='backgroundColor'
      value='` +
      screen.backgroundColor +
      `'> <div class='mr-2'> Color </div>
      </div>
      </div>
      <div style="display: flex; flex-direction: row; margin-top: 4px; margin-bottom: 4px;">
          <input type='checkbox' name='exitButton' id='exitButton' onchange='changeScreenElement(this, ` +
      selectedBellyScreen +
      `)' ` +
      exitButtonChecked +
      `> <div class='mr-2'>Exit Button</div>
          <input type='checkbox' name='backButton' id='backButton' onchange='changeScreenElement(this, ` +
      selectedBellyScreen +
      `)' ` +
      backButtonChecked +
      `> <div class='mr-2'>Back Button</div>
          <input type='checkbox' name='progressBar' id='progressBar' onchange='changeScreenElement(this, ` +
      selectedBellyScreen +
      `)' ` +
      progressBarChecked +
      `> <div class='mr-2'>Progress Bar</div>
          <input type='checkbox' name='faqButton' id='faqButton' onchange='changeScreenElement(this, ` +
      selectedBellyScreen +
      `)' ` +
      faqButtonChecked +
      `> <div class='mr-2'>Question Button</div>
      <div class='mr-2'>Question Button Content:</div>
      <input type='text' name='faqButtonContent' onblur='changeScreenElement(this, ` +
      i +
      `)' value='` +
      faqButtonContent +
      `'>
      </div>`;
    var instructionLargeChecked = '';
    var instructionSmallChecked = '';
    var sliderChecked = '';
    var checkboxesChecked = '';
    var buttonsChecked = '';
    var backgroundColor = '#ffffff';

    if (screen.instructionLarge.isShown) instructionLargeChecked = 'checked';
    if (screen.instructionSmall.isShown) instructionSmallChecked = 'checked';
    if (screen.slider.isShown) sliderChecked = 'checked';
    if (screen.checkboxes.isShown) checkboxesChecked = 'checked';
    if (screen.buttons.isShown) buttonsChecked = 'checked';
    if (screen.backgroundColor) backgroundColor = screen.backgroundColor;

    bellyHTML +=
      "<div class='screen-box-outer mb-4' style='margin-bottom: 0rem !important; background-color: " +
      backgroundColor +
      ";'><div class='screen-box-inner'>";

    if (screen.instructionLarge.isShown) {
      bellyHTML +=
        "<div class='screen-element'> <input type='text' class='instruction-large-setup' name='instructionLarge' onblur='changeScreenElement(this, " +
        i +
        ")' value='" +
        screen.instructionLarge.text.replace(/'/g, '&#39;') +
        "'> </div> ";
    }

    if (screen.instructionSmall.isShown) {
      bellyHTML +=
        "<div class='screen-element'> <input type='text' class='instruction-small-setup' name='instructionSmall' onblur='changeScreenElement(this, " +
        i +
        ")' value='" +
        screen.instructionSmall.text.replace(/'/g, '&#39;') +
        "'> </div>";
    }

    if (screen.textInput && screen.textInput.isShown) {
      bellyHTML += "<div class='screen-element mt-4 style='z-index: 2'>";
      bellyHTML +=
        '<textarea id="textInput" name="textInput" rows="4" cols="50"';
      bellyHTML +=
        'onchange="changeScreenElement(this, ' +
        i +
        ')"';
      bellyHTML +=
        '>' +
        (screen.textInput.text ? screen.textInput.text : '') +
        '</textarea>';
      
      bellyHTML += '</div>';
    }

    if (screen.savedTextInput && screen.savedTextInput.isShown) {
      bellyHTML += "<div class='screen-element mt-4 style='z-index: 2'>";
      bellyHTML +=
        '<textarea id="savedTextInput" name="savedTextInput" rows="4" cols="50"';
      bellyHTML +=
        'onchange="changeScreenElement(this, ' +
        i +
        ')"';
      bellyHTML += '>' + (screen.savedTextInput.text ? screen.savedTextInput.text : '') + '</textarea>';
      bellyHTML += '</div>';
    }

    if (screen.images && screen.images.isShown && screen.images.list) {
      bellyHTML += "<div style='screen-element mt-4 flex-wrap;'>";
      screen.images.list.forEach((element, index) => {
        console.log(element, index);
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
        console.log(index, index.toString(), typeof index);
        bellyHTML +=
          "<label for='image" +
          index.toString() +
          "'><input id='image" +
          index.toString() +
          "' type='file' accept='image/*' style='display:none' onchange='uploadImage(this, " +
          index.toString() +
          ")'/><div><img src='" +
          element.path +
          "' style='border: none; " +
          position +
          "width='" +
          element.size.x * 0.6 +
          "' height='" +
          element.size.y * 0.6 +
          "'/></div>";
        bellyHTML +=
          "<div class='delete-btn-button'><button name='imageDelete' onclick='changeScreenElement(this, " +
          selectedBellyScreen +
          ',' +
          index +
          ")' class='btn btn-secondary btn-circle-sm'>X</button></div>";
        bellyHTML += '</label>';
      });
      bellyHTML += '</div>';
    }

    if (screen.slider.isShown) {
      bellyHTML += "<div class='screen-element mt-4'>";
      bellyHTML +=
        "<div class='min-value'> <input class='min' type='text' name='sliderMin' onblur='changeScreenElement(this, " +
        i +
        ")' value='" +
        screen.slider.min +
        "'></div>";
      bellyHTML +=
        "</i><input type='range' class='screen-slider' name='slider' onchange='changeScreenElement(this, " +
        i +
        ")' value='" +
        screen.slider.current +
        "' min='0' max='100'>";
      bellyHTML +=
        "<div class='max-value'> <input class='max' type='text' class='' name='sliderMax' onblur='changeScreenElement(this, " +
        i +
        ")' value='" +
        screen.slider.max +
        "'></div>";
      bellyHTML += '</div>';
    }

    if (screen.checkboxes.isShown) {
      bellyHTML += "<div class='screen-element mt-4 flex-wrap'>";
      if (screen.checkboxes.names != undefined) {
        for (var j = 0; j < screen.checkboxes.names.length; j++) {
          var name = screen.checkboxes.names[j];
          bellyHTML +=
            "<div class='deletable-button mr-2 border border-light'>";
          bellyHTML += "<div><input type='checkbox'>" + name + '</div>';
          bellyHTML +=
            "<div class='delete-checkbox-button'><button name='checkboxDelete'  onclick='changeScreenElement(this, " +
            i +
            ',' +
            j +
            ")' class='btn btn-light btn-circle-sm'>X</button></div>";
          bellyHTML += '</div>';
        }
      }
      bellyHTML += '</div>';
      bellyHTML += "<div class='screen-element justify-content-end mt-2'>";
      bellyHTML +=
        "<div><input type='text' class='right-aligned mr-1' id='checkboxAdd" +
        i +
        "' value='Choice name'>";
      bellyHTML +=
        "<button name='checkboxAdd' onclick='changeScreenElement(this, " +
        i +
        ")' class='btn btn-primary btn-add'>Add checkbox</button>";
      bellyHTML += '</div>';
    }

    if (screen.buttons.isShown) {
      bellyHTML += "<div class='screen-element mt-4 flex-wrap'>";
      if (screen.buttons.list != undefined) {
        for (var j = 0; j < screen.buttons.list.length; j++) {
          var name = screen.buttons.list[j].name;
          bellyHTML += "<div class='deletable-button mx-1'>";
          bellyHTML +=
            "<div><button class='btn btn-secondary' disabled style='font-size: 8pt;' >" +
            name;
          if (screen.buttons.list[j].url) {
            bellyHTML +=
              '<img  src=' +
              screen.buttons.list[j].url +
              " width='20' height='20'/>";
          }
          bellyHTML += '</button>';

          bellyHTML += '</div>';
          bellyHTML +=
            "<div class='delete-btn-button'><button name='buttonDelete'  onclick='changeScreenElement(this, " +
            i +
            ',' +
            j +
            ")' class='btn btn-secondary btn-circle-sm'>X</button>";
          bellyHTML += '</div>';
          bellyHTML += '</div>';
        }
      }
      bellyHTML += '</div>';
      bellyHTML += "<div class='screen-element justify-content-end mt-2'>";
      bellyHTML +=
        "<div class='display-flex justify-content-space-between'><input type='text' class='right-aligned mr-1' id='buttonAdd" +
        i +
        "' value='Button name'>";
      bellyHTML +=
        "<button name='buttonAdd' onclick='changeScreenElement(this, " +
        i +
        ")' class='btn btn-primary btn-add'>Add button</button>";
      if (screen.images && screen.images.isShown) {
        bellyHTML +=
          "<button name='imageAdd' onclick='changeScreenElement(this, " +
          i +
          ")' class='btn btn-primary btn-add'>Add Image</button>";
      }
      bellyHTML += '</div>';

      bellyHTML += '</div>';
    }

    bellyHTML += '</div></div>';
  }

  // bellyHTML +=
  //   "<div><button class='btn btn-primary btn-add' onclick='addScreen()'>Add new screen</button></div> </div>";
  bellyDiv.innerHTML = bellyHTML;
}

function setNavButton(target) {
  switch (target.name) {
    case 'exitButton':
      return;
    case 'backButton':
      return;
    case 'progressBar':
      return;
    case 'faqButton':
      return;
    default:
      return;
  }
}


function renderCircle() {
  const canvas = document.getElementById('myCanvas');
  const context = canvas.getContext('2d');
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = 70;

  context.beginPath();
  context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
  context.fillStyle = 'green';
  context.fill();
  context.lineWidth = 5;
  context.strokeStyle = '#003300';
  context.stroke();
}


function addDynamicMoodViz() {
  let btn1 = document.createElement("button");
  btn1.innerHTML = "&#128578;";
  btn1.type = "submit";
  btn1.name = "formBtn";
  btn1.style.position = "relative"; 
  btn1.style.background= '#008000';
  btn1.style.width = '70px'; // setting the width 
  btn1.style.height = '35px'; // setting the height
  btn1.style.fontSize = '25px'; 
  document.body.appendChild(btn1);
  // get firebase data
  // occur1 = firebase, occur2, occur3
  //onclick1="rendercircle", occur1++, update firebase
  // rendering 1 time 1 circle
  // javascript canvas draw shape
  // update firebase to store occurs
  firebase.database().ref('robotapi/dynamicMood').on('value', (snap)=>{
    console.log("dynamic community mood")
    console.log(snap.val())
    let data = snap.val();
    let dataVal = Object.values(data);
    let occurHigh = dataVal[2];
    console.log(occurHigh)
    let occurLow = dataVal[1];
    let occurMed = dataVal[0];
    btn1.onclick = function() {
      occurHigh++;
      console.log(occurHigh)
      renderCircle();
      var firebaseRef = firebase.database().ref('robotapi/dynamicMood');
      var updateOccur = {"🙂" : occurHigh, "🙁": occurLow, "😐": occurMed};
      console.log(updateOccur)
      firebaseRef.update(updateOccur);
    }
  });


  let btn2 = document.createElement("button");
  btn2.innerHTML = "&#128528;";
  btn2.type = "submit";
  btn2.name = "formBtn";
  btn2.style.position = "relative"; 
  btn2.style.background= '#FFFFFF';
  btn2.style.width = '70px'; // setting the width 
  btn2.style.height = '35px'; // setting the height
  btn2.style.fontSize = '25px'; 
  document.body.appendChild(btn2);

  let btn3 = document.createElement("button");
  btn3.innerHTML = "&#128577;";
  btn3.type = "submit";
  btn3.name = "formBtn";
  btn3.style.position = "relative";
  btn3.style.background= '#FF0000';
  btn3.style.width = '70px'; // setting the width 
  btn3.style.height = '35px'; // setting the height
  btn3.style.fontSize = '25px'; 
  document.body.appendChild(btn3);
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
  let low = (dataVal[0] * total);
  console.log(low)
  console.log("med")
  let med = (dataVal[1] * total);
  console.log(med)
  console.log("high")
  let high = (dataVal[2] * total);
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
    {x: "🙁", value: vals[0]},
    {x: "😐", value: vals[1]},
    {x: "🙂", value: vals[2]}
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
  chart.container("turkey" + screen);
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
        let med = (dataVal[0] * total);
        console.log(med)
        console.log("low")
        let low = (dataVal[1] * total);
        console.log(low)
        console.log("high")
        let high = (dataVal[2] * total);
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
          {x: "🙂", value: vals[0]},
          {x: "😐", value: vals[1]},
          {x: "🙁", value: vals[2]}
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
        chart.container("turkey" + screen);
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

function addStaticVisWeeklyStressThanksgiving(screen) {
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

function uploadImage(target, index) {
  console.log(target, index);
  var file = document.querySelectorAll('input[type=file]')[index].files[0];
  var storageRef = firebase.storage().ref();
  var split = target.value.split('\\');
  console.log(db);
  var ref = storageRef.child(
    'images/' + db.uid + '/' + split[split.length - 1]
  );
  ref.put(file).then(async function (snapshot) {
    url = await snapshot.ref.getDownloadURL();
    // console.log('url', url);
    // Update Image
    changeScreenElement(
      {
        index,
        value: url,
        name: 'images',
      },
      selectedBellyScreen,
      ''
    );
  });
}

function setScreenColor(element) {
  addRemoveScreenElements(element, selectedBellyScreen);
}

function setFontFamily(name, element) {
  var screenID = selectedBellyScreen;
  bellyScreens[screenID][name].fontFamily = element.innerHTML;

  var dir = 'robots/' + currentRobot + '/customAPI/inputs/';
  var dbRef = firebase.database().ref(dir);
  var updates = { bellyScreens: bellyScreens };
  dbRef.update(updates);
}

function setLayout(element) {
  switch (element.innerHTML) {
    case 'Text':
      addRemoveMultipleElements(
        [
          {
            name: 'instructionLarge',
            checked: true,
          },
          {
            name: 'instructionSmall',
            checked: true,
          },
          {
            name: 'slider',
            checked: false,
            value: 50,
          },
          {
            name: 'checkboxes',
            checked: false,
          },
          {
            name: 'buttons',
            checked: true,
          },
          {
            name: 'backgroundColor',
            checked: true,
          },
          {
            name: 'images',
            checked: false,
          },
          {
            name: 'textInput',
            checked: false,
          },
          ,
          {
            name: 'savedTextInput',
            checked: false,
          },
        ],
        selectedBellyScreen
      );
      return;
    case 'Slider':
      addRemoveMultipleElements(
        [
          {
            name: 'instructionLarge',
            checked: true,
          },
          {
            name: 'instructionSmall',
            checked: true,
          },
          {
            name: 'slider',
            checked: true,
            value: 50,
          },
          {
            name: 'checkboxes',
            checked: false,
          },
          {
            name: 'buttons',
            checked: true,
          },
          {
            name: 'backgroundColor',
            checked: true,
          },
          {
            name: 'images',
            checked: false,
          },
          {
            name: 'textInput',
            checked: false,
          },
          {
            name: 'savedTextInput',
            checked: false,
          },
        ],
        selectedBellyScreen
      );
      return;
    case 'Buttons':
      addRemoveMultipleElements(
        [
          {
            name: 'instructionLarge',
            checked: true,
          },
          {
            name: 'instructionSmall',
            checked: true,
          },
          {
            name: 'slider',
            checked: false,
            value: 50,
          },
          {
            name: 'checkboxes',
            checked: false,
          },
          {
            name: 'buttons',
            checked: true,
          },
          {
            name: 'backgroundColor',
            checked: true,
          },
          {
            name: 'images',
            checked: false,
          },
          {
            name: 'textInput',
            checked: false,
          },
          {
            name: 'savedTextInput',
            checked: false,
          },
        ],
        selectedBellyScreen
      );
      return;
    case 'Checkboxes':
      addRemoveMultipleElements(
        [
          {
            name: 'instructionLarge',
            checked: true,
          },
          {
            name: 'instructionSmall',
            checked: true,
          },
          {
            name: 'slider',
            checked: false,
            value: 50,
          },
          {
            name: 'checkboxes',
            checked: true,
          },
          {
            name: 'buttons',
            checked: true,
          },
          {
            name: 'backgroundColor',
            checked: true,
          },
          {
            name: 'images',
            checked: false,
          },
          {
            name: 'textInput',
            checked: false,
          },
          {
            name: 'savedTextInput',
            checked: false,
          },
        ],
        selectedBellyScreen
      );
      return;
    case 'Images':
      addRemoveMultipleElements(
        [
          {
            name: 'instructionLarge',
            checked: true,
          },
          {
            name: 'instructionSmall',
            checked: true,
          },
          {
            name: 'slider',
            checked: false,
            value: 50,
          },
          {
            name: 'checkboxes',
            checked: false,
          },
          {
            name: 'buttons',
            checked: true,
          },
          {
            name: 'backgroundColor',
            checked: true,
          },
          {
            name: 'images',
            checked: true,
          },
          {
            name: 'textInput',
            checked: false,
          },
          {
            name: 'savedTextInput',
            checked: false,
          },
        ],
        selectedBellyScreen
      );
      return;
    case 'Unsaved User Text Input':
      addRemoveMultipleElements(
        [
          {
            name: 'instructionLarge',
            checked: true,
          },
          {
            name: 'instructionSmall',
            checked: true,
          },
          {
            name: 'slider',
            checked: false,
            value: 50,
          },
          {
            name: 'checkboxes',
            checked: false,
          },
          {
            name: 'buttons',
            checked: true,
          },
          {
            name: 'backgroundColor',
            checked: true,
          },
          {
            name: 'images',
            checked: false,
          },
          {
            name: 'textInput',
            checked: true,
          },
          {
            name: 'savedTextInput',
            checked: false,
          },
        ],
        selectedBellyScreen
      );
      return;
    case 'Saved User Text Input':
      addRemoveMultipleElements(
        [
          {
            name: 'instructionLarge',
            checked: true,
          },
          {
            name: 'instructionSmall',
            checked: true,
          },
          {
            name: 'slider',
            checked: false,
            value: 50,
          },
          {
            name: 'checkboxes',
            checked: false,
          },
          {
            name: 'buttons',
            checked: true,
          },
          {
            name: 'backgroundColor',
            checked: true,
          },
          {
            name: 'images',
            checked: false,
          },
          {
            name: 'textInput',
            checked: false,
          },
          {
            name: 'savedTextInput',
            checked: true,
          },
        ],
        selectedBellyScreen
      );
      return;
    default:
      return;
  }
}

function changeSelectedBellyScreen(event, index) {
  setTimeout(() => {
    renderVisuals();
    vizSettings();
  }, 5)

  selectedBellyScreen = index;
  renderBellyScreenList(bellySnapshot);
  renderSelectedBellyScreen(bellySnapshot);
}

function renderBellyScreenList(snapshot) {
  bellySnapshot = snapshot;
  bellyScreens = snapshot.val();
  renderSelectedBellyScreen(snapshot);
  BellyScreenRenders = [];
  var belly = new Belly(currentRobot, 'x-small', 'width');
  belly.bellyScreens = bellyScreens;
  var bellyHTML = '';
  var bellyCardDiv = document.getElementById('bellyCard');
  if (bellyScreens != undefined && bellyScreens.length > 0) {
    bellyHTML += '<div>';
    for (let i = 0; i < bellyScreens.length; i++) {
      let onclick = 'this,' + i;
      let selectedStyle =
        i === selectedBellyScreen
          ? 'border-style: solid; border-width: 5px; border-color: green;'
          : 'border-style: solid; border-width: 1px; border-color: black;';
      bellyHTML +=
        "<div draggable='true' ondrop='onDrop(event);' ondragover='onDragOver(event);' class='screen-box-inner-list overflow-auto' style='position: relative; margin-top: 1rem; margin-bottom: 1rem; background-color: white; " +
        selectedStyle +
        "' id='" +
        'screenDiv' +
        i +
        "' " +
        "onclick='changeSelectedBellyScreen(" +
        onclick +
        ");'" +
        "><span class='spinner-border spinner-border-sm' role='status' aria-hidden='true'></span></div>";
    }
    bellyHTML += "</div>";
    bellyCardDiv.innerHTML = bellyHTML;
    for (var i = 0; i < bellyScreens.length; i++) {
      belly.scale = 'small';
      belly.resizeAxis = 'width';
      renderBellyScreen(i, belly, 'screenDiv' + i);
    }
  }
  Belly.updateRobotBelly(snapshot);
}

function addRemoveScreenElements(target, screenID) {
  // console.log(target.name, target.value);
  if (target.name.includes('backgroundColor'))
    bellyScreens[screenID][target.name] = target.value;
  if (target.checked) bellyScreens[screenID][target.name].isShown = 1;
  else bellyScreens[screenID][target.name].isShown = 0;

  var dir = 'robots/' + currentRobot + '/customAPI/inputs/';
  var dbRef = firebase.database().ref(dir);
  var updates = { bellyScreens: bellyScreens };
  dbRef.update(updates);
}

function addRemoveMultipleElements(targets, screenID) {
  targets.forEach((target) => {
    if (target.name.includes('backgroundColor'))
      bellyScreens[screenID][target.name] = target.value;
    if (target.checked) {
      if (bellyScreens[screenID][target.name]) {
        bellyScreens[screenID][target.name].isShown = 1;
      } else {
        bellyScreens[screenID][target.name] = {
          isShown: 1,
        };
      }
    } else {
      if (!bellyScreens[screenID][target.name]) {
        bellyScreens[screenID][target.name] = {};
      }
      bellyScreens[screenID][target.name].isShown = 0;
    }
  });

  var dir = 'robots/' + currentRobot + '/customAPI/inputs/';
  var dbRef = firebase.database().ref(dir);
  var updates = { bellyScreens: bellyScreens };
  dbRef.update(updates);
}

function changeScreenElement(target, screenID, itemID) {
  if (target.name == 'name') bellyScreens[screenID].name = target.value;

  if (target.name == 'instructionLarge')
    bellyScreens[screenID].instructionLarge.text = target.value;

  if (target.name == 'instructionSmall')
    bellyScreens[screenID].instructionSmall.text = target.value;

  if (target.name == 'slider')
    bellyScreens[screenID].slider.current = target.value;

  if (target.name == 'sliderMin')
    bellyScreens[screenID].slider.min = target.value;

  if (target.name == 'sliderMax')
    bellyScreens[screenID].slider.max = target.value;

  if (target.name == 'buttonAdd') {
    var buttonNameTextInput = document.getElementById('buttonAdd' + screenID);
    if (bellyScreens[screenID].buttons.list == undefined)
      bellyScreens[screenID].buttons.list = [];
    bellyScreens[screenID].buttons.list.push({
      name: buttonNameTextInput.value,
      lastPressed: 0,
    });
  }


  if (target.name == 'imageAdd') {
    if (bellyScreens[screenID].images.list == undefined)
      bellyScreens[screenID].images.list = [];
    bellyScreens[screenID].images.list.push({
      location: {
        x: 0,
        y: 0,
      },
      path:
        'https://firebasestorage.googleapis.com/v0/b/emar-database.appspot.com/o/images%2Fnoun_Image_3565539.png?alt=media&token=a22bd7fd-677e-4b38-8913-76e74cf61bd2',
      size: {
        // Changes new images
        x: 150,
        y: 150,
      },
      position: "relative",
      alignment: ""
    });
  }

  if (target.name == 'images') {
    bellyScreens[screenID].images.list[target.index].path = target.value;
  }

  if (target.name == 'buttonAddImage') {
    https: var buttonNameTextInput = document.getElementById(
      'buttonAdd' + screenID
    );
    if (bellyScreens[screenID].buttons.list == undefined)
      bellyScreens[screenID].buttons.list = [];
    bellyScreens[screenID].buttons.list.push({
      name:
        "<p style='font-size:16;color:white'>" +
        buttonNameTextInput.value +
        '</p>',
      path:
        'https://firebasestorage.googleapis.com/v0/b/emar-database.appspot.com/o/images%2Fnoun_Image_3565539.png?alt=media&token=a22bd7fd-677e-4b38-8913-76e74cf61bd2',
      lastPressed: 0,
    });
  }

  if (target.name == 'buttonDelete') {
    bellyScreens[screenID].buttons.list.splice(itemID, 1);
  }

  if (target.name == 'imageDelete') {
    bellyScreens[screenID].images.list.splice(itemID, 1);
  }

  if (target.name == 'checkboxAdd') {
    var buttonNameTextInput = document.getElementById('checkboxAdd' + screenID);
    if (bellyScreens[screenID].checkboxes.names == undefined)
      bellyScreens[screenID].checkboxes.names = [];
    bellyScreens[screenID].checkboxes.names.push(buttonNameTextInput.value);
  }

  if (target.name == 'checkboxDelete') {
    bellyScreens[screenID].checkboxes.names.splice(itemID, 1);
  }

  if (target.name == 'textInput') {
    bellyScreens[screenID].textInput.text = document.getElementById(
      target.id
    ).value;
  }

  if (target.name == 'savedTextInput') {
    bellyScreens[screenID].savedTextInput.text = document.getElementById(
      target.id
    ).value;
  }

  if (target.name == 'exitButton') {
    if (!bellyScreens[screenID].navButtonList) {
      bellyScreens[screenID].navButtonList = {};
    }
    bellyScreens[screenID].navButtonList = {
      ...bellyScreens[screenID].navButtonList,
      exitButton: {
        isShown: document.getElementById(target.id).checked ? 1 : 0,
      },
    };
  }

  if (target.name == 'backButton') {
    if (!bellyScreens[screenID].navButtonList) {
      bellyScreens[screenID].navButtonList = {};
    }
    bellyScreens[screenID].navButtonList = {
      ...bellyScreens[screenID].navButtonList,
      backButton: {
        isShown: document.getElementById(target.id).checked ? 1 : 0,
        name: 'back',
      },
    };
  }

  if (target.name == 'progressBar') {
    if (!bellyScreens[screenID].navButtonList) {
      bellyScreens[screenID].navButtonList = {};
    }
    bellyScreens[screenID].navButtonList = {
      ...bellyScreens[screenID].navButtonList,
      progressBar: {
        isShown: document.getElementById(target.id).checked ? 1 : 0,
        name: 'progress',
      },
    };
  }

  if (target.name == 'faqButton') {
    if (!bellyScreens[screenID].navButtonList) {
      bellyScreens[screenID].navButtonList = {};
    }
    bellyScreens[screenID].navButtonList = {
      ...bellyScreens[screenID].navButtonList,
      faqButton: {
        isShown: document.getElementById(target.id).checked ? 1 : 0,
        content: '',
      },
    };
  }

  if (target.name == 'faqButtonContent') {
    if (!bellyScreens[screenID].navButtonList) {
      bellyScreens[screenID].navButtonList = {};
    }
    bellyScreens[screenID].navButtonList = {
      ...bellyScreens[screenID].navButtonList,
      faqButton: {
        isShown: document.getElementById('faqButton').checked ? 1 : 0,
        content: target.value,
      },
    };
  }

  var dir = 'robots/' + currentRobot + '/customAPI/inputs/';
  var dbRef = firebase.database().ref(dir);
  var updates = { bellyScreens: bellyScreens };
  dbRef.update(updates);
}

function removeScreen(index) {
  var dir = 'robots/' + currentRobot + '/customAPI/inputs/';
  console.log(bellyScreens.length);
  bellyScreens.splice(index, 1);
  console.log(bellyScreens.length);
  console.log('upding', bellyScreens.length);
  var dbRef = firebase.database().ref(dir);
  dbRef.update({ bellyScreens: bellyScreens });
  changeSelectedBellyScreen(
    undefined,
    selectedBellyScreen > 0 ? selectedBellyScreen - 1 : 0
  );
}

function addScreen() {
  var dir = 'robots/' + currentRobot + '/customAPI/inputs/';
  if (bellyScreens == undefined) bellyScreens = [];
  var screenName = 'Screen-' + (bellyScreens.length + 1);
  var blankScreen = {
    instructionLarge: { isShown: 0, text: '' },
    instructionSmall: { isShown: 0, text: '' },
    slider: { isShown: 0, min: '0', max: '100', current: 50 },
    checkboxes: { isShown: 0, names: ['Choice 1'], values: [0] },
    buttons: { isShown: 0, list: [{ name: 'Continue', lastPressed: 0 }] },
    name: screenName,
  };
  bellyScreens.push(blankScreen);
  var dbRef = firebase.database().ref(dir);
  dbRef.update({ bellyScreens: bellyScreens });
}

let dragTarget = null;
let dropTarget = null;

function onDragOver(event) {
  if (dragTarget === null) {
    // Store object being dragged
    console.log("onDragOver", event.target);
    dragTarget = event.target;
    }
  event.preventDefault();
}

function onDrop(event) {
  if (dropTarget === null) {
    // Store drop location
    console.log("onDrop", event.target);
    dropTarget = event.target;

    // Switch position of drag and drop in array
    dragId = dragTarget.id.split('screenDiv')[1];
    dropId = dropTarget.id.split('screenDiv')[1];
    if (dragId !== dropId) {
      console.log("Switch ", dragId, "and", dropId);
      let temp = bellyScreens[dragId];
      bellyScreens[dragId] = bellyScreens[dropId];
      bellyScreens[dropId] = temp; 
      console.log(bellyScreens);
      var dir = 'robots/' + currentRobot + '/customAPI/inputs/';
      var dbRef = firebase.database().ref(dir);
      var updates = { bellyScreens: bellyScreens };
      dbRef.update(updates);
    }
    dropTarget = null;
    dragTarget = null;
  }
}

// Takes an image id and sets the size for that image to the
// given x and y values     
function resizeImage(id, x, y, background) {
  console.log("resize image! " + id + " " + x + " " + y);

  console.log(bellyScreens[selectedBellyScreen].images.list[id])

  bellyScreens[selectedBellyScreen].images.list[id].size.x = x;
  bellyScreens[selectedBellyScreen].images.list[id].size.y = y;

  console.log(bellyScreens[selectedBellyScreen].images.list[id])

  var dir = 'robots/' + currentRobot + '/customAPI/inputs/';
  var dbRef = firebase.database().ref(dir);
  var updates = { bellyScreens: bellyScreens };
  dbRef.update(updates);
}

function alignImage(id, alignment) {
  console.log(bellyScreens[selectedBellyScreen].images.list[id]);
  bellyScreens[selectedBellyScreen].images.list[id].alignment = alignment;

  var dir = 'robots/' + currentRobot + '/customAPI/inputs/';
  var dbRef = firebase.database().ref(dir);
  var updates = { bellyScreens: bellyScreens };
  dbRef.update(updates);
}

// Iterates through list of images in selected bellyscreen and creates
// a row of size settings for each one
function printImageList() {
  // Clears the image settings from previous slides
  const parent = document.getElementById('image-settings');
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild)
  }

  // Create image settings row for every image on screen
  for (let i = 1; i < bellyScreens[selectedBellyScreen].images.list.length + 1; i++) {
    const image_panel = document.createElement("div");
    image_panel.className = 'list-group-item form-inline';
    image_panel.innerText = i + ":  ";
    image_panel.style.display = "flex";
    image_panel.style.flexDirection = "row";
    image_panel.style.justifyContent = "flex-start";
    image_panel.style.alignItems = "center";

    const x_label = document.createElement("h5");
    x_label.innerText = "x: "
    x_label.style.margin = "5px"

    const x_input = document.createElement("input");
    x_input.type = 'number';
    x_input.class = "form-control mb-2 mr-sm-2";
    x_input.id = i;
    x_input.id = "x" + i;
    x_input.value = bellyScreens[selectedBellyScreen].images.list[i-1].size.x;

    const y_label = document.createElement("h5");
    y_label.innerText = "y: "
    y_label.style.margin = "5px"

    const y_input = document.createElement("input");
    y_input.type = 'number';
    y_input.class = "form-control mb-2 mr-sm-2";
    y_input.id = i;
    y_input.name = "y" + i;
    y_input.value = bellyScreens[selectedBellyScreen].images.list[i-1].size.y;

    const submit = document.createElement("button")
    submit.type = "submit"
    submit.class = "btn btn-primary mb-2"
    submit.innerText = "Resize Image"
    submit.style.margin = "5px"
    submit.onclick = function(){
      resizeImage(i-1, x_input.value, y_input.value)
    }

    const fullscreen = document.createElement("button")
    fullscreen.type = "submit"
    fullscreen.class = "btn btn-primary mb-2"
    fullscreen.innerText = "Fullscreen"
    fullscreen.style.margin = "5px"
    fullscreen.onclick = function(){
      // resizeImage(i-1, "80%", "80%")
      resizeImage(i-1, 300, 300, false)
    }

    const left_align = document.createElement("button")
    left_align.type = "submit"
    left_align.innerText = "L"
    left_align.style.margin = "2px"
    left_align.onclick = function() {
      alignImage(i-1, "left")
    }

    const center_align = document.createElement("button")
    center_align.type = "submit"
    center_align.innerText = "C"
    center_align.style.margin = "2px"
    center_align.onclick = function() {
      alignImage(i-1, "center")
    }

    const right_align = document.createElement("button")
    right_align.type = "submit"
    right_align.innerText = "R"
    right_align.style.margin = "2px"
    right_align.onclick = function() {
      alignImage(i-1, "right")
    }

    image_panel.appendChild(x_label)
    image_panel.appendChild(x_input)

    image_panel.appendChild(y_label)
    image_panel.appendChild(y_input)

    image_panel.appendChild(submit)
    image_panel.appendChild(fullscreen)
    
    image_panel.appendChild(left_align)
    image_panel.appendChild(center_align)
    image_panel.appendChild(right_align)

    parent.appendChild(image_panel);
  }
}

// Saves all the screens on the current robot screen
function saveAllScreens() {
  savedRobotScreens = {"robot": currentRobot, "screens": bellyScreens}
  if (localStorage.getItem('savedScreens') !== null) {
    savedScreens = JSON.parse(localStorage.getItem('savedScreens'));
    savedScreens.push(savedRobotScreens);
    console.log(savedRobotScreens)
  } else {
    savedScreens = [savedRobotScreens]
  }

  localStorage.setItem('savedScreens', JSON.stringify(savedScreens))
  // console.log(JSON.parse(localStorage.getItem('savedScreens')))
  displaySavedScreens();
}

// Save whatever screen is currently selected to the savedScreens list inside
// localStorage
function saveScreen() {
  // Saving the currentRobot as a screen variable allows it to save
  // and display what robot in came from even on other robot editors
  screen_to_save = bellyScreens[selectedBellyScreen];
  screen_to_save.robot = currentRobot;

  if (localStorage.getItem('savedScreens') !== null) {
    savedScreens = JSON.parse(localStorage.getItem('savedScreens'));
    savedScreens.push(screen_to_save);
  } else {
    savedScreens = [screen_to_save]
  }

  localStorage.setItem('savedScreens', JSON.stringify(savedScreens))
  console.log(JSON.parse(localStorage.getItem('savedScreens')))

  displaySavedScreens();
}

// Reads through the screens saved on local storage and displays them
// on the belly editor, alongside paste and remove options for each one
function displaySavedScreens() {
  savedScreens = JSON.parse(localStorage.getItem('savedScreens'));
  const parent = document.getElementById('list-screens');
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild)
  }
  for (let i = 0; i < savedScreens.length; i++) {
    console.log(savedScreens[i])
    
    const screen_panel = document.createElement("div");
    screen_panel.style.display = "flex";
    screen_panel.style.flexDirection = "row";
    screen_panel.style.alignItems = "center";

    const panel_text = document.createElement("h5");

    const paste = document.createElement("button");
    paste.type = "submit"
    paste.class = "btn btn-primary mb-2"
    paste.innerText = "Paste"
    paste.style.margin = "5px"

    // If the list item is a dictionary containing all the screens for a robot
    if (savedScreens[i].hasOwnProperty("screens")) {
      panel_text.innerText = "Robot: " + savedScreens[i]["robot"]

      paste.onclick = function() {
        for (screen in savedScreens[i]["screens"]) {
          add_screen = savedScreens[i]["screens"][screen];
          add_screen.name = 'Screen-' + (bellyScreens.length + 1);
          add_screen.robot = currentRobot;
          bellyScreens.push(add_screen);
          var dir = 'robots/' + currentRobot + '/customAPI/inputs/';
          var dbRef = firebase.database().ref(dir);
          dbRef.update({ bellyScreens: bellyScreens });
        }
      }
    } else { // If the list item is a single robot screen
      panel_text.innerText = "Robot: " + savedScreens[i].robot + " | " + savedScreens[i].name

      paste.onclick = function() {
        console.log(savedScreens[i])
        new_screen = savedScreens[i]
        new_screen.name = 'Screen-' + (bellyScreens.length + 1);
        new_screen.robot = currentRobot;
        bellyScreens.push(new_screen);
        var dir = 'robots/' + currentRobot + '/customAPI/inputs/';
        var dbRef = firebase.database().ref(dir);
        dbRef.update({ bellyScreens: bellyScreens });
      }
    }
  
    const remove = document.createElement("button");
    remove.type = "submit"
    remove.class = "btn btn-danger"
    remove.innerText = "Remove"
    remove.style.margin = "5px"
    remove.onclick = function() {
      savedScreens = savedScreens.filter(function(e) { return e !== savedScreens[i] });
      localStorage.setItem('savedScreens', JSON.stringify(savedScreens));
      displaySavedScreens();
    }

    screen_panel.append(panel_text)
    screen_panel.append(paste)
    screen_panel.append(remove)
    parent.appendChild(screen_panel)
  }
}

function uploadIcon(icon) {
  console.log("uploading " + icon);

  if (!("icons" in bellyScreens[selectedBellyScreen])) {
    bellyScreens[selectedBellyScreen]["icons"] = {list:[]}
  }

  // Upload just the name, not the whole tag
  // Creating tag in backend makes it easier to edit size, position, etc.
  icon_dict = {'type':icon, 'position':{x:0, y:0}, 'size': 16}
  bellyScreens[selectedBellyScreen].icons.list.push(icon_dict)
  // console.log(bellyScreens[selectedBellyScreen])
  console.log(icon_dict)
  var dir = 'robots/' + currentRobot + '/customAPI/inputs/';
  var dbRef = firebase.database().ref(dir);
  dbRef.update({ bellyScreens: bellyScreens });
}

// Iterates through list of icons in selected bellyscreen and creates
// a row of size settings for each one
function printIconList() {
  // Clears the icons settings from previous slides
  const parent = document.getElementById('icon-settings');
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild)
  }
  
  // Create icon settings row for every image on screen
  for (let i = 1; i < bellyScreens[selectedBellyScreen].icons.list.length + 1; i++) {
    const icon_panel = document.createElement("div");
    icon_panel.className = 'list-group-item form-inline';
    icon_panel.innerText = bellyScreens[selectedBellyScreen].icons.list[i-1].type.substr(6) + ":  ";
    icon_panel.style.display = "flex";
    icon_panel.style.flexDirection = "row";
    icon_panel.style.justifyContent = "flex-start";
    icon_panel.style.alignItems = "center";

    const x_label = document.createElement("h5");
    x_label.innerText = "x position: "
    x_label.style.margin = "5px"

    const x_input = document.createElement("input");
    x_input.type = 'range';
    x_input.min = 0;
    x_input.max = 100;
    x_input.class = "form-control mb-2 mr-sm-2";
    x_input.id = i;
    x_input.name = "x" + i;
    x_input.value = bellyScreens[selectedBellyScreen].icons.list[i-1].position.x;
    x_input.onchange = function(){
      moveIcon(i-1, x_input.value, y_input.value)
    }

    const y_label = document.createElement("h5");
    y_label.innerText = "y position: "
    y_label.style.margin = "5px"

    const y_input = document.createElement("input");
    y_input.type = 'range';
    y_input.min = 0;
    y_input.max = 100;
    y_input.class = "form-control mb-2 mr-sm-2";
    y_input.id = i;
    y_input.name = "y" + i;
    y_input.value = bellyScreens[selectedBellyScreen].icons.list[i-1].position.y;
    y_input.onchange = function(){
      moveIcon(i-1, x_input.value, y_input.value)
    }

    const size_label = document.createElement("h5");
    size_label.innerText = "Size: "
    size_label.style.margin = "5px"

    const size_input = document.createElement("input");
    size_input.type = 'number';
    size_input.class = "form-control mb-2 mr-sm-2";
    size_input.id = i;
    size_input.name = "size" + i;
    size_input.value = bellyScreens[selectedBellyScreen].icons.list[i-1].size;

    const resize = document.createElement("button")
    resize.type = "submit"
    resize.class = "btn btn-primary mb-2"
    resize.innerText = "Resize Icon"
    resize.style.margin = "5px"
    resize.onclick = function(){
      resizeIcon(i-1, size_input.value)
    }

    const del = document.createElement("button")
    del.type = "submit"
    del.class = "btn btn-primary mb-2"
    del.innerText = "Delete"
    del.style.margin = "5px"
    del.onclick = function(){
      deleteIcon(i-1)
    }

    icon_panel.appendChild(x_label)
    icon_panel.appendChild(x_input)

    icon_panel.appendChild(y_label)
    icon_panel.appendChild(y_input)

    icon_panel.appendChild(size_input)
    icon_panel.appendChild(resize)

    icon_panel.appendChild(del)

    parent.appendChild(icon_panel);
  }
}

// document.getElementById
function moveIcon(id, x, y) {
  console.log(bellyScreens[selectedBellyScreen].icons.list[id])

  bellyScreens[selectedBellyScreen].icons.list[id].position.x = x;
  bellyScreens[selectedBellyScreen].icons.list[id].position.y = y;

  console.log(bellyScreens[selectedBellyScreen].icons.list[id])

  var dir = 'robots/' + currentRobot + '/customAPI/inputs/';
  var dbRef = firebase.database().ref(dir);
  var updates = { bellyScreens: bellyScreens };
  dbRef.update(updates);
}

function resizeIcon(id, size) {
  bellyScreens[selectedBellyScreen].icons.list[id].size = size
  // console.log(document.getElementById("screenDiv" + selectedBellyScreen).offsetWidth)

  var dir = 'robots/' + currentRobot + '/customAPI/inputs/';
  var dbRef = firebase.database().ref(dir);
  var updates = { bellyScreens: bellyScreens };
  dbRef.update(updates);
} 

function deleteIcon(id) {
  bellyScreens[selectedBellyScreen].icons.list.splice(id,1);

  var dir = 'robots/' + currentRobot + '/customAPI/inputs/';
  var dbRef = firebase.database().ref(dir);
  var updates = { bellyScreens: bellyScreens };
  dbRef.update(updates);

  printIconList()
}

setTimeout(() => {
  
  renderVisuals();
  vizSettings();

}, 3000)

function addViz(viz) {
  if (!("visualizations" in bellyScreens[selectedBellyScreen])) {
    bellyScreens[selectedBellyScreen]["visualizations"] = {list:[]}
  }

  bellyScreens[selectedBellyScreen].visualizations.list.push(viz)
  
  var dir = 'robots/' + currentRobot + '/customAPI/inputs/';
  var dbRef = firebase.database().ref(dir);
  var updates = { bellyScreens: bellyScreens };
  dbRef.update(updates);

  renderVisuals();
  vizSettings();
}

function renderVisuals() {
  for (let i = 0; i < bellyScreens.length; i++) {
    var tag = document.getElementById("turkey" + i.toString())
    console.log(tag);

    if (bellyScreens[i].visualizations) {
      console.log(bellyScreens[i].visualizations.list);

      for (let k = 0; k < bellyScreens[i].visualizations.list.length; k++) {
        // if (bellyScreens[i].visualizations.list[k] == "community_mood") {
        //   addStaticVisCommunityMood(i);
        // }

        if (bellyScreens[i].visualizations && bellyScreens[i].visualizations.list[k] == 'community_mood') {
          addStaticVisCommunityMood(i);
        } else if (bellyScreens[i].visualizations.list[k] == 'static_com_stress') {
          addStaticVisCommunityStress(i);
        } else if (bellyScreens[i].visualizations.list[k] == 'weekly_stress_finals') {
          addStaticVisWeeklyStressFinals(i);
        } else if (bellyScreens[i].visualizations.list[k] == 'weekly_mood_finals') {
          addStaticVisWeeklyMoodFinals(i);
        } else if (bellyScreens[i].visualizations.list[k] == 'weekly_stress_thanksgiving') {
          addStaticVisWeeklyStressThanksgiving(i);
        } else if (bellyScreens[i].visualizations.list[k] == 'weekly_mood_thanksgiving') {
          addStaticVisWeeklyMoodThanksgiving(i);
        }
        //else if (bellyScreens[i].visualizations.list[k] == 'weekly_stress') {
        //   addStaticVisWeeklyStress(i);
        // } else if (bellyScreens[i].visualizations.list[k] == 'weekly_mood') {
        //   addStaticVisWeeklyMood(i);
        // }
      }
    }
    
    // addStaticVisCommunityMood(i);

    // addStaticVisCommunityMood();
  }
}

function vizSettings() {
  const parent = document.getElementById('data-vis-settings');
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild)
  }

  if (bellyScreens[selectedBellyScreen] && bellyScreens[selectedBellyScreen].visualizations) {
    console.log(bellyScreens[selectedBellyScreen].visualizations);

    // Create image settings row for visual on screen
    for (let i = 0; i < bellyScreens[selectedBellyScreen].visualizations.list.length; i++) {
      const viz_panel = document.createElement("div");
      viz_panel.className = 'list-group-item form-inline';
      viz_panel.innerText = bellyScreens[selectedBellyScreen].visualizations.list[i];
      viz_panel.style.display = "flex";
      viz_panel.style.flexDirection = "row";
      viz_panel.style.justifyContent = "flex-start";
      viz_panel.style.alignItems = "center";

      const del = document.createElement("button")
      del.type = "submit"
      del.class = "btn btn-primary mb-2"
      del.innerText = "Delete"
      del.style.margin = "5px"
      del.onclick = function(){
        deleteViz(i);
      }
  
      // const x_label = document.createElement("h5");
      // x_label.innerText = "x: "
      // x_label.style.margin = "5px"
      viz_panel.appendChild(del);
      parent.appendChild(viz_panel);
    }
  }
}

function deleteViz(id) {
  bellyScreens[selectedBellyScreen].visualizations.list.splice(id,1);

  var dir = 'robots/' + currentRobot + '/customAPI/inputs/';
  var dbRef = firebase.database().ref(dir);
  var updates = { bellyScreens: bellyScreens };
  dbRef.update(updates);

  renderVisuals();
  vizSettings();
}