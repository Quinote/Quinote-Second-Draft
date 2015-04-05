<?php

include('credentials.php');

/*********************/
/*Connect to database*/
/*********************/
$connection = mysql_connect('localhost',$user,$password) or die("Couldn't connect to the server");
mysql_select_db($db,$connection) or die("Couldn't connect to the database");

//starts PHP session. Thats where login vars are stored
session_start();

/*********************/
/*
  Check if user has navigated here from login form
  Check if user exists
  Check if password is ok
  Grant cookie
  */
/*********************/
if ($_POST['login']) {
	if ($_POST['username'] && $_POST['password']) {
		$username = mysql_real_escape_string($_POST['username']);
		$password = mysql_real_escape_string(hash("sha512", $_POST['password']));
		$user = mysql_fetch_array(mysql_query("SELECT * FROM `users` WHERE `username`='$username'"));
		if ($user == '0') {
			die("That user doesn't exist. <a href='index.php'>&larr; Back</a>");
		}
		if ($user['password'] != $password) {
			die("Incorrect password <a href='index.php'>&larr; Back</a>");
		}
		$salt = hash("sha512", rand() . rand() . rand());
		/*setcookie("c_user",hash("sha512",$username),time()+24*60*60,"/");
		setcookie("c_salt",$salt,time() + 24*60*60, "/");*/
		
		$_SESSION['c_user']=hash("sha512",$username);
		$_SESSION['c_salt']=$salt;
		$userID = $user['id'];
		mysql_query("UPDATE `users` SET `salt`='$salt' WHERE `id`='$userID'");
		die("You are now logged in as $username");
	}
}

/*Check to see if user is logged in*/
include('islogged.php');
if($logged == true){
	die("You are logged in");
}

/*********************/
/*
  The login form (HTML)
  */
/*********************/
$page = "<body>
	<div style='width:80%; border: 1 px solid #e3e3e3;'>
		<h1>Login</h1>
		<form action='' method='post'>
			<table><tr>
				<td><b>Username:</b></td>
				<td><input type='text' name='username' /></td></tr>

				<tr>
				<td><b>Password:</b></td>
				<td><input type='password' name='password' /></td>
				</tr>

				<tr>
				<td><input type='submit' value='Login' name='login' /></td>
				</tr>

			</table>
		</form>
		
		<div>
		No account? <a href='register.php'>Register now</a>
		</div>
</div>
</body>";

echo $page;

?>