import axios from 'axios';
import React, {useState} from 'react';

import Cookies from 'universal-cookie';
import {Button, Table, Form} from 'react-bootstrap';

const GroupPanel = (props) => {

    /**
     * The permission represented by the "grant permission" text box.
     */
    const [permission, setPermission] = useState('');


    /**
     * Sends a request to the server to delete this group from the database. Requires user confirmation.
     */
    const deleteGroup = () => {
        if(window.confirm('WARNING! This action is irreversible. If this group is deleted, the list of members in this group cannot be recovered. Are you sure you wish to continue? ')) {
            axios.post('/php/api/users/groups.php', {action: 'delete', id: props.group.id, token: new Cookies().get('token')})
            .then((res) => {
                if(res.data.error) {
                    alert(res.data.error);
                } else {
                    props.loadGroups();
                }
            });
        }
    }

    const onPermissionChange = (evt) => {
        setPermission(evt.target.value.toLowerCase());
    }

    const saveGroup = (evt) => {
        //id, name, permissions, modified, token
        const params = {
            id: props.group.id,
            name: props.group.name,
            permissions: props.group.permissions,
            modified: props.group.modified,
            token: new Cookies().get('token')
        };
        console.log(params);
        axios.post('/php/api/users/groups.php', params).then((res) => {
            if(res.data.error) {
                alert(res.data.error);
            } else {
                props.loadGroups();
                alert('Group saved');
            }
        });
    }

    const grantPermission = (evt) => {
        if(props.group.permissions.includes(permission)) {
            alert('This group already has that permission.');
            return;
        }
        if(!permission) {
            alert('Permission nodes cannot be blank.');
            return;
        }
        //TODO: Better way of accessing this field?
        let permissionInput = document.getElementById("permissionInput" + props.group.id);
        permissionInput.value = "";
        setPermission("");
        const newGroup = {...props.group};
        newGroup.permissions = [...newGroup.permissions, permission];
        let oldGroups = props.groups;
        let newGroups = [];
        oldGroups.forEach((g, element) => {
            if(g.id === newGroup.id) {
                newGroups.push(newGroup);
            } else {
                newGroups.push(g);
            }
        });
        props.setGroups(newGroups);
    }

    const revokePermission = (permission) => {
        const newGroup = {...props.group};
        let newPermissions= [];
        props.group.permissions.forEach((p, i) => {
            if(p !== permission) newPermissions.push(p);
        });
        newGroup.permissions = newPermissions;
        let oldGroups = props.groups;
        let newGroups = [];
        oldGroups.forEach((g, element) => {
            if(g.id === newGroup.id) {
                newGroups.push(newGroup);
            } else {
                newGroups.push(g);
            }
        });
        props.setGroups(newGroups);
    }

    const buttonStyle = {
        width: '150px'
    }

    return (
        <React.Fragment>
            <h2>{props.group.name}</h2>
        
            <Table striped bordered hover size="sm" >
                <thead>
                    <tr>
                        <th><b>Permission Node</b></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {
                        props.group.permissions.map((permission, index) => {
                            return (
                                <tr key={index}>
                                    <td>{permission}</td>
                                    <td><Button style={buttonStyle} variant="warning" onClick={() => revokePermission(permission)}>Revoke Permission</Button></td>
                                </tr>
                            );
                        })
                    }
                    <tr>

                        <td>  
                            <Form.Control onChange={onPermissionChange} id={"permissionInput" + props.group.id}></Form.Control>
                        </td>
                        <td>
                            <Button style={buttonStyle} onClick={grantPermission}>Grant permission</Button>
                        </td>
                    </tr>
                </tbody>
            </Table>
            <Button variant="danger" onClick={deleteGroup}>Delete Group</Button>
            &nbsp;&nbsp;&nbsp;&nbsp;
            <Button variant="primary" onClick={saveGroup}>Save Group</Button>
            <br />
            <br />
            <br />
        </React.Fragment>
    );

}

export default GroupPanel;