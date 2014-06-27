// GLOBALS

var account  = '' || 'eviljlord';
var repo     = '' || 'hello';
var filename = '' || 'cat.md';

var key = "XXX";
var base = "https://api.github.com/repos/";
var url = base + account + '/' + repo + '/contents/' + filename;

var oauthConfig = UrlFetchApp.addOAuthService("github");
oauthConfig.setConsumerKey(key);

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
    functionName : "readRow"
  }, {
    name : "Options",
    functionName : "showPrompt"
  }];
  spreadsheet.addMenu("GitHub Markdown Table", entries);
};

function showPrompt() {
  var location = Browser.inputBox(
      'What is the account/repo/filename.ext?');
  
  // Process the user's response.
  if (location != 'cancel') {
    // User clicked "OK".
    parseLocation(location)
    Browser.msgBox('Your repo is ' + location  + '.');
  } else {
    // User clicked "Cancel" or X in the title bar.
    Browser.msgBox('I didn\'t get the repo name. Try again.');
  }
}

function parseLocation(location) {
  var parts = location.split('/')
  account = parts[0]
  repo = parts[1]
  filename = parts[2]
  
  readRows()
};

function getRepo(table) {
  
  var options = {
    "headers": {
      "user-agent" : "githubspreadsheetscript",
      "Authorization" : "token " + key
    }
  };
 
  var response = UrlFetchApp.fetch(url, options);
  var res = JSON.parse(response)

  // If it doesn't have a sha, create new file
  if (res.sha != "undefined") {
    var sha = res.sha
    writeFile(sha, options, table)
  } else { 
    var sha = false
    writeFile(sha, options, table)
  };
}

function writeFile(sha, options, table) {
  
  var body = {
   "message" : "update table",
   "content" : Utilities.base64Encode(table),
  };
  
  if (sha) body.sha = sha
  
  options.method = "PUT";
  options.payload = JSON.stringify(body);
  options.contentType = "application/json";
    
  UrlFetchApp.fetch(url, options);
  showAlert()
}

function showAlert() {
  Browser.msgBox(
    'All done.',
    Browser.Buttons.OK);
}
