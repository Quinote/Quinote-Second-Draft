<?php

/*Quinote Software Group 2015
/*
/* Author: Simone Dozier
/*
/* Just quiz page
/* file ids are posted from filebrowser.php
/* call quiz page scripts, or delete/redirect to open file
*/

//PHP sessions and database methods are handled here:
require('trylogin/methods.php');

//Redirect if no user logged in
if(!islogged()) {
	header('Location: index.html');
}
//Redirect if no data posted (will happen if someone goes to this page directly)
if(!isset($_POST)){
	header('Location: filebrowser.php');
}



if($_POST['submitType']=='Delete'){
	echo "user selected delete";
}
else if($_POST['submitType']=='Make Quiz'){
	//user selected make quiz
	
	$contentString = [count($POST['ids'])];
	$i = 0;
	foreach ($_POST['ids'] as $id) {
		$contentString[$i] = getFileContent($id)."<br />";
		$i++;
	}
	//echo implode($contentString);
	$output = htmlspecialchars(implode($contentString),ENT_QUOTES);
	
	/*Build HTML page*/
	echo "<!DOCTYPE html><HTML>";
	echo file_get_contents('header.html');
	echo "<HEAD>
	  <link rel='stylesheet' type='text/css' href='style/index.css' />
	  <link rel='stylesheet' type='text/css' href='style/frontend.css' /></HEAD>";
	echo "<BODY>";
	echo "<div id='multi-service-container' data-multicontent='$output'></div>";
	echo file_get_contents('frontend_fullscreen.html');
	echo "</BODY></HTML>";
	
}

?>