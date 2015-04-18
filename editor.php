<?php

require('trylogin/methods.php');

//If user is not logged in, redirect to index.php
if(!islogged()) {
	header( 'Location: index.html' );
}
if(!$_POST && !$_GET['id']) {
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
else if($_GET['id']) {
	$fileid = $_GET['id'];
	if(!userOwnsFile($fileid)){
		$content = "You aren't the author of this file";
		$fileid = -1;
		$title = "Error: Someone else's file";
	}
	else{
		$content = getFileContent($fileid);
		$title = ($_GET['title'] ? $_GET['title'] : '');
	}
}


//*******************
//Starts up HTML page
//*******************
echo "<HTML>";
echo file_get_contents('header.html');


//echoes file info into data-* object
echo "<BODY>";
/*echo "<div id='service-container' data-content='$content'></div>";

echo "<form name='test_editor' action='' >";
echo "<textarea rows='10' cols='120' id='filecontent'>";
echo "</textarea>";
echo "<input type='hidden' id='userid' value='".$_SESSION['userid']."'>";
echo "<input type='hidden' id='fileid' value='$fileid'>";
echo "<input type='submit' name='submit' class='button' id='save_btn' value='Save' border='1px black solid' />";
echo "</form>";*/

$page = file_get_contents('frontend.html');
$page = str_replace("<!--CONTENT GOES HERE-->",$content,$page);
$page = str_replace("<!--USER ID GOES HERE-->",$_SESSION['userid'],$page);
$page = str_replace("<!--FILE ID GOES HERE-->",$fileid,$page);
$page = str_replace("<!--TITLE GOES HERE-->",$title,$page);
echo $page;

/*echo "<textarea id='editor_div' name='editor_div'>$content</textarea>";
echo file_get_contents('frontend_2ndhalf.html');*/

echo "</BODY></HTML>";

?>