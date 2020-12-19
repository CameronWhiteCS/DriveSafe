import React, { useState, useEffect } from 'react';
import { Row, Col, Form, Button } from 'react-bootstrap';
import querystring from 'querystring';
import axios from 'axios';
import { Form as FormikForm, Formik, Field } from 'formik';
import Cookies from 'universal-cookie';

import SearchResults from './SearchResults.js';
import FormSearch from './FormSearch.js';
import FormEditPermissions from './FormEditPermissions.js';
import FormEditGroups from './FormEditGroups.js';
import Loading from '../Loading.js';

const UserManager = (props) => {

    const [users, setUsers] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [groups, setGroups] = useState([]);
    const [groupIds, setGroupIds] = useState([]);

    const initialize = () => {
        setLoading(true);
        axios.get('/php/api/users/groups.php')
            .then((res) => {
                setLoading(false);
                if (!res.data.error) {
                    setGroups(res.data);
                }
            })
    }

    useEffect(initialize, []);

    const save = () => {

        setLoading(true);

        const params = {
            action: 'update_user',
            token: new Cookies().get('token'),
            id: user.id,
            permissions: user.permissions,
            groupIds: groupIds,
            modified: user.modified
        }

        axios.post('/php/api/users/users.php', params)
            .then((res) => {
                setLoading(false);
                if (res.data.error) {
                    alert(res.data.error);
                } else {
                    alert('User updated.');
                    setUser(null);
                    setUsers([]);
                }
            });
    }

    const load = (data, setLoading) => {
        let encoded = querystring.encode(data);
        axios.get('/php/api/users/users.php?' + encoded)
            .then(
                (res) => {
                    setLoading(false);
                    if (res.data.error) {
                        alert(res.data.error);
                    } else {
                        setUsers(res.data);
                        setUser(null);
                    }
                }
            );
    }

    return (
        <React.Fragment>
            {loading && <Loading />}
            <Row>
                <Col xs={1} sm={2} md={3} />
                <Col xs={10} sm={8} md={6}>
                    <h1>User Manager</h1>
                    <hr />
                    <FormSearch load={load} />
                    {users.length !== 0 && <SearchResults users={users} selected={user} setUser={setUser} user={user} setGroupIds={setGroupIds} groupIds={groupIds}/>}
                    {user !== null && <FormEditPermissions user={user} setUser={setUser} />}
                    {user !== null && <FormEditGroups user={user} setUser={setUser} groupIds={groupIds} setGroupIds={setGroupIds} groups={groups} setGroups={setGroups} />}
                    <Form.Group>
                        <Button onClick={save} disabled={loading || user === null}>Save</Button>
                    </Form.Group>
                </Col>
                <Col xs={1} sm={2} md={3} />
            </Row>
        </React.Fragment>
    );
}

export default UserManager;