<?php
/*Quinote Software Group 2015
/*
/* Author: Simone Dozier
/*
/* User landing page
/* Login information posts to this page
/* On loading, processes login info if it exists
/* If user is logged in (whether already was logged in or just arrived), display file library
/* If user is not logged in, display error page that gives them another chance to log in
*/

//PHP sessions and database methods are handled here:
require('trylogin/methods.php');

global $message;
global $login_error;
$login_error = true;

/*********************/
/*
  Check if user has navigated here from login form
  Check if user exists
  Check if password is ok
  if so: Add them to $_SESSION
*/
/*********************/
if ($_POST['login']) {
	if ($_POST['username'] && $_POST['password']) {
		$username = mysql_real_escape_string($_POST['username']);
		$password = mysql_real_escape_string(hash("sha512", $_POST['password']));
		$user = mysql_fetch_array(mysql_query("SELECT * FROM `users` WHERE `username`='$username'"));
		if ($user == '0') {
			$message = "User does not exist";
			
		}
		else if ($user['password'] != $password) {
			$message = "Incorrect password";
			
		}
		else {
		$login_error = false;
		$message = "Welcome $username";
		$salt = hash("sha512", rand() . rand() . rand());
		
		$_SESSION['c_user']=hash("sha512",$username);
		$_SESSION['c_salt']=$salt;
		$userid = $user['id'];
		$_SESSION['userid']=$userid;
		$_SESSION['username']=$username;
		
		mysql_query("UPDATE `users` SET `salt`='$salt' WHERE `id`='$userid'");
		}
	}
	else {
		$message = "Please enter a username and password";
	}
}
else {
	if(!islogged()) {
		//user navigated directly to this page without logging in
		$message = "You are not logged in";
	}
	else { //user did not come here from log in form, but is logged in
		$login_error = false;
		$userid = $_SESSION['userid'];
		$username = $_SESSION['username'];
		$message = "Welcome $username";
	}
}


/*
* HTML page
* Displays either error page or landing page depending on PHP controls
*/
if($login_error) {
	//There has been some kind of error logging the user in
	//Display error page
	echo "<HTML>";
	echo file_get_contents('header.html');
	echo "<HEAD>
	  <link rel='stylesheet' type='text/css' href='style/index.css' /></HEAD>";
	echo "<BODY>
	<div style='width:80%; margin:10%;'><span style='color:#CD3333'>$message</span><br />";
	echo file_get_contents('trylogin/login_error.html');
	echo "</div></BODY></HTML>";
}
else {
	/*grab static landing page
	* split apart and insert session-specific variables
	* to display */
	$pieces = explode("<!--SPLIT HERE-->", file_get_contents('frontend_landing.html'));
	echo $pieces[0];
	echo $username;
	echo $pieces[1];
	
	//Get the user files and list them. Don't show form/submits if user has no files
	$result = getFiles($userid);
	if(count($result)!=0) {
		echo "<form action='quizme.php' method='post' class='backend_FileLib' name='FileLibForm' onsubmit='return validateFileLibForm()'><table>";
		foreach($result as $row) {
			$id=$row['file_id'];
			//$filemeta = $id .', '. $row['parent_id'].', ' . $row['title'];
			$title = $row['title'];
			$link = "<a href='editor.php?id=$id&title=$title' class='user-file'>$title</a>";
			$checkbox = "<input type='checkbox' name='ids[]' value='$id' />";
			echo "<tr><td>$checkbox</td><td>$link</td></tr>";
		}
		echo "</table>
		<input type='submit' name='submitType' value='Make Quiz' class='libSubmit' />
		<!--<input type='submit' name='submitType' value='Delete' class='libSubmit' />-->
		</form>";
	}
	else {
		echo "You don't have any files yet";
	}

	//echo end of HTML doc
	echo $pieces[2];
}


?>