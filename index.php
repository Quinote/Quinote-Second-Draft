<?php

require('trylogin/methods.php');


global $message;

/*********************/
/*
  Check if user has navigated here from login form
  Check if user exists
  Check if password is ok
  Add them to $_SESSION
  Redirect to editor.php
  
  */
/*********************/
if ($_POST['login']) {
	if ($_POST['username'] && $_POST['password']) {
		$username = mysql_real_escape_string($_POST['username']);
		$password = mysql_real_escape_string(hash("sha512", $_POST['password']));
		$user = mysql_fetch_array(mysql_query("SELECT * FROM `users` WHERE `username`='$username'"));
		if ($user == '0') {
			$message = "Incorrect user/password combination";
			//die("That user doesn't exist. <a href='index.php'>&larr; Back</a>");
			/*echo 'reached';
			$message = "user doesn't exist";
			var_dump($message);*/
		}
		else if ($user['password'] != $password) {
			//die("Incorrect password. <a href='index.php'>&larr; Back</a>");
			$message = "Incorrect user/password combination";
			//var_dump($message);
		}
		else {
		$salt = hash("sha512", rand() . rand() . rand());
		/*setcookie("c_user",hash("sha512",$username),time()+24*60*60,"/");
		setcookie("c_salt",$salt,time() + 24*60*60, "/");*/
		
		$_SESSION['c_user']=hash("sha512",$username);
		$_SESSION['c_salt']=$salt;
		$userID = $user['id'];
		$_SESSION['userid']=$userID;
		$_SESSION['username']=$username;
		
		mysql_query("UPDATE `users` SET `salt`='$salt' WHERE `id`='$userID'");
		//die("You are now logged in as $username");
		header( 'Location: filebrowser.php' );
		}
	}
}

/*Check to see if user is logged in*/
/*If they are logged in, redirect to the active user's files*/
if(islogged()){
	header( 'Location: filebrowser.php' );
}

if(!$message) {
	$message = 'Welcome';
}

// ****************
//  START HTML PAGE
// ****************
echo "<HTML>";
echo file_get_contents('header.html');


/*********************/
/*
  The login form (HTML)
  */
/*********************/
$page = "<body>
	<div style='width:80%; border: 1 px solid #e3e3e3; padding: 15px; margin:10%'>
	
	<div id='formdiv' border='1 px' padding='10px'>
	<span id='message'>$message</span>
	
	<form action='' method='post'>
		<table>
			<tr>
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
	</div><!--end formdiv-->
	

		<div>
		No account? <a href='trylogin/register.php'>Register now</a><br />
		</div>
		<br />
		
		<div>
		You will not be able to save and store your files here without an account. However you can use our <a href='anon.php'>anonymous editor</a> and still generate quizzes! 
		</div>
</div>
</body></HTML>";

//display HTML login form
echo $page;

?>