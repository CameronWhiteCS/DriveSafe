import React from 'react';

import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

import { useState } from 'react';

import Table from 'react-bootstrap/Table';
import axios from 'axios';

import Cookies from 'universal-cookie';

const CreateGroup = (props) => {

    const [permissions, setPermissions] = useState(['example.permission']);
    const [groupName, setGroupName] = useState(null);

    const onNameChange = (evt) => {
        setGroupName(evt.target.value.toLowerCase());
    }

    const addNewNode = (evt) => {
        evt.preventDefault();
        const permission = evt.target.addNewPermission.value.toLowerCase();
        if(!permission) {
            alert('Permission nodes cannot be blank.');
            return;
        }
        evt.target.addNewPermission.value = "";
        setPermissions([...permissions, permission]);
    }

    const revokePermission = (permission) => {
        let newPermissions = [];
        permissions.forEach((p, index) => {
            if (p !== permission) {
                newPermissions.push(p);
            }
        });
        setPermissions(newPermissions);
    }

    const submitGroup = (evt) => {
        evt.preventDefault();
        axios.post('/php/api/users/groups.php', {name: groupName, permissions: permissions, token: new Cookies().get('token')}, )
        .then((res) => {
            if(res.data.error) {
                alert(res.data.error);
            } else {
                setPermissions([]);
                props.loadGroups();
            }
        });
    }

    return (
        <React.Fragment>
            <h2>Create a new user group</h2>
            <hr />
            <Form>
                <Form.Group controlId="name">
                    <Form.Label>Group name</Form.Label>
                    <Form.Control type="text" placeholder="Enter the name of your new group here." onChange={onNameChange}/>
                </Form.Group>
            </Form>
            <p>Current permissions: </p>

            <Table striped bordered hover size="sm" >
                <thead>
                    <tr>
                        <th>Permission</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {
                        permissions.map((permission, index) => {
                            return (
                                <tr key={index}>
                                    <td>{permission}</td>
                                    <td><Button variant="danger" onClick={() => revokePermission(permission)}>Revoke permission</Button></td>
                                </tr>
                            );
                        })
                    }
                </tbody>
            </Table>

            <Form onSubmit={addNewNode}>
                <Form.Group controlId="addNewPermission">
                    <Form.Label>Add new permission</Form.Label>
                    <Row>
                        <Col xs={6} md={9}>
                            <Form.Control type="text" placeholder="example.node" />
                        </Col>
                        <Col xs={6} md={3}>
                                <Button type="submit" style={{width: '100%'}}>Add permission</Button>
                        </Col>
                    </Row>

                </Form.Group>
            
            </Form>
            <br/>
            <Form onSubmit={submitGroup}>
                <Button type="submit"> Create new group </Button>
            </Form>

        </React.Fragment>
    );

}

export default CreateGroup;