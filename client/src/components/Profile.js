import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import {Row, Col, Button} from 'react-bootstrap';
import Loading from './Loading.js';

const Profile = (props) => {

    const history = useHistory();

    if(props.userData === null) return (<Loading/>);

    const onClick = (evt) => {
        history.push('/profile/edit');
    }

    return (
        <Row>
            <Col xs={1}/>
            <Col xs={10}>
                <h1>Profile</h1>
                <hr/>
                <pre>
                    {
                        
                        JSON.stringify(props.userData, null, 2)
                        
                    }
                </pre>
                <Button onClick={onClick}>Edit</Button>
            </Col>
            <Col xs={1}/>
        </Row>
    );

}

export default Profile;