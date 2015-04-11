<?php

require('trylogin/methods.php');

global $message;

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
}
else {
	if(!islogged()) {
		//user navigated directly to this page without logging in
		$message = "You are not logged in";
	}
	else { //user did not come here from log in form, but is logged in
		$userid = $_SESSION['userid'];
		$username = $_SESSION['username'];
		$message = "Welcome $username";
	}
}

/*
* Starts up HTML page
*/
echo "<HTML>";
echo file_get_contents('header.html');

if($message != "Welcome $username") {
	//There has been some kind of error logging the user in
	//Display error page
	echo "<BODY>
	<span>$message</span><br />";
	echo file_get_contents('trylogin/login_error.html');
}
else {
	//display the landing page
	echo "<BODY>
	<div id='wrap'>
        <div id='container'>
            <div id='header'>
                <img width='5%' height='50px'  src='style/svg/pageMainShadow.svg'>
                <img width='12%' height='50px'  src='style/svg/typeQuinote.svg'>
                <div class='right-nav'>
                    <a id='home' class='nav' href='trylogin/logout.php'>Log Out</a>
                </div>
            </div>
        </div>
        <br><br><br><br><br>
    		<div id='homeContainer'>
                 <div id='openQuinote'>
                 	<h3>Make new file:</h3>
                	<form id='filemaker' action='editor.php' method='post'>
                                    <b>Title: </b><input type='text' name='title' value='Untitled' />
                                    <input type='hidden' name='actionType' value='make' />
                                    <input class='button quiButton' id='openQuinote' type='submit' value='Go' /></form>
                </div>
    			<div id='landingContent'>

    				<div id='main-content'>
	    				<div class='section' id='welcome'>
	    				    <div id='main_about'>
	    				        <h2>Welcome $username</h2>

                                <h3>File Library</h3>";
	
	//Get the user files and list them:
	$result = getFiles($userid);
	foreach($result as $row) {
		$id=$row['file_id'];
		//$filemeta = $id .', '. $row['parent_id'].', ' . $row['title'];
		$filemeta = $row['title'];
		$link = "<form action='editor.php' method='post' class='openFileLink'>
			<input type='hidden' name='actionType' value='open' />
			<input type='hidden' name='id' value='$id' />
			<input type='submit' value='$filemeta' />
			</form>";
		echo $link;
		}


	//echo the rest of the content
	echo "</div>
	    				</div>
	    				<div class='break'></div>
    				</div>
    			</div>
    			<footer>
                    <div class='nav-footer'>
                        <a id='home' class='nav-home' href='index.html'>Home</a>
                        <a id='about' class='nav-home' href='index_about.html'>About</a>
                        <a id='help' class='nav-home' href='index_help.html'>Help</a>
                    </div>
        			Quinote 2015
    			</footer>
    		</div>
    	</div>";
}


echo "</BODY></HTML>";
?>