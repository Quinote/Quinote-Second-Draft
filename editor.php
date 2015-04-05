<?php

require('trylogin/methods.php');

if(!islogged()) {
	header( 'Location: index.php' );
}


//future problems (an if _GET[id], else): should add error catch such that if user goes here directly while logged in, should make a new file

/*<form method="post" action="yourFileName.php">
    <input type="text" name="studentname">
    <input type="submit" value="click" name="submit"> <!-- assign a name for the button -->
</form>*/






//Starts up HTML page
echo "<HTML>";
echo file_get_contents('header.html');

/*

$var > 2 ? true : false

echo "<BODY>";
echo "<div class='service-container' data-service='<$_GET['id'] ? echo getFileContent($_GET['id']) : echo '' ?>'>
</div>"*/


echo "<BODY>";
echo "<form name='editor' action='' >";
echo "<textarea rows='10' cols='120' id='filecontent'>";
if($_GET['id']) {
	//echo $_GET['id'];
	$res = getFileContent($_GET['id']);
	echo $res;
}
echo "</textarea>";
echo "<input type='hidden' id='userid' value='".$_SESSION['userid']."'>";
echo "<input type='hidden' id='fileid' value='".$_GET['id']."'>";
echo "<input type='submit' name='submit' class='button' id='save_btn' value='Save' />";
echo "</form>";

//echo file_get_contents('../frontend.html');
echo "</BODY></HTML>";



?>