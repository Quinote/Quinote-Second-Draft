<?php

echo "<HTML>";

$header = file_get_contents('header.html');
echo $header;
echo "<HEAD>
	  <link rel='stylesheet' type='text/css' href='style/frontend.css' /></HEAD>";

echo "<BODY>";
$homepage = file_get_contents('frontend.html');
echo $homepage;

echo "</BODY></HTML>";

?>