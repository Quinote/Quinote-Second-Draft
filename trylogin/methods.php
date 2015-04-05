<?php

/*QuiNote Group 2015*/
/*Author: Simone*/
/* backend helper methods */


//////////////////////////////////////
/*
  Every file that uses backend helper methods needs to connect to the database
  and use a PHP session, so do this at startup
*/
//////////////////////////////////////
require_once('credentials.php');
/*********************/
/*Connect to database*/
/*********************/
$connection = mysql_connect('localhost',$user,$password) or die("Couldn't connect to the server");
mysql_select_db($db,$connection) or die("Couldn't connect to the database");

//starts PHP session. Thats where login vars are stored
session_start();




//////////////////////////////////////
/*Returns a boolean value
  true: user is logged in
  false: user is not logged in*/
//////////////////////////////////////
function islogged() {
	$logged = false;
	if ($_SESSION['c_user'] && $_SESSION['c_salt']){
		$cuser = mysql_real_escape_string($_SESSION['c_user']);
		$csalt = mysql_real_escape_string($_SESSION['c_salt']);
		$user = mysql_fetch_array(mysql_query("SELECT * FROM `users` WHERE `salt`='$csalt'"));
		if($user != 0){
			if (hash("sha512",$user['username']) == $cuser){
				$logged = true;
			}
		}
	}
	return $logged;
}


//////////////////////////////////////
/*
  @param: userid
  Returns an array of the users files
  only gets each files folder, title, and id (so large amounts of content aren't being sent unnecessarily)
*/
//////////////////////////////////////
function getFiles($userid) {
	$userid = mysql_real_escape_string($userid);
	$rows = array();
	$result = mysql_query("SELECT `parent_id`,`title`,`file_id` FROM `files` WHERE `owner_id`=$userid");
	$frightened=0;
	while ($row = mysql_fetch_assoc($result)) {
		$frightened=$frightened+1;
		if($frightened > 100) {
			break;
		}
  		$rows[] = $row;
	}
	return $rows;
}


//////////////////////////////////////
/*
  @param: file_id
  Returns file content as a string
*/
//////////////////////////////////////
function getFileContent($fileid) {
	$fileid = mysql_real_escape_string($fileid);
	return mysql_fetch_array(mysql_query("SELECT `content` FROM `files` WHERE `file_id`=$fileid"))[0];
}



//////////////////////////////////////
/*
  @param: author's userid
  @param: title of new file
  @param: parent folder. Use -1 if it's a root level file
  Returns an array of the users files
  only gets each files folder, title, and id (so large amounts of content aren't being sent unnecessarily)
*/
//////////////////////////////////////
function newFile($userid,$title,$parent_id) {
	$title = mysql_real_escape_string($title);
	$userid = mysql_real_escape_string($userid); //userid and parent_id may not be necessary, usually they are generated within session
	$parent_id = mysql_real_escape_string($parent_id);
	$query = "SELECT * FROM `files` WHERE (`owner_id`=$userid AND `title`='$title' AND `parent_id`=$parent_id)";
	$checkAlreadyExists = mysql_fetch_array(mysql_query($query));
	if($checkAlreadyExists) {
		$error = "File already exists";
		throw new Exception($error);
	}
	$query = "INSERT INTO `files` (`owner_id`,`parent_id`,`title`,`created_date`) VALUES ($userid,$parent_id,'$title',now())";
	mysql_query($query);
	return mysql_insert_id();
}

//////////////////////////////////////
/*
  @param: fileId
  @param: new content
  updates database with file's new content
*/
//////////////////////////////////////
function saveFile($file_id,$content) {
	$content = mysql_real_escape_string($content);
	$success = mysql_query("UPDATE `files` SET `content`='$content', `last_modified`=now() WHERE `file_id`='$file_id'");
	return $success;
}
?>