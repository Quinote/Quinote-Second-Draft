<?php

require('trylogin/methods.php');

//If user is not logged in, redirect to index.php
if(!islogged()) {
	header( 'Location: index.php' );
}
if(! $_POST['actionType']) {
	//means the user is logged in, but navigated straight to the editor
	//redirect user to their file management system
	header( 'Location: filebrowser.php' );
}

//Check if user is making or opening file
//Set fileid and content appropriately
if($_POST['actionType'] == 'make') {
	$title = htmlspecialchars($_POST['title'],ENT_QUOTES);
	$fileid = newFile($title,0);
	$content = 'brand new file';
}
else if($_POST['actionType'] == 'open') {
	$fileid = $_POST['id'];
	$content = getFileContent($fileid);
}


//*******************
//Starts up HTML page
//*******************
echo "<HTML>";
echo file_get_contents('header.html');


//echoes file info into data-* object
echo "<BODY>";
echo "<div id='service-container' data-content='$content'></div>";

echo "<form name='editor' action='' >";
echo "<textarea rows='10' cols='120' id='filecontent'>";
echo "</textarea>";
echo "<input type='hidden' id='userid' value='".$_SESSION['userid']."'>";
echo "<input type='hidden' id='fileid' value='$fileid'>";
echo "<input type='submit' name='submit' class='button' id='save_btn' value='Save' border='1px black solid' />";
echo "</form>";

echo file_get_contents('test_frontend.html');
echo "</BODY></HTML>";

?>