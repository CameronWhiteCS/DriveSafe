<?php

    require_once __DIR__ . '/../../DataManager.php';
    require_once __DIR__ . '/../../models/User.php';
    require_once __DIR__ . '/../../models/Quiz.php';
    require_once __DIR__ . '/../../models/QuizQuestion.php';

    header('Content-Type: application/json');
    $_POST = (array) json_decode(file_get_contents('php://input'));

    function create_new_quiz(){
        $user = User::fromSessionToken($_POST['token']);
        if($user === null) exit(json_encode(['error' => 'Invalid session token']));
        if(!$user->hasPermission('quiz.create')) exit(json_encode(['error' => 'You don\'t have permission to preform this operation.']));
        $user_id = $user->getId();
        $quiz = new Quiz("Untitled Quiz", $user_id, []);
        if(!$quiz->save()) exit(json_encode(['error' => 'An error occurred while attempting to preform this operation.']));

    }

    function get_descriptors(){
        $err_msg = "An internal or external error occurred while attempting to preform this operation.";
        $conn = DataManager::getInstance()->getConnection();
        if(!$conn || $conn->connect_error) exit(json_encode(['error' => $err_msg]));
        $statement = $conn->prepare('SELECT `id`, `name` FROM `quizzes` WHERE 1');
        if(!$statement || !$statement->execute())  exit(json_encode(['error' => $err_msg]));
        $result_set = $statement->get_result();
        $output = [];
        while($row = $result_set->fetch_assoc()){
            array_push($output, ['id' => $row['id'], 'name' => $row['name']]);
        }
        exit(json_encode($output));
    }

    function from_id(){
        $quiz = Quiz::fromId($_GET['id']);
        if($quiz !== null) {
            exit(json_encode($quiz));
        } else {
            exit(json_encode(['error' => 'Specified quiz not found.']));
        }
    }

    function delete_quiz(){
        $user = User::fromSessionToken($_POST['token']);
        if($user === null) exit(json_encode(['error' => 'Invalid session token']));
        $quiz = Quiz::fromId($_POST['id']);
        if($quiz === null) exit(json_encode(['error' => 'Quiz not found.']));
        if(($quiz->getAuthor() != $user->getId() && !$user->hasPermission('quiz.delete.other')) || (!$user->hasPermission('quiz.delete.self'))) exit(json_encode(['error' => 'You don\t have permission to preform this operation.']));
        if(!$quiz->delete()) exit(json_encode(['error' => 'The quiz could not be deleted.']));
    }

    function save_quiz(){
        $err_msg = "An internal or external error occurred while attempting to preform this operation.";
        $db_quiz = Quiz::fromId($_POST['quiz']->id);
        $user = User::fromSessionToken($_POST['token']);
        if($db_quiz === null || $user === null) exit(json_encode(['error' => $err_msg]));
        if(($db_quiz->getAuthor() != $user->getId() && !$user->hasPermission('quiz.modify.other')) || (!$user->hasPermission('quiz.modify.self'))) exit(json_encode(['error' => 'You don\t have permission to preform this operation.']));
        if($db_quiz->getModified() != $_POST['quiz']->modified) exit(json_encode(['error' => 'You are attempting to edit stale data. Aborting operation.']));
        $db_quiz->setQuestions([]);
        foreach($_POST['quiz']->questions as $question) {
            $newQuestion = new QuizQuestion($question->text);
            foreach($question->choices as $choice){
                $newQuestion->addChoice($choice->text, $choice->correct);
            }
            $db_quiz->addQuestion($newQuestion);
        }
        $db_quiz->setName($_POST['quiz']->name);
        if(!$db_quiz->save()) exit(json_encode(['error' => $err_msg]));
    }

    if(isset($_POST['token']) && isset($_POST['action']) && $_POST['action'] == 'create') {
        create_new_quiz();
    } else if($_SERVER['REQUEST_METHOD'] == 'GET' && !$_GET){
        $quizzes = Quiz::getAll();
        exit(json_encode($quizzes));
    } else if(isset($_GET['action']) && $_GET['action'] == 'get-descriptors') {
        get_descriptors();
    } else if(isset($_GET['id'])) {
        from_id();
    } else if(isset($_POST['action']) && $_POST['action'] == 'delete' && isset($_POST['id']) && isset($_POST['token'])) {
        delete_quiz();
    } else if (isset($_POST['action']) && $_POST['action'] == 'save' && isset($_POST['token']) && isset($_POST['quiz'])) {
        save_quiz();
    } else {
        exit(json_encode(['error' => 'Invalid request.']));
    }

?>