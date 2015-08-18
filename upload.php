<?php
$output_dir = "../images/";
if(isset($_FILES["images"]))
{
	$ret = array();

	$error =$_FILES["images"]["error"];
	//You need to handle  both cases
	//If Any browser does not support serializing of multiple files using FormData()
	if(!is_array($_FILES["images"]["name"])) //single file
	{
 	 	$fileName = $_FILES["images"]["name"];
 		move_uploaded_file($_FILES["images"]["tmp_name"],$output_dir.$fileName);
    	$ret[]= $fileName;
	}
	else  //Multiple files, file[]
	{
	  $fileCount = count($_FILES["images"]["name"]);
	  for($i=0; $i < $fileCount; $i++)
	  {
	  	$fileName = $_FILES["images"]["name"][$i];
		move_uploaded_file($_FILES["images"]["tmp_name"][$i],$output_dir.$fileName);
	  	$ret[]= $fileName;
	  }

	}
    echo json_encode($ret);
 }