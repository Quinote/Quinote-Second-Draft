<?php

require('methods.php');

if(!islogged()) {
	header( 'Location: index.php' );
}

//future problems: should add error catch such that if user goes here directly while logged in, should make a new file

if($_GET['id']) {
	echo $_GET['id'];
	$res = getFileContent($_GET['id']);
	echo $res;
}

//Starts up HTML page
echo "<HTML>";
echo file_get_contents('header.html');

echo "<BODY>";
echo file_get_contents('../frontend.html');
echo "</BODY></HTML>";

?>