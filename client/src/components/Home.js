import React from 'react';

import {Row, Col} from 'react-bootstrap';

const Home = (props) => {
    return (
        <Row>
        
            <Col xs={1}/>
            <Col xs={10}>
                <h1>DriveSafe</h1>
                <hr/>
                <p>DriveSafe is an application that promotes driver safety by empowering drivers to make better choices through a combination of accident data and safety information. </p>
                <p>Users of the app can submit accident reports and view accidents by city</p>
            </Col>
            <Col xs={1}/>
        </Row>
    );
}

export default Home;
