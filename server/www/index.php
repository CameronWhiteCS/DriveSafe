<?php


	require_once __DIR__ . '/php/models/AccidentReport.php';
	


	$report = new AccidentReport('c3b06734-fa42-48ff-becf-043f6801cc1d', '', '3', '3', '0', '0', '0', '0', '0', '0');
	var_dump($report->save());

?>