<?php

    require_once __DIR__ . '/../../DataManager.php';

    if($_SERVER['REQUEST_METHOD'] == 'GET') {
        header('Content-Type: application/json');
        $err_msg = "An internal or external error occurred while attempting to preform this operation.";
        $conn = DataManager::getInstance()->getConnection();
        if(!$conn || $conn->connect_error) exit(json_encode(['error' => $err_msg]));
        $statement = $conn->prepare('SELECT * FROM `insurers`');
        if(!$statement || !$statement->execute()) exit(json_encode(['error' => $err_msg]));
        $result_set = $statement->get_result();
        $output = [];
        while($row = $result_set->fetch_assoc()){
            array_push($output, $row);
        }
        exit(json_encode($output));
    }

?>