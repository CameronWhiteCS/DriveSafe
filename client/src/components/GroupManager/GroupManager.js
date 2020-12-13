import axios from 'axios';
import React, { useEffect, useState } from 'react';
import GroupPanel from './GroupPanel.js';
import CreateGroup from './CreateGroup.js';
import Loading from '../Loading.js';

import { signedIn } from '../../session.js';

import Alert from 'react-bootstrap/Alert';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

const GroupManager = (props) => {

    /**
     * Group objects are returned from the PHP API.
     */
    const [groups, setGroups] = useState(null);

    /**
     * Loads group data from the API and calls setGroups() on the result.
     */
    const loadGroups = () => {
        axios.get('/php/api/users/groups.php').then((res) => {
            setGroups(res.data);
        });
    }

    useEffect(loadGroups, []);

    if (groups === null) {
        return <Loading />
    } else if (!signedIn()) {
        return (
            <p>You must be signed in to view this page.</p>
        );
    } else {
        return (
            <React.Fragment>
                <Row>
                    <Col xs={1} />
                    <Col xs={10}>
                        <h1>Group Manager</h1>
                        <Alert variant="light">
                            <p>Here, you can modify what actions different types of users are allowed to make and even create new categories of users. Each group has a list of <b>permission nodes</b>, bits of text used to represent various actions. A complete list of permission nodes (along with what they do) can be found in the software documentation. </p>
                            <p>Members of a group inheret all of the permissions from that group. The 'root' group exists for technical purposes and shouldn't be modified. </p>
                        </Alert>
                        <hr />
                        {
                            groups.map((group, index) => {
                                return <GroupPanel key={index} loadGroups={loadGroups} groups={groups} setGroups={setGroups} group={group} />
                            })
                        }
                        <CreateGroup loadGroups={loadGroups} groups={groups} setGroups={setGroups} />
                    </Col>
                    <Col xs={1} />
                </Row>
                <br/>
            </React.Fragment>

        );
    }

}

export default GroupManager;
