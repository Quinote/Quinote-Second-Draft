<?php

echo "<HTML>";

$header = file_get_contents('header.html');
echo $header;

echo "<BODY>";
$homepage = file_get_contents('frontend.html');
echo $homepage;

echo "</BODY></HTML>";

?>