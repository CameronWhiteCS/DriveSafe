<?php

    require_once __DIR__ . '/../DataManager.php';
    require_once __DIR__ . '/Group.php';
    require_once __DIR__ . '/Model.php';
    require_once __DIR__ . '/../include/queries.php';
    require_once __DIR__ . '/../include/uuid.php';

    //TODO: getters, setters, save() method
    class User implements JsonSerializable, Model {
     
        //Object properties
        private $id;
        private $email;
        private $password_hash;
        private $first_name;
        private $last_name;
        private $address;
        private $phone_number;
        private $insurance_company;
        private $dashcam;
        private $creation_ip;
        private $last_ip;
        private $validated;
        private $modified = "";

        private $permissions = [];
        private $groups = [];
        private $session_tokens = [];

        //Interface properties
        private $new = true;

        /**
         * Groups: Array of group objects, NOT group id's!
         * 
         */

        public function __construct(string $email, string $password_hash, string $first_name, string $last_name, string $address, string $phone_number, string $insurance_company, bool $dashcam, string $creation_ip, string $last_ip, bool $validated, array $permissions, array $groups, array $session_tokens){
            $this->email = $email;
            $this->password_hash = $password_hash;
            $this->first_name = $first_name;
            $this->last_name = $last_name;
            $this->address = $address;
            $this->phone_number = $phone_number;
            $this->insurance_company = $insurance_company;
            $this->dashcam = $dashcam;
            $this->creation_ip = $creation_ip;
            $this->last_ip = $last_ip;
            $this->validated = $validated;
            $this->permissions = $permissions;
            $this->groups = $groups;
            $this->session_tokens = $session_tokens;
        }

        public static function fromId(string $id){
            $row = self::fetchRow('id', $id);
            if($row === null) return null;
            return self::fromRow($row);
        }

        public static function fromEmail(string $email){
            $row = self::fetchRow('email', $email);
            if($row == null) return null;
            return self::fromRow($row);
        }

        public static function fromSessionToken(string $session_token){
            $conn = DataManager::getConnection();
            if(!$conn || $conn->connect_error) return null;

            //$statement = $conn->prepare('DELETE FROM `session_tokens` WHERE DATEDIFF(NOW(), `date`) > 7');
            //if(!$statement || !$statement->execute()) return null;

            $statement = $conn->prepare('SELECT `user` FROM `session_tokens` WHERE `token` = ? AND DATEDIFF(NOW(), `date`) < 7');
            if(!$statement || !$statement->bind_param("s", $session_token) || !$statement->execute()) return null;
            $result_set = $statement->get_result();
            if($result_set->num_rows != 1) return null;
            $row = $result_set->fetch_assoc();
            $id = $row['user'];

            $row = self::fetchRow('id', $id);
            if($row == null) return null;
            return self::fromRow($row);
        }

        public static function fromRow($row){
            $id = $row['id'];
            $permissions = self::fetchPermissions($id);
            $groups = self::fetchGroups($id);
            $session_tokens = self::fetchSessionTokens($id);
            if($permissions === null || $groups === null || $session_tokens === null) return null;
            $output =  new User($row['email'], $row['password_hash'], $row['first_name'], $row['last_name'], $row['address'], $row['phone_number'], $row['insurance_company'], $row['dashcam'], $row['creation_ip'], $row['last_ip'], $row['validated'], $permissions, $groups, $session_tokens);
            $output->setId($row['id']);
            $output->setModified($row['modified']);
            $output->setNew(false);
            return $output;
        }

        private static function fetchRow($column, $value){
            $conn = DataManager::getInstance()->getConnection();
            if(!$conn || $conn->connect_error) return null;
            $statement = $conn->prepare('SELECT * FROM `users` WHERE `' . $column . '` = ?');
            if(!$statement) return null;
            if(!$statement->bind_param("s", $value)) return null;
            if(!$statement->execute()) return null;
            $result_set = $statement->get_result();
            if($result_set->num_rows != 1) return null;
            $row = $result_set->fetch_assoc();
            return $row;
        }

        public function hasPermission(string $permission){
            foreach($this->permissions as $_permission){
                if($_permission == $permission || $permission == "*") return true;
            }
            foreach($this->groups as $group) {
                foreach($group->getPermissions() as $_permission){
                    if($_permission == $permission || $permission == "*") return true;
                }
            }
            return false;
        }

        private static function fetchPermissions(string $id){
            $conn = DataManager::getInstance()->getConnection();
            if(!$conn || $conn->connect_error) exit();
            $statement = $conn->prepare('SELECT `permission` FROM `user_permissions` WHERE `user` = ?');
            if(!$statement) exit();
            if(!$statement->bind_param("i", $id)) exit();
            if(!$statement->execute()) exit();
            $result_set = $statement->get_result();
            $output = array();
            while($row = $result_set->fetch_assoc()){
                array_push($output, $row['permission']);
            }
            return $output;
        }

        private static function fetchGroups(string $id){
            $output = array();
            $conn = DataManager::getInstance()->getConnection();
            if(!$conn || $conn->connect_error) exit();
            $statement = $conn->prepare('SELECT * FROM `group_memberships` WHERE `user` = ?');
            if(!$statement) exit();
            if(!$statement->bind_param("i", $id)) exit();
            if(!$statement->execute()) exit();
            $result_set = $statement->get_result();
            $output = array();
            while($row = $result_set->fetch_assoc()){
                array_push($output, Group::fromId($row['group']));
            }
            return $output;
        }

        private static function fetchSessionTokens(string $id){
            $output = array();
            $conn = DataManager::getInstance()->getConnection();
            if(!$conn || $conn->connect_error) exit();
            $statement = $conn->prepare('SELECT `token` FROM `session_tokens` WHERE `user` = ?');
            if(!$statement) exit();
            if(!$statement->bind_param("i", $id)) exit();
            if(!$statement->execute()) exit();
            $result_set = $statement->get_result();
            while($row = $result_set->fetch_assoc()){
                array_push($output, $row['token']);
            }
            return $output;
        }

        /*Accessors*/
        public function setId($id){
            $this->id = $id;
        }

        public function getId(){
            return $this->id;
        }

        public function getEmail(){
            return $this->email;
        }

        public function setEmail(string $email){
            $this->email = $email;
        }

        public function GetPasswordHash(){
            return $this->password_hash;
        }

        public function setPasswordHash(string $password_hash){
            $this->password_hash = $password_hash;
        }

        public function getFirstName(){
            return $this->first_name;
        }

        public function setFirstName(string $first_name){
            $this->first_name = $first_name;
        }

        public function getLastName(){
            return $this->last_name;
        }

        public function setlastName(string $last_name){
            $this->last_name = $last_name;
        }

        public function getAddress(){
            return $this->address;
        }

        public function setAddress(string $address){
            $this->address = $address;
        }

        public function getPhoneNumber(){
            return $this->phone_number;
        }

        public function setPhoneNumber(string $phone_number){
            $this->phone_number = $phone_number;
        }

        public function getInsuranceCompany(){
            return $this->insurance_company;
        }

        public function setInsuranceCompany(string $insurance_company){
            $this->insurance_company = $insurance_company;
        }

        public function getDashcam(){
            return $this->dashcam;
        }

        public function setDashcam(bool $dashcam){
            $this->dashcam = $dashcam;
        }

        public function getCreationIp(){
            return $this->creation_ip;
        }

        public function getlastIp(){
            return $this->last_ip;
        }

        public function setLastIp(string $last_ip){
            $this->last_ip = $last_ip;
        }

        public function getValidated(){
            return $this->validated;
        }

        public function setValidated(bool $validated){
            $this->validated = $validated;
        }

        public function getPermissions(){
            return $this->permissions;
        }

        public function setPermissions(array $permissions){
            $this->permissions = $permissions;
        }

        public function getGroups(){
            return $this->groups;
        }

        public function setGroups(array $groups){
            $this->groups = $groups;
        }

        public function getSessionTokens(){
            return $this->session_tokens;
        }

        public function setSessionTokens(array $session_tokens){
            $this->session_tokens = $session_tokens;
        }

        public function isNew(){
            return $this->new;
        }

        public function setNew(bool $new){
            $this->new = $new;
        }

        public function setModified($modified) {
            $this->modified = $modified;
        }

        public function getModified(){
            return $this->modified;
        }

        private function newUser(){

            $this->id = gen_uuid();

            $conn = DataManager::getConnection();
            if(!$conn || $conn->connect_error) return false;

            if(!$conn->begin_transaction()) return false;

            //Write to users table
            $statement = $conn->prepare('INSERT INTO `users` (`id`, `email`, `password_hash`, `first_name`, `last_name`, `address`, `phone_number`, `insurance_company`, `dashcam`, `creation_ip`, `last_ip`, `validated`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
            if(!$statement || !$statement->bind_param("ssssssssssss", $this->id, $this->email, $this->password_hash, $this->first_name, $this->last_name, $this->address, $this->phone_number, $this->insurance_company, $this->dashcam, $this->creation_ip, $this->last_ip, $this->validated)) {
                return false;
            }
            if(!$statement->execute()) return false;

            //Write permissions
            if(sizeof($this->permissions) > 0) {
                $preparedTuple = generate_prepared_tuples(2, sizeof($this->permissions));
                $bindParams = [];
                foreach($this->permissions as $permission){
                    array_push($bindParams, $this->id);
                    array_push($bindParams, $permission);
                }
    
                $statement = $conn->prepare("INSERT INTO `user_permissions` (`user`, `permission`) VALUES " . $preparedTuple[1]);
                if(!$statement || !$statement->bind_param($preparedTuple[0], ...$bindParams) || !$statement->execute()) return false;
            }

            //Write groups
            if(sizeof($this->groups) > 0) {
                $preparedTuple = generate_prepared_tuples(2, sizeof($this->groups));
                $bindParams = [];
                foreach($this->groups as $group){
                    array_push($bindParams, $this->id);
                    array_push($bindParams, $group->getId());
                }
                $statement = $conn->prepare("INSERT INTO `group_memberships` (`user`, `group`) VALUES " . $preparedTuple[1]);
                if(!$statement || !$statement->bind_param($preparedTuple[0], ...$bindParams) || !$statement->execute()) return false;
            }

            //Write session tokens
            if(sizeof($this->session_tokens) > 0) {
                $preparedTuple = generate_prepared_tuples(2, sizeof($this->session_tokens) );
                $bindParams = [];
                foreach($this->session_tokens as $token){
                    array_push($bindParams, $this->id);
                    array_push($bindParams, $token);
                }
                $statement = $conn->prepare("INSERT INTO `session_tokens` (`user`, `token`) VALUES " . $preparedTuple[1]);
                if(!$statement || !$statement->bind_param($preparedTuple[0], ...$bindParams) || !$statement->execute()) return false;
            }

        
            if(!$conn->commit()) return false;

            return true;

        }

        private function saveUser(){

            $conn = DataManager::getConnection();
            if(!$conn || $conn->connect_error) return false;
            if(!$conn->begin_transaction()) return false;

            //Save primary table
            $statement = $conn->prepare('UPDATE `users` SET `email` = ?, `password_hash` = ?, `first_name` = ?, `last_name` = ?, `address` = ?, `phone_number` = ?, `insurance_company` = ?, `dashcam` = ?, `creation_ip` = ?, `last_ip` = ?, `validated` = ?, `modified` = NOW() WHERE `id` = ? AND `modified` = ?');
            if(!$statement || !$statement->bind_param("sssssssssssss", $this->email, $this->password_hash, $this->first_name, $this->last_name, $this->address, $this->phone_number, $this->insurance_company, $this->dashcam, $this->creation_ip, $this->last_ip, $this->validated, $this->id, $this->modified) || !$statement->execute()) return false;
        

             //Prevent stale data from being saved.
            if($statement->affected_rows <= 0) return false;


            //Save permissions
            if(sizeof($this->permissions) > 0){
                $statement = $conn->prepare('DELETE FROM `user_permissions` WHERE `user` = ?');
                if(!$statement || !$statement->bind_param("s", $this->id) || !$statement->execute()) return false;

                $values = [];
                foreach($this->permissions as $permission){
                    array_push($values, $this->id);
                    array_push($values, $permission);
                }
                $prepared_tuple = generate_prepared_tuples(2, sizeof($this->permissions) );
                $statement = $conn->prepare('INSERT INTO `user_permissions` VALUES ' . $prepared_tuple[1]);
                if(!$statement || !$statement->bind_param($prepared_tuple[0], ...$values) || !$statement->execute()) return false;
                return true;
            }

            //Save groups
            if(sizeof($this->groups) > 0){        
                              
                $statement = $conn->prepare('DELETE FROM `group_memberships` WHERE `user` = ?');
                if(!$statement || !$statement->bind_param("s", $this->id) || !$statement->execute()) return false;
                

                $values = [];
                foreach($this->groups as $group){
                    array_push($values, $this->id);
                    array_push($values, $group->getId());
                }

                $prepared_tuple = generate_prepared_tuples(2, sizeof($this->groups) );
                $statement = $conn->prepare('INSERT INTO `group_memberships` (`user`, `group`) VALUES ' . $prepared_tuple[1]);
                if(!$statement || !$statement->bind_param($prepared_tuple[0], ...$values) || !$statement->execute()) { 
                    return false;
                }
       
            }

            //Save session tokens
            if(sizeof($this->session_tokens) > 0){
                $statement = $conn->prepare('DELETE FROM `session_tokens` WHERE `user` = ?');
                if(!$statement || !$statement->bind_param("s", $this->id) || !$statement->execute()) return false;
        

                $values = [];
                foreach($this->session_tokens as $token){
                    array_push($values, $this->id);
                    array_push($values, $token);
                }

                $prepared_tuple = generate_prepared_tuples(2, sizeof($this->session_tokens));
                $statement = $conn->prepare('INSERT INTO `session_tokens` (`user`, `token`) VALUES ' . $prepared_tuple[1]);
                if(!$statement || !$statement->bind_param($prepared_tuple[0], ...$values) || !$statement->execute()) return false;
            }
            

            if(!$conn->commit()) return false;
            return true;


        }  

        public function save(){
            if($this->new){
                $output =  $this->newUser();
                if($output) $this->new = false;
                return $output;
            } else {
                return $this->saveUser();
            }
        }

        //TODO: 
        public function delete(){

        }

        public function jsonSerialize() {
            return [
                'id' => $this->id,
                'email' => $this->email,
                'firstName' => $this->first_name,
                'lastName' => $this->last_name,
                'permissions' => $this->permissions,
                'groups' => $this->groups
            ];
        }

    }

?>