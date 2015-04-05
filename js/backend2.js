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
    	console.log('Save button pressed');
    	/*form validation stuff*/
    	
    	var userid = $('input#userid').val();
    	var fileid = $('input#fileid').val();
    	var content = $('#filecontent').val();
    	/*console.log(fileid);
    	console.log(userid);
    	console.log(content);*/
    	
    	var dataString = 'userid='+ userid + '&fileid=' + fileid + '&content='+content;
    	
    	//console.log(dataString);
    	
	$.ajax({
    		type: "POST",
    		url: "../trylogin/save.php",
    		data: dataString,
    		success: function(data) {
      			if(data == 1) {
      				console.log('update successful');
      			}
      			else if(data == 0) {
      				console.log('Then an error occured');
      			}
      		}
      	});
      	
      	return false;
      	});
});

$(document).ready( function() {
	//onload things
});

/**************************************/
/*takes document content and displays it*/
/**************************************/
function useContent(text) {
	//cleanText = text.replace(/<\/?[^>]+(>|$)/g, "");
	//will use &lt; and &gt;
	//document.getElementById('display').innerHTML = cleanText;
	
	editor.setText(text);
}