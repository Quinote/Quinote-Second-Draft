/*
QuiNote software group
Author: Simone
Javascript methods for save
*/

/**************************************/
/*Links save button with ajax and save.php*/
/**************************************/
$(function() {
    $("#save_btn").click(function() {
    	/*Enter form validation stuff*/
    	console.log('save button pressed');
    	clearTimeout();
    	
    	var userid = $('input#userid').val();
    	var fileid = $('input#fileid').val();
    	/*var content = $('#filecontent').val();*/
    	var content = getEditorHtml();
    	
    	console.log(fileid);
    	console.log(userid);
    	console.log(content);
    	
    	var dataString = 'userid='+ userid + '&fileid=' + fileid + '&content='+content;
    	
    	//console.log(dataString);
    	
	$.ajax({
    		type: "POST",
    		url: "../trylogin/save.php",
    		data: dataString,
    		success: function(data) {
      			if(data == 1) {
      				console.log('update successful');
      				$('#save-message').html(' - Save successful');
      				setTimeout(function(){
      					$('#save-message').html('');
      					},3000);
      			}
      			else if(data == 0) {
      				console.log('Then an error occured');
      				$('#save-message').html(' - Save error occured');
      				setTimeout(function(){
      					$('#save-message').html('');
      					},3000);
      			}
      		}
      	});
      	
      	return false;
      	});
});

console.log("I exist and people are listening to me");

/**************************************/
/*makes sure File Lib Form is valid before bothering PHP*/
/**************************************/
function validateFileLibForm() {
	var checkboxes = document.forms["FileLibForm"]["ids[]"];
	var count=0;
	for(var x in checkboxes) {
		if(checkboxes[x].checked) {
			count++;
		}
	}
	if(count==0) {
		alert("Please select an item");
		console.log("count is 0");
		return false;
	}
	return true;
}
    
/*$(document).ready( function() {

});*/