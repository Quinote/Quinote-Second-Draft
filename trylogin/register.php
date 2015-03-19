<?php

include('credentials.php');

/*********************/
/*Connect to database*/
/*********************/
$connection = mysql_connect('localhost',$user,$password) or die("Couldn't connect to the server");
mysql_select_db($db,$connection) or die("Couldn't connect to the database");


// Starts a PHP session. Thats where login status, etc is stored
session_start();


/*********************/
/*If user has submitted register form
  Make sure username isn't taken and they are being reasonable
  Add them to the users database
*/
/*********************/
if ($_POST['register']){
	if ($_POST['username'] && $_POST['password']){
		$username = mysql_real_escape_string($_POST['username']);
		$password = mysql_real_escape_string(hash("sha512",$_POST['password']));
		$check = mysql_fetch_array(mysql_query("SELECT * FROM `users` WHERE `username`='$username'"));
		if($check != '0'){
			die("That username already exists. <a href='register.php'>&larr; Back</a>");
		}
		if (!ctype_alnum($username)){
			die("Username must be alphanumeric. <a href='register.php'>&larr; Back</a>");
		}
		if (strlen($username) > 300){
			die("Sorry, this is an absurdly long username. Try again, with less than 300 characters");
		}
		$salt = hash("sha512", rand() . rand() . rand());
		mysql_query("INSERT INTO `users` (`username`,`password`,`salt`) VALUES ('$username', '$password', '$salt')");
		$_SESSION['c_user']=hash("sha512",$username);
		$_SESSION['c_salt']=$salt;
		
		/*setcookie("c_user",hash("sha512",$username),time() + 24*60*60, "/");
		setcookie("c_salt",$salt,time() + 24*60*60,"/");*/
		die("Your account has been created and you are now logged in.");
	}
}


/*********************/
/*HTML page*/
/*********************/

$page="<BODY>

<div>
	<h1>Register</h1>
	
	<form action='' method='post'>
		<table>

		<tr>	
		<td><b>Username:</b></td>
		<td><input type='text' name='username' /></td>
		</tr>

		<tr>
		<td><b>Password:</b></td>
		<td><input type='password' name='password' /></td>
		</tr>

		<tr>
		<td><input type='submit' name='register' value='Register' /></td>
		</tr>

		</table>

	</form>
</div>

</BODY>";

echo $page;

?>