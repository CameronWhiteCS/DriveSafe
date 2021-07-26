<?php

	require_once __DIR__ . '/../../DataManager.php';
	require_once __DIR__ . '/../../models/User.php';

	header('Content-Type: application/json');

	$_POST = (array) json_decode(file_get_contents('php://input'));
	$conn = DataManager::getInstance()->getConnection();
	$err_msg = 'An internal or external error occurred while attempting to perform this operation.';
	if(!$conn || $conn->connect_error) exit(json_encode(['error' => $err_msg]));

	function get_city_by_id($id){
		global $conn;
		$statement = $conn->prepare("SELECT * FROM `cities` WHERE `id` = ?");
		if(!$statement || !$statement->bind_param('s', $id) || !$statement->execute()) return null;
		$result_set = $statement->get_result();
		if($result_set->num_rows === 0) return null;
		return $result_set->fetch_assoc();
	}



	function check_duplicate($city1, $city2){
		global $conn;
		global $err_msg;
		$statement = $conn->prepare("SELECT * FROM `rivalries` WHERE (`city1` = ? AND `city2` = ?) OR (`city1` = ? AND `city2` = ?) LIMIT 1");
		if(!$statement || !$statement->bind_param('ssss', $city1, $city2, $city2, $city1) || !$statement->execute()) exit(json_encode(['error' => $err_msg]));
		$result_set = $statement->get_result();
		if($result_set->num_rows > 0) exit(json_encode(['error' => 'That rivalry already exists']));

	}

	function get_rivalries(){

		$sql = "SELECT * FROM `rivalries` WHERE 1";
		$query_string = '';
		$bind_params = [];
		global $err_msg;
		global $conn;

		if(isset($_GET['city'])) {
			$sql = $sql . ' AND (`city1` = ? OR `city2` = ?)';
			array_push($bind_params, $_GET['city']);
			array_push($bind_params, $_GET['city']);
			$query_string = $query_string . 'ss';
		}

		if(isset($_GET['limit'])) {
			$sql = $sql . ' LIMIT ?';
			$query_string = $query_string . 's';
			array_push($bind_params, $_GET['limit']);
		}

		$statement = $conn->prepare($sql);
		if(!$statement) exit(json_encode(['error' => $err_msg]));
		if($query_string !== '') {
			if(!$statement->bind_param($query_string, ...$bind_params)) exit(json_encode(['error' => $err_msg]));
		}

		if(!$statement->execute()) exit(json_encode(['error' => $err_msg]));

		$result_set = $statement->get_result();
		$rivalries = [];
		while($row = $result_set->fetch_assoc()){
			array_push($rivalries, $row);
		}

		$output = [];
		foreach($rivalries as $rivalry) {
			array_push($output, ['city1' => get_city_by_id($rivalry['city1']),
				'city2' => get_city_by_id($rivalry['city2'])
			]);
		}

		exit(json_encode($output));

	}

	function create_rivalry(){
		$token = $_POST['token'];
		$user = User::fromSessionToken($token);
		$city1 = $_POST['city1'];
		$city2 = $_POST['city2'];
		global $conn;
		global $err_msg;

		if($user === null) exit(json_encode(['error' => 'Invalid session token']));
		if(!$user->hasPermission('rivalry.create')) exit(json_encode(['error' => 'You don\'t have permission to perform this operation.']));

		check_duplicate($city1, $city2);
		if($city1 == $city2) exit(json_encode(['error' => 'A city cannot be a rival with itself.']));


		$statement = $conn->prepare("INSERT INTO `rivalries` (`city1`, `city2`) VALUES (?, ?)");
		if(!$statement || !$statement->bind_param('ss', $city1, $city2) || !$statement->execute()) exit(json_encode(['error' => $err_msg]));
	}

	function delete_rivalry(){
		$token = $_POST['token'];
		$user = User::fromSessionToken($token);
		$city1 = $_POST['city1'];
		$city2 = $_POST['city2'];
		global $conn;
		global $err_msg;

		if($user === null) exit(json_encode(['error' => 'Invalid session token']));
		if(!$user->hasPermission('rivalry.delete')) exit(json_encode(['error' => 'You don\'t have permission to perform this operation.']));


		$statement = $conn->prepare("DELETE FROM `rivalries` WHERE (`city1` = ? AND `city2` = ?) OR (`city1` = ? AND `city2` = ?)");
		if(!$statement || !$statement->bind_param('ssss', $city1, $city2, $city2, $city1) || !$statement->execute()) exit(json_encode(['error' => $err_msg]));

	}

	if(!$_POST && $_SERVER['REQUEST_METHOD'] === 'GET') {

		get_rivalries();

	} else if (isset($_POST['token']) && isset($_POST['city1']) && isset($_POST['city2']) && isset($_POST['action']) && $_POST['action'] === 'create'){

		create_rivalry();

	} else if(isset($_POST['token']) && isset($_POST['action']) && $_POST['action'] === 'delete' && isset($_POST['city1']) && isset($_POST['city2'])) {

		delete_rivalry();

	} else {

		exit(json_encode(['error' => 'Invalid request']));

	}


?>