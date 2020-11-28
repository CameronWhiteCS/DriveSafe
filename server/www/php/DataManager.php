<?php

    class DataManager {

        private static $instance = NULL;

        private final function __construct(){

        }

        public function getConnection(){
            return new mysqli("127.0.0.1", "dbuser", "cmmAyskQwmAI1fQ7vJM7", "app");
        }

        public static function getInstance(){
            if(static::$instance == NULL){
                static::$instance = new DataManager();
                return static::$instance;
            } else {
                return static::$instance;
            }
        }

    }

?>
