<?php

    require_once __DIR__ . '/QuestionChoice.php';

    class QuizQuestion implements JsonSerializable {

        private $id;
        private $text;
        private $choices;

        private $new = true;

        public function __construct($text, $choices = []){
            $this->text = $text;
            $this->choices = $choices;
        }

        public function setId($id){
            $this->id = $id;
        }

        public function getId(){
            return $this->id;
        }

        public function addChoice(string $text, bool $correct){
            array_push($this->choices, new QuestionChoice($text, $correct));
        }

        public function getChoices(){
            return $this->choices;
        }

        public function setText($text){
            $this->text = $text;
        }

        public function getText(){
            return $this->text;
        }

        public function jsonSerialize() {
            return [
                'id' => $this->id,
                'text' => $this->text,
                'choices' => $this->choices
            ];
        }

    }

?>