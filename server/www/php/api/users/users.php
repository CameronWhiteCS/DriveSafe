<?php

    require_once __DIR__ . '/../../models/User.php';
    require_once __DIR__ . '/../../models/Group.php';
    require_once __DIR__ . '/../../models/Insurer.php';

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
        $user = new User($email, $password_hash, NULL, NULL, NULL, NULL, NULL, NULL, $ip, $ip, '0', [], [$group], [$token]);
        $result = $user->save();
        if(!$result) exit(json_encode(['error' => 'An internal or external error occurred while attempting to create your account. Please contact customer support if the problem persists.']));


        //Return session token and user data to client
        exit(json_encode(['token' => $token, 'userData' => $user]));
    }

    function get_user_data(){
        $error_message = 'Either The specified resource does not exist, or you do not have permission to view it.';
        $user = User::fromId($_GET['id']);
        if($user === null) {
            exit(json_encode(['error' => $error_message]));
        } else {
            $token = $_GET['token'];
            if(in_array($token, $user->getSessionTokens())) {
                exit(json_encode($user));
            } else {
                exit(json_encode(['error' => $error_message]));
            }
        }
    }

    function update_profile() {
        $token = $_POST['token'];
        $user = User::fromSessionToken($token);
        if($user === null) exit(json_encode(['error' => 'Invalid session token.']));
        if(isset($_POST['firstName'])) $user->setFirstName($_POST['firstName']);
        if(isset($_POST['lastName'])) $user->setLastName($_POST['lastName']);
        if(isset($_POST['address'])) $user->setAddress($_POST['address']);
        if(isset($_POST['phoneNumber'])) $user->setPhoneNumber($_POST['phoneNumber']);
        $insurer = Insurer::fromId($_POST['insuranceCompany']);
        if(isset($_POST['insuranceCompany'])) $user->setInsuranceCompany($insurer);

        if(!$user->save()) exit(json_encode(['error' => 'An internal or external error occurred while preforming this operation.']));
        exit(json_encode($insurer));
    }

    if(isset($_GET['id']) && isset($_GET['token'])){
        get_user_data();
    } else if (isset($_GET['token'])) {
        $user = User::fromSessionToken($_GET['token']);
        if($user === null) {
            exit(json_encode(['error' => 'Invalid session token.']));
        } else {
            exit(json_encode($user));
        }
    } else if(isset($_POST['email']) && isset($_POST['password']) && isset($_POST['passwordConfirm'])){

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
        
    } else if (isset($_POST['action']) && $_POST['action'] == 'update_profile' && isset($_POST['token'])) {
        update_profile();
    } else {
        exit(json_encode(['error' => 'Invalid request.']));
    }


?>