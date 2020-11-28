<?php

    require_once __DIR__ . '/../../models/User.php';
    require_once __DIR__ . '/../../models/Group.php';

    if(!$_POST) $_POST = (array) json_decode(file_get_contents('php://input'));
    
    header('Content-Type: application/json');

    function gen_token(){
        return bin2hex(openssl_random_pseudo_bytes(64));
    }

    function signup(){
        //Validate email
        $email = strtolower($_POST['email']);
        if(!filter_var($email, FILTER_VALIDATE_EMAIL)) exit(json_encode(['error' => 'Invalid email address']));
        //Make sure suer isn't already registered
        $user = User::fromEmail($email);
        if($user != null) exit(json_encode(['error' => 'Email already in use.']));

        //Password and token stuff
        if($_POST['password'] != $_POST['passwordConfirm']) exit(json_encode(['error' => 'Passwords don\'t match']));
        $password_hash = password_hash($_POST['password'], PASSWORD_BCRYPT);
        $token = gen_token();

        //Get IP for logging purposes
        $ip = $_SERVER['REMOTE_ADDR'];

        //Default user group
        $group = Group::fromId(3);

        //Instantiate model and save to DB
        $user = new User($email, $password_hash, $_POST['firstName'], $_POST['lastName'], $_POST['address'], $_POST['phoneNumber'], $_POST['insuranceCompany'], $_POST['dashcam'], $ip, $ip, false, [], [$group], [$token]);
        $result = $user->save();
        if(!$result) exit(json_encode(['error' => 'An internal or external error occurred while attempting to create your account. Please contact customer support if the problem persists.']));


        //Return session token and user data to client
        exit(json_encode(['token' => $token, 'userData' => $user]));
    }

    if(isset($_GET['id'])){
        exit(json_encode(User::fromId($_GET['id'])));
    } else if (isset($_GET['token'])) {
        $user = User::fromSessionToken($_GET['token']);
        if(!$user) {
            exit(json_encode(['error' => 'Invalid session token.']));
        } else {
            exit(json_encode($user));
        }
    } else if(isset($_POST['email']) && isset($_POST['password']) && isset($_POST['passwordConfirm']) && isset($_POST['firstName']) && isset($_POST['lastName']) && isset($_POST['address']) && isset($_POST['phoneNumber']) && isset($_POST['insuranceCompany']) && isset($_POST['dashcam'])){
       signup();
    } else if (isset($_GET['email']) && isset($_GET['password'])) {
        $credentials_error = 'Invaid email address or password.';
        $email = strtolower($_GET['email']);
        $user = User::fromEmail($email);
        if($user == null) exit(json_encode(['error' => $credentials_error]));
        $password_hash = $user->getPasswordHash();
        if(!password_verify($_GET['password'], $password_hash)) {
            exit(json_encode(['error' => $credentials_error]));
        } else {
            $session_tokens = $user->getSessionTokens();
            $new_token = gen_token();
            array_push($session_tokens, $new_token);
            $user->setSessionTokens($session_tokens);
            if(!$user->save()) exit(json_encode(['error' => 'An error occurred while attempting to save your user profile.']));
            exit(json_encode(['token' => $new_token, 'userData' => $user, 'session_tokens' => $user->getSessionTokens()]));
        }
        
    } else {
        exit(json_encode(['error' => 'Invalid request.']));
    }


?>