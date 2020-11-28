<?php

    require_once __DIR__ . '/../../models/User.php';

    if(!$_POST) $_POST = (array) json_decode(file_get_contents('php://input'));

    header('Content-Type: application/json');

    if(isset($_POST['token'])) {
        $user = User::fromSessionToken($_POST['token']);
        if($user == null) exit(json_encode(['error' => 'Invalid session token']));
        $session_tokens = $user->getSessionTokens();
        $new_tokens = [];
        foreach($session_tokens as $token) {
            if($_POST['token'] != $token) {
                array_push($new_tokens, $token);
            }
        }
        $user->setSessionTokens($new_tokens);
        if(!$user->save()) exit(json_encode(['error' => 'An error occurred while attempting to remove the session token.']));
        exit(json_encode($session_tokens));
    } else {
        json_encode(['error' => 'Invalid request.']);
    }

?>