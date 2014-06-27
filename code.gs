/**
 * Retrieves all the rows in the active spreadsheet that contain data and logs the
 * values for each row.
 * For more information on using the Spreadsheet API, see
 * https://developers.google.com/apps-script/service_spreadsheet
 */
function readRows() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var rows = sheet.getDataRange();
  var numRows = rows.getNumRows();
  var values = rows.getValues();
  
  makeTables(values)
};

function makeTables(data) {
  var table = '|';
  var headers = data[0];
  var underHeaders = '';
  
  headers.map(function(i) {
    table += i + '|';
    underHeaders += ' ------ |';
  })

  table += '\n|' + underHeaders + '\n';
  
  data.forEach(function(dat, i) {
    if (i === 0) return; // this is a header row
    dat.forEach(function(d, i) {
      table += '|' + d;
      if (i === dat.length) table += '|';
    })
    table += '\n';
  })
  
  getRepo(table);
};

/**
 * Adds a custom menu to the active spreadsheet, containing a single menu item
 * for invoking the readRows() function specified above.
 * The onOpen() function, when defined, is automatically invoked whenever the
 * spreadsheet is opened.
 * For more information on using the Spreadsheet API, see
 * https://developers.google.com/apps-script/service_spreadsheet
 */
function onOpen() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var entries = [{
    name : "Send Spreadsheet to GitHub Repo",
    functionName : "showPrompt"
  }];
  spreadsheet.addMenu("GitHub Markdown Table", entries);
};

function showPrompt() {
  var org = Browser.inputBox(
      'What org or user name?');
  var repoFile = Browser.inputBox(
      'What\'s the repo/filename.ext?',
      Browser.Buttons.OK_CANCEL);
  
  // Process the user's response.
  if (org && repoFile != 'cancel') {
    // User clicked "OK".
    Browser.msgBox('Your repo is ' + org + repoFile + '.');
  } else {
    // User clicked "Cancel" or X in the title bar.
    Browser.msgBox('I didn\'t get the repo name.');
  }
}

function tryGrid() {
  var doc = SpreadsheetApp.getActiveSpreadsheet();
  var app = UiApp.createApplication().setTitle('Repo Details');
  
  var grid = app.createGrid(4, 2);
  grid.setWidget(1, 0, makeTextBox(app, 'accountname'));
  grid.setWidget(2, 0, makeTextBox(app, 'repofile'));
  grid.setWidget(3, 0, makeButton(app, grid, 'Ok', 'exportSheet'));
  grid.setWidget(3, 1, makeButton(app, grid, 'Cancel', 'exportAllSheets'));
  app.add(grid);
  
  doc.show(app);
}

function makeTextBox(app, id) {
  var lb = app.createTextBox().setName("text");
  if (id) lb.setId(id);
  return lb;
}

function makeLabel(app, text, id) {
  var lb = app.createLabel(text);
  if (id) lb.setId(id);
  return lb;
}
 
function makeListBox(app, name, items) {
  var listBox = app.createListBox().setId(name).setName(name);
  listBox.setVisibleItemCount(1);
  
  var cache = CacheService.getPublicCache();
  var selectedValue = cache.get(name);
  Logger.log(selectedValue);
  for (var i = 0; i < items.length; i++) {
    listBox.addItem(items[i]);
    if (items[1] == selectedValue) {
      listBox.setSelectedIndex(i);
    }
  }
  return listBox;
}
 
function makeButton(app, parent, name, callback) {
  var button = app.createButton(name);
  app.add(button);
  var handler = app.createServerClickHandler(callback).addCallbackElement(parent);;
  button.addClickHandler(handler);
  return button;
}
 
function makeTextBox(app, name) { 
  var textArea    = app.createTextArea().setWidth('100%').setHeight('200px').setId(name).setName(name);
  return textArea;
}


function getRepo(table) {
  
  var key = "XXX"

  var oauthConfig = UrlFetchApp.addOAuthService("github");
  oauthConfig.setConsumerKey(key);
  
  var options = {
    "contentType": "application/json",
    "headers": {
      "user-agent" : "githubspreadsheetscript",
      "Authorization" : "token " + key
    }
  };
    
  var url = "https://api.github.com/repos/eviljlord/hello/contents/hello.md";
  var response = UrlFetchApp.fetch(url, options);
  
  var res = JSON.parse(response);
  
  // If it doesn't have a sha, create new file
  if (res.sha) {
    var sha = sha
    writeFile(sha, key, options, url, table)
  } else { 
    var sha = false
    writeFile(sha, key, options, url, table)
  };
}

function writeFile(sha, key, options, url, table) {
  
  var body = {
   "message" : "update table",
   "content" : Utilities.base64Encode(table),
  };
  
  if (sha) body.sha = sha
  
  options.method = "PUT";
  options.payload = JSON.stringify(body);
    
  UrlFetchApp.fetch(url, options);
  
}

