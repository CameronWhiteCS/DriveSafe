<?php

	require_once __DIR__ . '/../../DataManager.php';
	require_once __DIR__ . '/../../models/User.php';

	header('Content-Type: application/json');

	$_POST = (array) json_decode(file_get_contents('php://input'));

	$err_msg = 'An internal or external error occurred while attempting to preform this operation.';
    $conn = DataManager::getInstance()->getConnection();
    if(!$conn || $conn->connect_error) exit(json_encode(['error' => $err_msg]));

    function get_cities(){
    	global $conn;
    	global $err_msg;
    	$limit = isset($_GET['limit']) ? $_GET['limit'] : 25;
    	$city_name = '%' . (isset($_GET['cityName']) ? strtolower($_GET['cityName']) : '') . '%';
    	$statement = $conn->prepare('SELECT * FROM `cities` WHERE LOWER(`name`) LIKE ? LIMIT ?');
    	if(!$statement || !$statement->bind_param('ss', $city_name, $limit) || !$statement->execute()) exit(json_encode(['error' => $err_msg]));
    	$result_set = $statement->get_result();
    	$output = [];
    	while($row = $result_set->fetch_assoc()) {
    		array_push($output, $row);
    	}
    	exit(json_encode($output));
    }

    if($_SERVER['REQUEST_METHOD'] === 'GET') {
    	get_cities();
    }

?>