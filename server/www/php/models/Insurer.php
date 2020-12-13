<?php

    require_once __DIR__ . '/Model.php';
    require_once __DIR__ . '/../DataManager.php';

    class Insurer implements JsonSerializable, Model {

        private function __construct(int $id, string $name){
            $this->id = $id;
            $this->name = $name;
        }

        public function getId(){
            return $this->id;
        }

        public function getname(){
            return $this->name;
        }


        public static function fromId(int $id){
            $conn = DataManager::getInstance()->getConnection();
            if(!$conn || $conn->connect_error) return null;
            $statement = $conn->prepare('SELECT * FROM `insurers` WHERE `id` = ? LIMIT 1');
            if(!$statement || !$statement->bind_param("s", $id) || !$statement->execute()) return null;
            $result_set = $statement->get_result();
            if($result_set->num_rows <= 0) return null;
            $row = $result_set->fetch_assoc();
            return self::fromRow($row);
        }

        public static function fromRow($row){
            return new Insurer($row['id'], $row['name']);
        }

        public function isNew(){
            return false;
        }

        public function getModified(){
            return NULL;
        }

        public function save(){
            //TODO
        }

        public function delete(){
            //TODO
        }

        public function jsonSerialize() {
            return [
                'id' => $this->id,
                'name' => $this->name
            ];
        }

    }

?>