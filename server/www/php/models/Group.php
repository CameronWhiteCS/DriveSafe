<?php

    require_once __DIR__ . '/../DataManager.php';
    require_once __DIR__ . '/Model.php';
    require_once __DIR__ . '/../include/queries.php';

    class Group implements JsonSerializable, Model {

        private $id;
        private $name;
        private $permissions;
        private $modified = "";

        private $new = true;

        function __construct(string $name, array $permissions){
            $this->name = $name;
            $this->permissions = $permissions;
        }

        /**
         * Using the provided group ID, a group is constructed from various database tables. 
         */
        public static function fromId($id){
            $conn = DataManager::getInstance()->getConnection();
            if(!$conn || $conn->connect_error) return null;
            $statement = $conn->prepare('SELECT * from `groups` WHERE id = ?');
            if(!$statement || !$statement->bind_param("i", $id) || !$statement->execute()) return null;
            $result_set = $statement->get_result();
            if($result_set->num_rows != 1) return null;
            $row = $result_set->fetch_assoc();
            return self::fromRow($row);
        }

        /**
         * Uses a row to construct a group object by fetching data from other tables as needed.
         */
        private static function fromRow($row){
            $permissions = self::fetchPermissions($row['id']);
            if($permissions === null) return null;
            $output = new Group($row['name'], $permissions);
            $output->setModified($row['modified']);
            $output->setId($row['id']);
            $output->setNew(false);
            return $output;
        }

        /**
         * Uses a group ID to get a list of all the group's permissions using the database.
         */
        private static function fetchPermissions(int $id){
            $output = array();
            $conn = DataManager::getInstance()->getConnection();
            if(!$conn || $conn->connect_error) return null;
            $statement = $conn->prepare('SELECT `permission` FROM `group_permissions` WHERE `group` = ?');
            if(!$statement || !$statement->bind_param("i", $id) || !$statement->execute()) return null;
            $result_set = $statement->get_result();
            while($row = $result_set->fetch_assoc()){
                array_push($output, $row['permission']);
            }
            return $output;
        }  

        /**
         * Returns an array of every group object present in the database
         */
        public static function getAll(){
            $conn = DataManager::getInstance()->getConnection();
            if(!$conn || $conn->connect_error) exit();
            $statement = $conn->prepare('SELECT `id` FROM `groups` WHERE 1');
            if(!$statement || !$statement->execute()) exit();
            $result_set = $statement->get_result();
            $group_ids = array();
            while($row = $result_set->fetch_assoc()){
                array_push($group_ids, $row['id']);
            }
            $output = array();
            foreach($group_ids as $id){
                array_push($output, self::fromId($id));
            }
            return $output;
        }

        /*Accessors*/
        public function setId(int $id){
            $this->id = $id;
        }

        public function getId(){
            return $this->id;
        }

        public function setName(string $name){
            $this->name = $name;
        }

        public function getName(){
            return $this->name;
        }

        public function setPermissions(array $permissions){
            $this->permissions = $permissions;
        }

        public function getPermissions(){
            return $this->permissions;
        }

        /*Inherited methods*/
        public function jsonSerialize(){
            return [
                'id' => $this->id,
                'name' => $this->name,
                'permissions' => $this->permissions,
                'modified' => $this->modified
            ];
        }

        function isNew(){
            return $this->new;
        }

        function setNew(bool $new){
            $this->new = $new;
        }

        public function setModified($modified){
            $this->modified = $modified;
        }

        public function getModified(){
            return $this->modified;
        }

        private function saveNewGroup(){
            $conn = DataManager::getConnection();
            if(!$conn || $conn->connect_error || !$conn->begin_transaction()) return false;

            //Insert primary table
            $statement = $conn->prepare('INSERT INTO `groups` (`id`, `name`) VALUES (?, ?)');
            if(!$statement || !$statement->bind_param("ss", $this->id, $this->name) || !$statement->execute()) return false;
            $this->id = $statement->insert_id;

            //Insert permissions
            $values = [];
            foreach($this->permissions as $permission) {
                array_push($values, $this->id);
                array_push($values, $permission);
            }

            $tuples = generate_prepared_tuples(2, sizeof($this->permissions));
            $typeString = $tuples[0];
            $tuples = $tuples[1];
            $statement = $conn->prepare('INSERT INTO `group_permissions` (`group`, `permission`) VALUES ' . $tuples);
            if(!$statement || !$statement->bind_param($typeString, ...$values) || !$statement->execute()) return false;

            if(!$conn->commit()) return false;
            return true;
        }

        private function saveOldGroup(){

            $conn = DataManager::getConnection();
            if(!$conn || $conn->connect_error || !$conn->begin_transaction()) return false;

            //Insert primary table
            $statement = $conn->prepare('UPDATE `groups` SET `id` = ?, `name` = ?, `modified` = NOW() WHERE `modified` = ? AND `id` = ?');
            if(!$statement || !$statement->bind_param("ssss", $this->id, $this->name, $this->modified, $this->id) || !$statement->execute()) return false;

             //Prevent stale data from being saved.
             if($statement->affected_rows <= 0) return false;

            //Erase old permissions
            $statement = $conn->prepare('DELETE FROM `group_permissions` WHERE `group` = ?');
            if(!$statement || !$statement->bind_param("s", $this->id) || !$statement->execute()) return false;


            //Insert permissions
            $values = [];
            foreach($this->permissions as $permission) {
                array_push($values, $this->id);
                array_push($values, $permission);
            }

            $tuples = generate_prepared_tuples(2, sizeof($this->permissions));
            $typeString = $tuples[0];
            $tuples = $tuples[1];
            $statement = $conn->prepare('INSERT INTO `group_permissions` (`group`, `permission`) VALUES ' . $tuples);
            if(!$statement || !$statement->bind_param($typeString, ...$values) || !$statement->execute()) return false;
            



            if(!$conn->commit()) return false;
            return true;
        }

        public function delete(){
            $conn = DataManager::getConnection();
            if(!$conn || $conn->connect_error) return false;
            $statement = $conn->prepare('DELETE FROM `groups` WHERE id = ?');
            if(!$statement || !$statement->bind_param("s", $this->id) || !$statement->execute()) return false;
            return true;
        }

        public function save(){
            if($this->new) {
                $output = $this->saveNewGroup();
                if($output) $this->new = false;
                return $output;
            } else {
                return $this->saveOldGroup();
            }
        }

    }

?>