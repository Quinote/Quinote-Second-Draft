var CLIENT_ID = '526842392555-28flrr7rakr08ofmoupm7b9umkhl13o4.apps.googleusercontent.com';
var SCOPES = [
              'https://www.googleapis.com/auth/drive.install',
              'https://www.googleapis.com/auth/drive.file'
              // Add other scopes needed by your application. in comma separated list
              ];

/**
 * Called when the client library is loaded.
 */
function handleClientLoad() {
	checkAuth();
}

/*
 * Possible this function is deprecated
 * Can be used to check if gapi.client is loaded, but it doesnt load drive successfully
 * Use request functions instead
 */
function driveStuff() {

	if (gapi.client) { console.log('It sees the client'); }
	gapi.client.load('drive','v1', console.log('Should have loaded'));

	if (gapi.client.drive) { console.log('It sees the drive'); } else { console.log('It does not see the drive'); }
	//if (gapi.client.drive.files) { console.log("It sees the files"); }

}

/**
 * Check if the current user has authorized the application.
 */
function checkAuth() {
	gapi.auth.authorize(
			{'client_id': CLIENT_ID, 'scope': SCOPES.join(' '), 'immediate': true},
			handleAuthResult);
}
function forceAuth() {
	gapi.auth.authorize(
			{'client_id': CLIENT_ID, 'scope': SCOPES.join(' '), 'immediate': false},
			handleAuthResult);     
}

/**
 * Called when authorization server replies.
 *
 * @param {Object} authResult Authorization result.
 * If authorization successful, calls getStateVars()
 * 
 */
function handleAuthResult(authResult) {
	if (authResult) {
		// Access token has been successfully retrieved, requests can be sent to the API
		console.log(authResult);

		loadFile();

	} else {
		// No access token could be retrieved, force the authorization flow (by setting immediate to false).
		console.log('no token received, try to force auth flow');
		gapi.auth.authorize(
				{'client_id': CLIENT_ID, 'scope': SCOPES.join(' '), 'immediate': false},
				handleAuthResult);
	}
}

/*
 * Get file object and call download content function
 * @param {String} fileId ID of the file to print.
 * */

function getFileObj(fileId) {
	//var fileId = '0BzyCBwx5XmTBYUxodWE4YkNobFk';
	//hanging onto this instead of accessing dynamically, for debugging purposes

	var request = gapi.client.request({
		'path': '/drive/v2/files/fileId',
		'method': 'GET',
		'params': {'fileId': fileId}
	});

	request.execute(function(resp) {
		//console.log(resp);
		if (!resp.error) {
			/*console.log('Title: ' + resp.title);
      		console.log('Description: ' + resp.description);
      		console.log('MIME type: ' + resp.mimeType);
      		console.log('\n');
      		console.log(resp);

      		console.log(resp.exportLinks);*/

		//Important:
		//If the request is successfully executed, then download the content (downloadFile) and display it (callback onontent)
		downloadFile(resp,useContent);
		}
		else {
			console.log('An error occurred: ' + resp.error.messge);
			return null;
		}
	});
}


/*
  Download a files content.

  @param {File} file Drive File instance.
  @param {Function} callback Function to call when the request is complete.
 */

function downloadFile(file, callback) {
	if (file.downloadUrl) {
		var url = file.downloadUrl;
	}
	else if (file.exportLinks) {
		var url = file.exportLinks['text/plain']; //later might have to try application/rtf
		console.log(url);
	}
	else {
		console.log('missing download url for file');
	}

	var accessToken = gapi.auth.getToken().access_token;
	//if (accessToken) { console.log('sees access token'); }
	var xhr = new XMLHttpRequest();
	xhr.open('GET', url);
	xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
	xhr.onload = function() {
		callback(xhr.responseText);
	};
	xhr.onerror = function() {
		callback(null);
	};
	xhr.send();
}

/*takes document texts and displays it*/
/*this function will be replaced by Camerons */
function useContent(text) {
	console.log('\n\ntext received:');

	//cleanText = text.replace(/<\/?[^>]+(>|$)/g, "");
	//will use &lt; and &gt;
	//document.getElementById('display').innerHTML = cleanText;
	
	editor.setText(text);
}

/*
* Will provide popup for user to log in to gmail and install app to their drive
*/
function install() {
         gapi.auth.authorize(
            {'client_id': CLIENT_ID, 'scope': SCOPES, 'immediate': false},
            null);
}

/*
* Second chain of events handling download and display
* Called after script gets permissions
*
* Gets file info from state variables
* Gets file object
* -> calls downloadFile, which gets content
*   -> calls useContent. This function will be replaced to link up back/frontends
*/
function loadFile() {
	getStateVars();
	if(exportid != "") {
	        getFileObj(exportid);
	}
	else if (id != "") {
		getFileObj(id);
	}
	else {
		console.log('no file id passed in state');
	}
}