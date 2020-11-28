<?php

    class QuestionChoice implements JsonSerializable {

        //question, text, correct
        private $text;
        private $correct;

        public function isCorrect(){
            return $this->correct;
        }

        public function getText(){
            return $this->text;
        }

        public function __construct(string $text, bool $correct){
            $this->text = $text;
            $this->correct = $correct;
        }

        public function jsonSerialize() {
            return [
                'text' => $this->text,
                'correct' => $this->correct
            ];
        }

    }

?>