<?php

    require_once __DIR__ . '/../../models/Group.php';
    require_once __DIR__ . '/../../models/User.php';

    if(!$_POST) $_POST = (array) json_decode(file_get_contents('php://input'));
    header('Content-Type: application/json');

    /**
     * Exits if the user is not both signed in and in possession of the required permission. 
     */
    function authorize(string $permission){
     
         $user = User::fromSessionToken($_POST['token']);
         if($user === null) exit(json_encode(['error' => 'Invalid session token.']));
         if(!$user->hasPermission($permission)) exit(json_encode(['error' => 'You do not have permission to preform this operation.']));
    }

    function modify_group(){


        authorize('group.modify');
    
        $group = Group::fromId($_POST['id']);
        if($group === null) exit(json_encode(['error' => 'The specified group could not be found.']));
        $group->setName($_POST['name']);
        $group->setPermissions($_POST['permissions']);
        $group->setModified($_POST['modified']);
        if(!$group->save()) exit(json_encode(['error' => 'An error occurred while trying to save the provided record. This could be the result of editing stale data. Try reloading the page and editing the data again. If the problem persists, please contact customer support. ']));
    
    }
    
    function create_group(){
        authorize('group.create');
        $group = new Group($_POST['name'], $_POST['permissions']);
        if(!$group->save()) exit(json_encode(['error' => 'An error occurred while performing this operation.']));
    }

    if(isset($_POST['id']) && isset($_POST['name']) && isset($_POST['permissions']) && isset($_POST['modified']) && isset($_POST['token'])) {
        modify_group();
    } else if(isset($_POST['name']) && isset($_POST['permissions']) && isset($_POST['token'])) {
       create_group();
    } else if($_SERVER['REQUEST_METHOD'] == 'GET' && !$_GET) {
        exit(json_encode(Group::getAll()));
    } else if(isset($_POST['action']) && $_POST['action'] == 'delete' && isset($_POST['id']) && isset($_POST['token'])) {
        authorize('group.delete');
        $group = Group::fromId($_POST['id']);
        if(!$group || !$group->delete()) exit(json_encode(['error' => 'An error occurred while attempting to perform this operation.']));

    }



?>