<?php

require('trylogin/methods.php');

//checks for login and stores it in $logged
//If the user isn't logged in, redirect to login lander page
if(!islogged()) {
	header('Location: index.php');
}

$userid = $_SESSION['userid'];
$username=$_SESSION['username'];


//***************
//START HTML PAGE
//***************
echo "<HTML>";
echo file_get_contents('header.html');
echo "<BODY>";


$page = "<div id='wrap'>
    		<div id='container'>
    			<div id='header'>
                    <img width='5%' height='50px'  src='style/svg/pageMainShadow.svg'>
    				<div class='right-nav'>
    					<a id='login' class='nav' href='trylogin/logout.php'>Log Out</a>
    				</div>
    			</div>
    			<div id='content'>

    				<div id='main-content'>
	    				<div class='section' id='welcome'>
	    				    <div id='main_about'>
	    				        <h2>Welcome $username</h2>
	    				        <ul>
                                    <li id='show_filemaker'>Create New File</li>
                                    	<form id='filemaker' action='editor.php' method='post'>
                                    	<b>Title: </b><input type='text' name='title' value='Untitled' />
                                    	<input type='hidden' name='actionType' value='make' />
                                    	<input type='submit' value='Go' /></form>
                                    <li>Import from Google Drive</li>
                                </ul>

                                <h3>File Library</h3>";
echo $page;

$result = getFiles($userid);
foreach($result as $row) {
	$id=$row['file_id'];
	$filemeta = $id .', '. $row['parent_id'].', ' . $row['title'];
	$link = "<form action='editor.php' method='post' class='openFileLink'>
		<input type='hidden' name='actionType' value='open' />
		<input type='hidden' name='id' value='$id' />
		<input type='submit' value='$filemeta' />
		</form>";
	
	
	//$link = "<a href='editor.php?id=$id'>$filemeta</a><br />";
	echo $link;
}

$page = "	</div>
	 			</div>
	    				<div class='break'></div>
    				</div>
    			</div>
    			<footer>
    			Quinote 2015
    			</footer>
    		</div>
    	</div><!--end #wrap-->
</BODY></HTML>";
echo $page;

?>