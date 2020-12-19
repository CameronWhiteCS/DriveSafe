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

    function get_users(){
    
        if(!isset($_GET['token'])) exit(json_encode(['error' => 'Invalid session token']));
        $user = User::fromSessionToken($_GET['token']);
        if($user === null) exit(json_encode(['error' => 'Invalid session token']));
        if(!$user->hasPermission('user.view.other')) exit(json_encode(['error' => 'You don\'t have permission to perform this operation.']));

        $conn = DataManager::getInstance()->getConnection();
        if(!$conn || $conn->connect_error) exit(json_encode(['error' => 'An internal or external error occurred while attempting to perform this operation.']));

        $email = strtolower(isset($_GET['email']) ? '%' . $_GET['email'] . '%' : '%%');
        $first_name = strtolower(isset($_GET['firstName']) ? '%' . $_GET['firstName'] . '%' : '%%');
        $last_name = strtolower(isset($_GET['lastName']) ? '%' . $_GET['lastName'] . '%': '%%');
        $page = isset($_GET['page']) ? $_GET['page'] : 0;
        $page_size = 25;
        $offset = $page_size * $page ;

        $statement = $conn->prepare(
            "SELECT * FROM `users`
            WHERE LOWER(`email`) LIKE ? AND LOWER(`first_name`) LIKE ? AND LOWER(`last_name`) LIKE ?
            LIMIT ? OFFSET ?"
            );
        $bind_params = [$email, $first_name, $last_name, $page_size, $offset];
        if(!$statement || !$statement->bind_param('sssss', ...$bind_params) || !$statement->execute()) exit(json_encode(['error' => 'An internal or external error occurred while attempting to perform this operation.']));
        $result_set = $statement->get_result();
        $output = [];
        while($row = $result_set->fetch_assoc()) {
            array_push($output, User::fromRow($row));
        }
        exit(json_encode($output));

    }
    
    function update_user(){

        if(!isset($_POST['token'])) exit(json_encode(['error' => 'Invalid session token']));
        $user = User::fromSessionToken($_POST['token']);
        if($user === null) exit(json_encode(['error' => 'Invalid session token']));
        if(!$user->hasPermission('user.modify')) exit(json_encode(['error' => 'You don\'t dont have permission to perform this opreation.']));
        $modified_user = User::fromId($_POST['id']);
        if($modified_user === null) exit(json_encode(['error' => 'User not found.']));
        $modified_user->setPermissions($_POST['permissions']);
        if($modified_user->getModified() !== $_POST['modified']) exit(json_encode(['error' => 'The resource you are attempting to modify is stale. Please reload the resource and try again.']));
        $groups = [];
        foreach($_POST['groupIds'] as $group_id){
            $group = Group::fromId($group_id);
            array_push($groups, $group);
        }
        $modified_user->setGroups($groups);
        if(!$modified_user->save()) exit(json_encode(['error' => 'An internal or external error occurred while attmepting to perform the specified operation.']));
    }

    if(isset($_POST['action']) && $_POST['action'] == 'update_user' && isset($_POST['token']) && isset($_POST['id']) && isset($_POST['permissions']) && isset($_POST['groupIds']) && isset($_POST['modified'])){
        update_user();
    } else if(isset($_GET['action']) && $_GET['action'] === 'get_users') {
        get_users();
    } else if(isset($_GET['id']) && isset($_GET['token'])){
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