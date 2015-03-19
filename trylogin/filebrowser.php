<?php

include('credentials.php');

/*********************/
/*Connect to database*/
/*********************/
$connection = mysql_connect('localhost',$user,$password) or die("Couldn't connect to the server");
mysql_select_db($db,$connection) or die("Couldn't connect to the database");

//starts PHP session. Thats where login vars are stored:
session_start();

//checks for login and stores it in $logged
//If the user isn't logged in, redirect to login lander page
include('islogged.php');
if(!$logged) {
header('Location: index.php');
}

$username=$_SESSION['username'];
$page="<BODY>
Welcome $username<br />
<a href='logout.php'>Logout</a><br /><br />

Text editor goes here
</BODY>";

echo $page

?>