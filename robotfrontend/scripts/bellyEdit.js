var config = new Config();
var db = new Database(config.config, initializeEdit);

// Belly Edit Variables
var currentRobot = 0;
var bellyScreens = [];
var selectedBellyScreen = 0;
var bellySnapshot;

function initializeEdit(uid) {
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
    progress = ((i + 1) * 100)/bellyScreens.length;
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
          Screen Layout
        </button>
        <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
          <button class="dropdown-item" onclick='setLayout(this)'>Text</button>
          <button class="dropdown-item" onclick='setLayout(this)'>Slider</button>
          <button class="dropdown-item" onclick='setLayout(this)'>Buttons</button>
          <button class="dropdown-item" onclick='setLayout(this)'>Checkboxes</button>
          <button class="dropdown-item" onclick='setLayout(this)'>Images</button>
          <button class="dropdown-item" onclick='setLayout(this)'>User Text Input</button>
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
              <a class="dropdown-item" onclick='setIcon(this)' href="#"> <i class="fa fa-at"></i> At </a>  
              <a class="dropdown-item" onclick='setIcon(this)' href="#"> <i class="fa fa-address-book"></i> Contact </a>  
              <a class="dropdown-item" onclick='setIcon(this)' href="#"> <i class="fa fa-asterisk"></i> Asterisk </a>  
              <a class="dropdown-item" onclick='setIcon(this)' href="#"><i class="fa fa-book"></i> Book </a>  
              <a class="dropdown-item" onclick='setIcon(this)' href="#"><i class="fa fa-hand-peace-o"></i> Victory </a>  
              <a class="dropdown-item" onclick='setIcon(this)' href="#"><i class="fa fa-hand-paper-o"></i> Hand </a>  
              <a class="dropdown-item" onclick='setIcon(this)' href="#"><i class="fa fa-arrow-circle-o-up"></i> Up </a>  
              <a class="dropdown-item" onclick='setIcon(this)' href="#"><i class="fa fa-arrow-circle-o-down"></i> Down </a>  
              <a class="dropdown-item" onclick='setIcon(this)' href="#"><i class="fa fa-arrow-circle-o-left"></i> Left </a>  
              <a class="dropdown-item" onclick='setIcon(this)' href="#"><i class="fa fa-arrow-circle-o-right"></i> Right </a>  
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

    var atChecked = '';
    var contactChecked = '';
    var asteriskChecked = '';
    var bookChecked = '';
    var victoryChecked = '';
    var handChecked = '';
    var upChecked = '';
    var downChecked = '';
    var leftChecked = '';
    var rightChecked = '';

    if (screen.instructionLarge.isShown) instructionLargeChecked = 'checked';
    if (screen.instructionSmall.isShown) instructionSmallChecked = 'checked';
    if (screen.slider.isShown) sliderChecked = 'checked';
    if (screen.checkboxes.isShown) checkboxesChecked = 'checked';
    if (screen.buttons.isShown) buttonsChecked = 'checked';
    if (screen.backgroundColor) backgroundColor = screen.backgroundColor;

    if (screen.at && screen.at.isShown) atChecked = 'checked';
    if (screen.contact && screen.contact.isShown) contactChecked = 'checked';
    if (screen.asterisk && screen.asterisk.isShown) asteriskChecked = 'checked';
    if (screen.book && screen.book.isShown) bookChecked = 'checked';
    if (screen.victory && screen.victory.isShown) victoryChecked = 'checked';
    if (screen.hand && screen.hand.isShown) handChecked = 'checked';
    if (screen.up && screen.up.isShown) upChecked = 'checked';
    if (screen.down && screen.down.isShown) downChecked = 'checked';
    if (screen.left && screen.left.isShown) leftChecked = 'checked';
    if (screen.right && screen.right.isShown) rightChecked = 'checked';

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
        ' placeholder="' +
        (screen.textInput.text ? screen.textInput.text : '') +
        '" ' +
        'onchange="changeScreenElement(this, ' +
        i +
        ')"';
      bellyHTML += '></textarea>';
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

    if (screen.at && screen.at.isShown) {
      bellyHTML += "<div class='screen-element mt-4'>";
      bellyHTML +=
        "<div class='at-value'> <input class='at-val' type='text' class='' name='atVal' onhange='changeScreenElement(this, " +
        i +
        ")' value='" +
        screen.at.current +
        "'></div>";
      bellyHTML += '</div>';
    }

    if (screen.contact && screen.contact.isShown) {
      bellyHTML += "<div class='screen-element mt-4'>";
      bellyHTML +=
        "<div class='contact-value'> <input class='contact-val' type='text' class='' name='contactVal' onhange='changeScreenElement(this, " +
        i +
        ")' value='" +
        screen.contact.current +
        "'></div>";
      bellyHTML += '</div>';
    }

    if (screen.asterisk && screen.asterisk.isShown) {
      bellyHTML += "<div class='screen-element mt-4'>";
      bellyHTML +=
        "<div class='asterisk-value'> <input class='asterisk-val' type='text' class='' name='asteriskVal' onhange='changeScreenElement(this, " +
        i +
        ")' value='" +
        screen.asterisk.current +
        "'></div>";
      bellyHTML += '</div>';
    }

    if (screen.book && screen.book.isShown) {
      bellyHTML += "<div class='screen-element mt-4'>";
      bellyHTML +=
        "<div class='book-value'> <input class='book-val' type='text' class='' name='bookVal' onhange='changeScreenElement(this, " +
        i +
        ")' value='" +
        screen.book.current +
        "'></div>";
      bellyHTML += '</div>';
    }

    if (screen.victory && screen.victory.isShown) {
      bellyHTML += "<div class='screen-element mt-4'>";
      bellyHTML +=
        "<div class='victory-value'> <input class='victory-val' type='text' class='' name='victoryVal' onhange='changeScreenElement(this, " +
        i +
        ")' value='" +
        screen.victory.current +
        "'></div>";
      bellyHTML += '</div>';
    }

    if (screen.hand && screen.hand.isShown) {
      bellyHTML += "<div class='screen-element mt-4'>";
      bellyHTML +=
        "<div class='hand-value'> <input class='hand-val' type='text' class='' name='handVal' onhange='changeScreenElement(this, " +
        i +
        ")' value='" +
        screen.hand.current +
        "'></div>";
      bellyHTML += '</div>';
    }

    if (screen.up && screen.up.isShown) {
      bellyHTML += "<div class='screen-element mt-4'>";
      bellyHTML +=
        "<div class='up-value'> <input class='up-val' type='text' class='' name='upVal' onhange='changeScreenElement(this, " +
        i +
        ")' value='" +
        screen.up.current +
        "'></div>";
      bellyHTML += '</div>';
    }

    if (screen.down && screen.down.isShown) {
      bellyHTML += "<div class='screen-element mt-4'>";
      bellyHTML +=
        "<div class='down-value'> <input class='down-val' type='text' class='' name='downVal' onhange='changeScreenElement(this, " +
        i +
        ")' value='" +
        screen.down.current +
        "'></div>";
      bellyHTML += '</div>';
    }

    if (screen.left && screen.left.isShown) {
      bellyHTML += "<div class='screen-element mt-4'>";
      bellyHTML +=
        "<div class='left-value'> <input class='left-val' type='text' class='' name='leftVal' onhange='changeScreenElement(this, " +
        i +
        ")' value='" +
        screen.left.current +
        "'></div>";
      bellyHTML += '</div>';
    }

    if (screen.right && screen.right.isShown) {
      bellyHTML += "<div class='screen-element mt-4'>";
      bellyHTML +=
        "<div class='right-value'> <input class='right-val' type='text' class='' name='rightVal' onhange='changeScreenElement(this, " +
        i +
        ")' value='" +
        screen.right.current +
        "'></div>";
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
        "<input type='range' class='screen-slider' name='slider' onchange='changeScreenElement(this, " +
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

function setIcon(element) {
  switch (element.innerHTML) {
    case 'at':
      addRemoveMultipleElements(
        [
          {
            name: 'at',
            checked: true,
          },
          {
            name: 'contact',
            checked: true,
          },
          {
            name: 'asterisk',
            checked: false,
          },
          {
            name: 'book',
            checked: false,
          },
          {
            name: 'victory',
            checked: true,
          },
          {
            name: 'hand',
            checked: true,
          },
          {
            name: 'up',
            checked: false,
          },
          {
            name: 'down',
            checked: false,
          },
          {
            name: 'left',
            checked: false,
          },
          {
            name: 'right',
            checked: false,
          },
        ],
        selectedBellyScreen
      );
      return;
          case 'at':
      addRemoveMultipleElements(
        [
          {
            name: 'at',
            checked: true,
          },
          {
            name: 'contact',
            checked: true,
          },
          {
            name: 'asterisk',
            checked: false,
          },
          {
            name: 'book',
            checked: false,
          },
          {
            name: 'victory',
            checked: true,
          },
          {
            name: 'hand',
            checked: true,
          },
          {
            name: 'up',
            checked: false,
          },
          {
            name: 'down',
            checked: false,
          },
          {
            name: 'left',
            checked: false,
          },
          {
            name: 'right',
            checked: false,
          },
        ],
        selectedBellyScreen
      );
      return;
    case 'contact':
      addRemoveMultipleElements(
        [
          {
            name: 'at',
            checked: false,
          },
          {
            name: 'contact',
            checked: true,
          },
          {
            name: 'asterisk',
            checked: false,
          },
          {
            name: 'book',
            checked: false,
          },
          {
            name: 'victory',
            checked: true,
          },
          {
            name: 'hand',
            checked: true,
          },
          {
            name: 'up',
            checked: false,
          },
          {
            name: 'down',
            checked: false,
          },
          {
            name: 'left',
            checked: false,
          },
          {
            name: 'right',
            checked: false,
          },
        ],
        selectedBellyScreen
      );
      return;
    case 'asterisk':
      addRemoveMultipleElements(
        [
          {
            name: 'at',
            checked: false,
          },
          {
            name: 'contact',
            checked: false,
          },
          {
            name: 'asterisk',
            checked: true,
          },
          {
            name: 'book',
            checked: false,
          },
          {
            name: 'victory',
            checked: true,
          },
          {
            name: 'hand',
            checked: true,
          },
          {
            name: 'up',
            checked: false,
          },
          {
            name: 'down',
            checked: false,
          },
          {
            name: 'left',
            checked: false,
          },
          {
            name: 'right',
            checked: false,
          },
        ],
        selectedBellyScreen
      );
      return;
    case 'book':
      addRemoveMultipleElements(
        [
          {
            name: 'at',
            checked: false,
          },
          {
            name: 'contact',
            checked: false,
          },
          {
            name: 'asterisk',
            checked: false,
          },
          {
            name: 'book',
            checked: true,
          },
          {
            name: 'victory',
            checked: true,
          },
          {
            name: 'hand',
            checked: true,
          },
          {
            name: 'up',
            checked: false,
          },
          {
            name: 'down',
            checked: false,
          },
          {
            name: 'left',
            checked: false,
          },
          {
            name: 'right',
            checked: false,
          },
        ],
        selectedBellyScreen
      );
      return;
    case 'victory':
      addRemoveMultipleElements(
        [
          {
            name: 'at',
            checked: false,
          },
          {
            name: 'contact',
            checked: false,
          },
          {
            name: 'asterisk',
            checked: false,
          },
          {
            name: 'book',
            checked: false,
          },
          {
            name: 'victory',
            checked: true,
          },
          {
            name: 'hand',
            checked: true,
          },
          {
            name: 'up',
            checked: false,
          },
          {
            name: 'down',
            checked: false,
          },
          {
            name: 'left',
            checked: false,
          },
          {
            name: 'right',
            checked: false,
          },
        ],
        selectedBellyScreen
      );
      return;
    case 'hand':
      addRemoveMultipleElements(
        [
          {
            name: 'at',
            checked: false,
          },
          {
            name: 'contact',
            checked: false,
          },
          {
            name: 'asterisk',
            checked: false,
          },
          {
            name: 'book',
            checked: false,
          },
          {
            name: 'victory',
            checked: false,
          },
          {
            name: 'hand',
            checked: true,
          },
          {
            name: 'up',
            checked: false,
          },
          {
            name: 'down',
            checked: false,
          },
          {
            name: 'left',
            checked: false,
          },
          {
            name: 'right',
            checked: false,
          },
        ],
        selectedBellyScreen
      );
      return;
    case 'up':
      addRemoveMultipleElements(
        [
          {
            name: 'at',
            checked: false,
          },
          {
            name: 'contact',
            checked: false,
          },
          {
            name: 'asterisk',
            checked: false,
          },
          {
            name: 'book',
            checked: false,
          },
          {
            name: 'victory',
            checked: false,
          },
          {
            name: 'hand',
            checked: false,
          },
          {
            name: 'up',
            checked: true,
          },
          {
            name: 'down',
            checked: false,
          },
          {
            name: 'left',
            checked: false,
          },
          {
            name: 'right',
            checked: false,
          },
        ],
        selectedBellyScreen
      );
      return;
case 'down':
  addRemoveMultipleElements(
    [
      {
        name: 'at',
            checked: false,
          },
          {
            name: 'contact',
            checked: false,
          },
          {
            name: 'asterisk',
            checked: false,
          },
          {
            name: 'book',
            checked: false,
          },
          {
            name: 'victory',
            checked: true,
          },
          {
            name: 'hand',
            checked: false,
          },
          {
            name: 'up',
            checked: false,
          },
          {
            name: 'down',
            checked: true,
          },
          {
            name: 'left',
            checked: false,
          },
          {
            name: 'right',
            checked: false,
          },
        ],
        selectedBellyScreen
      );
      return;
    case 'left':
      addRemoveMultipleElements(
        [
          {
            name: 'at',
            checked: false,
          },
          {
            name: 'contact',
            checked: false,
          },
          {
            name: 'asterisk',
            checked: false,
          },
          {
            name: 'book',
            checked: false,
          },
          {
            name: 'victory',
            checked: false,
          },
          {
            name: 'hand',
            checked: false,
          },
          {
            name: 'up',
            checked: false,
          },
          {
            name: 'down',
            checked: false,
          },
          {
            name: 'left',
            checked: true,
          },
          {
            name: 'right',
            checked: false,
          },
        ],
        selectedBellyScreen
      );
      return;
case 'right':
  addRemoveMultipleElements(
    [
      {
        name: 'at',
            checked: false,
          },
          {
            name: 'contact',
            checked: false,
          },
          {
            name: 'asterisk',
            checked: false,
          },
          {
            name: 'book',
            checked: false,
          },
          {
            name: 'victory',
            checked: false,
          },
          {
            name: 'hand',
            checked: false,
          },
          {
            name: 'up',
            checked: false,
          },
          {
            name: 'down',
            checked: false,
          },
          {
            name: 'left',
            checked: false,
          },
          {
            name: 'right',
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
        ],
        selectedBellyScreen
      );
      return;
    case 'User Text Input':
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
        ],
        selectedBellyScreen
      );
      return;
    default:
      return;
  }
}

function changeSelectedBellyScreen(event, index) {
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

  if (target.name == 'at') bellyScreens[screenID].at.current = target.value;

  if (target.name == 'contact') bellyScreens[screenID].conatct.current = target.value;

  if (target.name == 'asterisk') bellyScreens[screenID].asterisk.current = target.value;

  if (target.name == 'book') bellyScreens[screenID].book.current = target.value;

  if (target.name == 'victory') bellyScreens[screenID].victory.current = target.value;

  if (target.name == 'hand') bellyScreens[screenID].hand.current = target.value;

  if (target.name == 'up') bellyScreens[screenID].up.current = target.value;

  if (target.name == 'down') bellyScreens[screenID].down.current = target.value;

  if (target.name == 'left') bellyScreens[screenID].left.current = target.value;

  if (target.name == 'right') bellyScreens[screenID].right.current = target.value;

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
        x: 150,
        y: 150,
      },
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
