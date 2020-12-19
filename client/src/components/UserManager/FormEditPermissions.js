import React, { useState } from 'react';
import { Table, Button, Form, Row, Col, Container } from 'react-bootstrap'


const FormEditUser = (props) => {

    const grant = (evt) => {
        evt.preventDefault();
        const newUser = {...props.user, permissions: [...props.user.permissions, evt.target.permission.value]};
        props.setUser(newUser);
    }

    const revoke = (index) => {
        const newPermissions = [];
        for (let i = 0; i < props.user.permissions.length; i++) {
            if (i != index) newPermissions.push(props.user.permissions[i]);
        }
        const newUser = {...props.user, permissions: newPermissions};
        props.setUser(newUser);

    }

    return (
        <React.Fragment>
            <h2>Permissions</h2>
            <Table variant="light">
                <thead>
                    <tr>
                        <th>Permission</th>
                        <th>Revoke</th>
                    </tr>
                </thead>
                <tbody>
                    {props.user.permissions.map((permission, index) => {
                        return (
                            <tr key={index}>
                                <td>{permission}</td>
                                <td><Button variant="danger" onClick={() => revoke(index)}>Revoke</Button></td>
                            </tr>
                        );
                    })}
                </tbody>
            </Table>
                <Form onSubmit={grant}>
                    <Row>
                        <Col xs={12} lg={8}>
                            <Form.Group>
                                <Form.Control name="permission">

                                </Form.Control>
                            </Form.Group>
                        </Col>
                        <Col xs={12} lg={4}>
                            <Button style={{ width: '100%' }} type="submit">Add permission</Button>
                        </Col>
                    </Row>
                </Form>
        </React.Fragment>
    );

}

export default FormEditUser;