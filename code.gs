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

  // for (var i = 0; i <= numRows - 1; i++) {
    // var row = values[i];
    // Logger.log(row);
  // }
};

function makeTables(data) {
  var table = '|'
  var headers = data[0]
  var underHeaders = ''
  headers.map(function(i) {
    table += i + '|'
    underHeaders += ' ------ |'
  })

  table += '\n|' + underHeaders + '\n'
  
  data.forEach(function(dat, i) {
    if (i === 0) return // this is a header row
    dat.forEach(function(d, i) {
      table += '|' + d 
      if (i === dat.length) table += '|'
    })
    table += '\n'
  })
  
  getRepo(table)
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
    functionName : "readRows"
  }, {
    name : "Send on Save",
    functionName : "somethingFun"
  }];
  spreadsheet.addMenu("GitHub Markdown Table", entries);
};

function getRepo(content) {
  
  var key = "XXX"

  var oauthConfig = UrlFetchApp.addOAuthService("github");
  oauthConfig.setConsumerKey(key);
  
  var thebody = {
       "message" : "update table",
       "content" : Utilities.base64Encode(content)
  };
  
  var theheaders = {
      "user-agent" : "githubspreadsheetscript",
      "Authorization" : "token " + key
  };
  
  var options = {
    "contentType": "application/json",
    "headers": {
      "user-agent" : "githubspreadsheetscript",
      "Authorization" : "token " + key
    },
    "method" : "PUT",
    "payload" : JSON.stringify(thebody)
  };
    
  Logger.log(options)
  var url = "https://api.github.com/repos/eviljlord/hello/contents/hello2.md";
  var response = UrlFetchApp.fetch(url, options);
  
  Logger.log(response);

}

