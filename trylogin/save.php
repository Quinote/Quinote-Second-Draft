<?php

require('methods.php');

//make sure logged in user id = Post user id
$checkid = $_SESSION['userid'];

$userid = mysql_real_escape_string($_POST['userid']);
if(!islogged() || $userid != $checkid) {
	header('Location: index.php');
}


else {
$fileid = mysql_real_escape_string($_POST['fileid']);
//htmlspecialchars($_POST['content'],ENT_QUOTES
$content = mysql_real_escape_string($_POST['content']);

$res = mysql_query("UPDATE `files` SET `content`='$content' WHERE `file_id`='$fileid' AND `owner_id`='$userid'");
echo $res;
}

?>