import React from 'react';
import{Row, Col, Button} from 'react-bootstrap';
import {useHistory} from 'react-router-dom';

const ControlPanel = (props) => {

    const history = useHistory();

    const onClick = (url) => {
        history.push(url);
    }

    const buttonStyle = {
        width: '90%',
        margin: '7px auto 7px auto',
        display: 'block'
    };

    if(!props.hasPermission('controlpanel.view')) {
        history.push('/');
    } 

    return (

        <React.Fragment>
            <Row>
                <Col xs={1}/>
                <Col xs={10}>
                    <h1 stlye={{align: "center"}}>Control Panel</h1>
                    <hr/>
                </Col>
                <Col xs={1}/>
            </Row>
            <Row>
                <Col xs={12} md={4}>
                    <Button onClick={() => onClick('/admin/groupmanager')} style={buttonStyle}>Group Manager</Button>
                </Col>
                <Col xs={12} md={4}>
                    <Button onClick={() => onClick('/admin/quizmanager')} style={buttonStyle}>Quiz Manager</Button>
                </Col>
                <Col xs={12} md={4}>
                    <Button onClick = {() => onClick('/admin/usermanager')} style={buttonStyle}>User Manager</Button>
                </Col>
                <Col xs={12} md={4}>
                    <Button onClick = {() => onClick('/rivalries/edit')} style={buttonStyle}>Rivalry Manager</Button>
                </Col>
            </Row>
        </React.Fragment>

    );

}

export default ControlPanel;
