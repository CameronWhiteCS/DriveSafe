<?php

    require_once __DIR__ . '/../DataManager.php';
    require_once __DIR__ . '/Model.php';
    require_once __DIR__ . '/QuizQuestion.php';
    require_once __DIR__ . '/../include/queries.php';

    class Quiz implements JsonSerializable, Model {

        private $id;
        private $name;
        private $author;
        private $questions = []; //array of QuizQuestion
        private $modified;

        private $new = true;

        function __construct(string $name, string $author, array $questions){
            $this->name = $name;
            $this->author = $author;
            $this->questions = $questions;
        }

        public function setModified($modified){
            $this->modified = $modified;
        }

        public function getModified(){
            return $this->modified;
        }

        public function setId($id){
            $this->id = $id;
        }

        public function getId(){
            return $this->id;
        }

        public function setName($name){
            $this->name = $name;
        }

        public function getName(){
            return $this->name;
        }

        public function setAuthor($author){
            $this->$author = $author;
        }

        public function getAuthor(){
            return $this->author;
        }

        public function setQuestions($questions){
            $this->questions = $questions;
        }

        public function getQuestions(){
            return $this->questions;
        }

        public function addQuestion($question){
            array_push($this->questions, $question);
        }

        private static function fetch_questions($id){
            $conn = DataManager::getConnection();
            if(!$conn || $conn->connect_error) return null;

            //Get questions
            $statement = $conn->prepare('SELECT * FROM `quiz_questions` WHERE `quiz` = ?');
            if(!$statement || !$statement->bind_param("s", $id) || !$statement->execute()) return null;
            $result_set = $statement->get_result();
            $questions = [];
            while($row = $result_set->fetch_assoc()){
                $question = new QuizQuestion($row['text']);
                $question->setId($row['id']);
                array_push($questions, $question);
            }
            //Get question choices
            foreach($questions as $question){
                $statement = $conn->prepare('SELECT * FROM `question_choices` WHERE `question` = ?');
                $question_id = $question->getId();
                if(!$statement || !$statement->bind_param("s", $question_id) || !$statement->execute()) return null;
                $result_set = $statement->get_result();
                while($row = $result_set->fetch_assoc()){
                    $question->addChoice($row['text'], $row['correct']);
                }
            }
            return $questions;
        }

        public static function fromRow($row){
            $id = $row['id'];
            $name = $row['name'];
            $author = $row['author'];
            $questions = self::fetch_questions($id);
            if($questions === null) return null;
            $modified = $row['modified'];

            $output = new Quiz($name, $author, $questions);

            $output->setModified($modified);
            $output->setId($id);
            $output->setNew(false);
            return $output;
            
        }

        public static function fromId(int $id){
            $conn = DataManager::getConnection();
            if(!$conn || $conn->connect_error) return null;


            $statement = $conn->prepare('SELECT * FROM `quizzes` WHERE `id` = ?');
            if(!$statement || !$statement->bind_param("s", $id) || !$statement->execute()) return null;

            $result_set = $statement->get_result();
            if($result_set->num_rows != 1) return null;

            $row = $result_set->fetch_assoc();
            return self::fromRow($row);
        }

        public function isNew(){
            return $this->new;
        }

        public function setNew($new) {
            $this->new = $new;
        }

        public static function getAll(){
            $conn = DataManager::getConnection();
            if(!$conn || $conn->connect_error) return null;
            $statement = $conn->prepare('SELECT * FROM `quizzes` WHERE 1');
            if(!$statement || !$statement->execute()) return null;
            $output = [];
            $result_set = $statement->get_result();
            while($row = $result_set->fetch_assoc()){
                $quiz = self::fromRow($row);
                array_push($output, $quiz);
            }
            return $output;
        }

        /**
         * 
         */
        private function erase_questions($conn){
            $statement = $conn->prepare('DELETE FROM `quiz_questions` WHERE `quiz` = ?');
            if(!$statement || !$statement->bind_param("s", $this->id) || !$statement->execute()) return false;
            return true;
        }

        private function erase_chocies($conn){
            foreach($this->questions as $question){
                foreach($question->getChoices() as $choice){
                    $question_id = $question->getId();
                    $statement = $conn->prepare('DELETE FROM `question_choices` WHERE `question` = ?');
                    if(!$statement || !$statement->bind_param("s", $question_id) || !$statement->execute()) return false;
                }
            }
            return true;
        }

        /**
         * Writes the questions to the database. Returns true on success and false on failure.
         * Due to having to retrieve the auto-generated question IDs, the generate_prepared_tuples function cannot be used here. 
         */
        private function write_questions($conn){
            foreach($this->questions as $question){
                $statement = $conn->prepare('INSERT INTO `quiz_questions` (`quiz`, `text`) VALUES (?, ?)');
                $text = $question->getText();
                if(!$statement || !$statement->bind_param("ss", $this->id, $text) || !$statement->execute()) return false;
                $question->setId($statement->insert_id);
            }
            return true;
        }

        /**
         * Takes the questions and writes the possible answers to the database. 
         */
        private function write_question_choices($conn){ 
          
            //Determine how many tuples are to be inserted.
            $numChoices = 0;
            foreach($this->questions as $question) {
                $numChoices = $numChoices + sizeof($question->getChoices());
            }
            if($numChoices <= 0) return true;
            
            $preparedTuple = generate_prepared_tuples(3, $numChoices);
            $typeString = $preparedTuple[0];
            $tuples = $preparedTuple[1];
            $statement = $conn->prepare('INSERT INTO `question_choices` (`question`, `text`, `correct`) VALUES ' . $tuples);
            $values = [];
            foreach($this->questions as $question){
                foreach($question->getChoices() as $choice){
                    array_push($values, $question->getId());
                    array_push($values, $choice->getText());
                    array_push($values, $choice->isCorrect());
                }
            }

            if(!$statement || !$statement->bind_param($typeString, ...$values) || !$statement->execute()) return false;
            
            return true;

        }

        private function saveNewQuiz(){

            $conn = DataManager::getConnection();
            if(!$conn || $conn->connect_error || !$conn->begin_transaction()) return false;

            //Primary table
            $statement = $conn->prepare('INSERT INTO `quizzes` (`name`, `author`) VALUES (?, ?)');
    
            if(!$statement || !$statement->bind_param("ss", $this->name, $this->author) || !$statement->execute()) return false;

            //Update object ID
            $this->id = $statement->insert_id;

            //Write questions and question choices
            if(sizeof($this->questions) > 0){
                if(!$this->write_questions($conn)) return false;
                if(!$this->write_question_choices($conn)) return false;
            }

            if(!$conn->commit()) return false;
            return true;
        }

        private function saveOldQuiz(){


            $conn = DataManager::getConnection();
            if(!$conn || $conn->connect_error || !$conn->begin_transaction()) return false;

            //Primary table
            $statement = $conn->prepare('UPDATE `quizzes` SET `id` = ?, `name` = ?, `author` = ?, `modified` = NOW() WHERE `id` = ? AND `modified` = ?');
            if(!$statement || !$statement->bind_param("sssss", $this->id, $this->name, $this->author, $this->id, $this->modified) || !$statement->execute()) return false;

            //Concurrency
            if($statement->affected_rows <= 0) return false;


            if(!self::erase_chocies($conn) || !self::erase_questions($conn) || !self::write_questions($conn) || !self::write_question_choices($conn)) return false;

            if(!$conn->commit()) return false;

            return true;

            
        }

        public function save(){
            if($this->new) {
                $output = $this->saveNewQuiz();
                if($output) $this->new = false;
                return $output;
            } else {
                return $this->saveOldQuiz();
            }

        }

        public function delete(){
            $conn = DataManager::getConnection();
            if(!$conn || $conn->connect_error) return false;
            $statement = $conn->prepare('DELETE FROM `quizzes` WHERE `id` = ?');
            if(!$statement || !$statement->bind_param("i", $_POST['id']) || !$statement->execute()) return false;
            return true;
        }
        
        public function jsonSerialize() {
            return [
                'id' => $this->id,
                'name' => $this->name,
                'author' => $this->author,
                'questions' => $this->questions,
                'modified' => $this->modified,
            ];
        }

    }

?>