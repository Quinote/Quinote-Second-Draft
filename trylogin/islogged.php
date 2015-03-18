<?php

/*QuiNote Group 2015*/
/*Author: Simone*/

/*Checks to see if user is logged in*/

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

?>