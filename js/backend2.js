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
    	console.log('save button pressed')
    	
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
	//grabs file data from data-* object and puts it into the editor
	/*var container = $('#service-container');
	var filetext = container.data('content');
	$('#filecontent').html(filetext);
	setEditorHtml(filetext);
	
	console.log(getEditorHtml());*/
	
	
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