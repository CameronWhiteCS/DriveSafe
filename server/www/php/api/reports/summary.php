<?php

    require_once __DIR__ . '/../../DataManager.php';

    header('Content-Type: application/json');

    $conn = DataManager::getInstance()->getConnection();
    $err_msg = 'An internal or external error occurred while attempting to preform this operation.';
    if(!$conn || $conn->connect_error) exit(json_encode(['error' => $err_msg]));

    $page_size = 20;
    $offset = 0;
    $city_name = "%";

    if(isset($_GET['pageSize'])) $page_size = $_GET['pageSize'];
    if(isset($_GET['page'])) $offset = $_GET['page'] * $page_size;
    if(isset($_GET['cityName'])) {
        $city_name = $city_name . $_GET['cityName'] . '%';
        $city_name = strtolower($city_name);
    }

    $statement = $conn->prepare(
       "SELECT *
        FROM (
                SELECT `cities`.`name`, `cities`.`id`, COUNT(*) as `accidents`
                FROM `cities`, `accident_reports`
                WHERE `cities`.`id` = `accident_reports`.`city`
                GROUP BY `cities`.`id`
                ORDER BY `accidents` DESC
                LIMIT ?
                OFFSET ?
        ) AS `t`
        WHERE LOWER(`t`.`name`) LIKE ?"
    );

    if(!$statement || !$statement->bind_param("sss", $page_size, $offset, $city_name) || !$statement->execute()) exit(json_encode(['error' => $err_msg]));

   $result_set = $statement->get_result();
   $accidentTotals = [];
   while($row = $result_set->fetch_assoc()){
       array_push($accidentTotals, $row);
   }

   exit(json_encode([
        'accidentTotals' => $accidentTotals,
        'numRows' => $result_set->num_rows,
        'pageSize' => $page_size
    ]));

?>