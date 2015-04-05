<?php

require('trylogin/methods.php');

//checks for login and stores it in $logged
//If the user isn't logged in, redirect to login lander page
if(!islogged()) {
	header('Location: index.php');
}

$userid = $_SESSION['userid'];
$username=$_SESSION['username'];
$page="<BODY>
Welcome $username<br />
<a href='trylogin/logout.php'>Logout</a><br /><br />";
echo $page;

$result = getFiles($userid);
foreach($result as $row) {
	$id=$row['file_id'];
	$filemeta = $id .', '. $row['parent_id'].', ' . $row['title'];
	$link = "<a href='editor.php?id=$id'>$filemeta</a><br />";
	echo $link;
}

$page="</BODY>";
echo $page;

?>