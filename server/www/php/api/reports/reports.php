<?php

    require_once __DIR__ . '/../../models/User.php';
    require_once __DIR__ . '/../../models/AccidentReport.php';

    $KEY = '24b0721ea0c143acb1c5ab09c69f0fd7';

    $_POST = (array) json_decode(file_get_contents('php://input'));

    header('Content-Type: application/json');

    $conn = DataManager::getInstance()->getConnection();
    if(!$conn || $conn->connect_error) exit(json_encode(['error' => 'An internal or external error occurred while attempting to preform this operation.']));

    function create_new_report(){

        global $KEY;
        global $conn;

        $token = $_POST['token'];
        $user = User::fromSessionToken($token);
        if($user === null) exit(json_encode(['error' => 'Invalid session token.']));
        if(!$user->hasPermission('report.create')) exit(json_encode(['error' => 'You don\'t have permission to preform this operation.']));
        
        $latitude = $_POST['latitude'];
        $longitude = $_POST['longitude'];
        $address = $_POST['address'];
        $rain = $_POST['rain'] ? 1 : 0;
        $hail = $_POST['hail'] ? 1 : 0;
        $sleet = $_POST['snow'] ? 1 : 0;
        $snow = $_POST['snow'] ? 1 : 0;
        $fog = $_POST['fog'] ? 1 : 0;
        $wind = $_POST['wind'] ? 1 : 0;
    
        //Convert address into GPS coordinates
        if($address) {
            $_address = urlencode($address);
            $openCageData = json_decode(file_get_contents("https://api.opencagedata.com/geocode/v1/json?q=$_address&key=$KEY"));
            if(sizeof($openCageData->results) == 0) {
                exit(json_encode(['error' => 'No locations matched the provided address.']));
            } else {
                $bestIndex = 0;
                $bestConfidence = 0;
                for($i = 0; $i < sizeof($openCageData->results); $i++) {
                    if($openCageData->results[$i]->confidence > $bestConfidence) {
                        $bestConfidence = $openCageData->results[$i]->confidence;
                        $bestIndex = $i;
                    }
                }
                $latitude = $openCageData->results[$bestIndex]->geometry->lat;
                $longitude = $openCageData->results[$bestIndex]->geometry->lng;
            }
        }
    
        //Locate nearest city to coordinates after they've been determined    
        $sql =
        "SELECT * FROM `cities` 
        GROUP BY `name`
        ORDER BY SQRT((latitude - ?) * (latitude - ?) + (longitude - ?) * (longitude - ?)) ASC
        LIMIT 1";
    
        $statement = $conn->prepare($sql);
    
        if(!$statement || !$statement->bind_param("ssss", $latitude, $latitude, $longitude, $longitude) || !$statement->execute()) exit(json_encode(['error' => 'An internal or external error occurred while attempting to preform this operation.']));
    
        $result_set = $statement->get_result();
        $row = $result_set->fetch_assoc();
        $city_id = $row['id'];
    
        $report = new AccidentReport($user->getId(), $city_id, $address, $latitude, $longitude, $rain, $hail, $sleet, $snow, $fog, $wind);
        if(!$report->save()) {
            exit(json_encode(['error' => 'An internal or external error occurred while attempting to preform this operation.']));
        } 
    }

    function get_accidents(){
        global $conn;

        $city_id = $_GET['cityId'];
        $sql =
        "SELECT *
        FROM `accident_reports`
        WHERE `city` = ?";
        $statement = $conn->prepare($sql);
        if(!$statement || !$statement->bind_param("s", $city_id) || !$statement->execute()) exit(json_encode(['error' => 'An internal or external error occurred while attempting to preform this operation.']));
        $result_set = $statement->get_result();
        $output = [];
        while($row = $result_set->fetch_assoc()) {
            array_push($output, $row);
        }
        exit(json_encode($output));
    }

    if(isset($_GET['cityId'])) {
        get_accidents();
    } else {
        create_new_report();
    }

 
?>