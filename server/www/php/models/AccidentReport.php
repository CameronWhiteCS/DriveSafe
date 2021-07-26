<?php

    require_once __DIR__ . '/../DataManager.php';
    require_once __DIR__ . '/Model.php';
    require_once __DIR__ . '/../include/queries.php';

    class AccidentReport implements JsonSerializable, Model {

        private $_new = true;
        private $id;
        private $author;
        private $city;
        private $date;
        private $latitude;
        private $longitude;
        private $address;
        private $rain;
        private $hail;
        private $sleet;
        private $snow;
        private $fog;
        private $wind;

        public function __construct($author, $city, $address, $latitude, $longitude, $rain, $hail, $sleet, $snow, $fog, $wind){
            $this->author = $author;
            $this->city = $city;
            $this->address = $address;
            $this->latitude = $latitude;
            $this->longitude = $longitude;
            $this->rain = $rain;
            $this->hail = $hail;
            $this->sleet = $sleet;
            $this->snow = $snow;
            $this->fog = $fog;
            $this->wind = $wind;
        }

        public function isNew(){
            return $this->_new;
        }

        public function getModified(){
            return NULL;
        }

        private function saveNew(){
            $conn = DataManager::getInstance()->getConnection();
            if(!$conn || $conn->connect_error) return false;

            $statement = $conn->prepare('INSERT INTO `accident_reports` (`author`, `city`, `address`, `latitude`, `longitude`, `rain`, `hail`, `sleet`, `snow`, `fog`, `wind`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
            $bind_params = [$this->author, $this->city, $this->address, $this->latitude, $this->longitude, $this->rain, $this->hail, $this->sleet, $this->snow, $this->fog, $this->wind];
            if(!$statement || !$statement->bind_param("sssssssssss", ...$bind_params) || !$statement->execute()) {
                exit("asdjsakdasduas");
                return $false;
            }
            $this->id = $statement->insert_id;
            $this->_new = false;

            return true;

        }

        public function fromRow($row){
            $report = new AccidentReport($row['author'], $row['city'], $row['address'], $row['date'], $row['latitude'], $row['longitude'], $row['rain'], $row['hail'], $row['sleet'], $row['snow'], $row['fog'], $row['wind']);
            $report->_new = false;
            $report->_id = $row['id'];
        }

        private function saveOld(){
            $conn = DataManager::getInstance()->getConnection();
            if(!$conn || $conn->connect_error) return false;

            $statement = $conn->prepare('INSERT UPDATE `accident_reports` SET `author` = ?, `city` = ?, `date` = ?, `latitude` = ?, `longitude` = ?, `address` = ?,  `rain` = ?, `hail` = ?, `sleet` = ?, `snow` = ?, `fog` = ?,  `wind` = ?, WHERE `id` = ?');
            $bind_params = [$this->author, $this->city, $this->date, $this->latitude, $this->longitude, $this->address, $this->rain, $this->hail, $this->sleet, $this->snow, $this->fog, $this->wind, $this->id];
            if(!$statement || !$statement->bind_param("sssssssssssss", ...$bind_params) || !$statement->execute()) return false;
            return true;

        }

        public function save(){
            if($this->_new) {
                return $this->saveNew();
            } else {
                return $this->saveOld();
            }
        }

        public function delete(){
            $conn = DataManager::getInstance()->getConnection();
            if(!$conn || $conn->connect_error) return false;

            $statement = $conn->prepare('DELETE FROM `accident_reports` WHERE `id` = ?');
            if(!$statement || $statement->bind_param("s", $this->id) || !$statement->execute()) return false;
            return true;
        }

        public function jsonSerialize(){
            return json_encode($this);
        }

    }

?>