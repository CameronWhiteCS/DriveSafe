import React from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import { Checkbox } from '@material-ui/core'


const FormEditGroups = (props) => {

    const toggle = (id) => {
        console.log(props.groupIds);
        if (props.groupIds.includes(id)) {
            const newIds = [];
            props.groupIds.forEach((_id) => {
                if (id !== _id) newIds.push(_id);
            });
            props.setGroupIds(newIds);
        } else {
            props.setGroupIds([...props.groupIds, id]);
        }
    }

    return (
        <React.Fragment>
            <h2>Groups</h2>
            <Form>
                <Row>
                    {
                        props.groups.map((group, index) => {
                            return (
                                <Col key={index} xs={6} sm={4} lg={3} xl={2}>
                                    <Form.Group key={index}>
                                        <Checkbox color={'primary'} onClick={() => toggle(group.id)} checked={props.groupIds.includes(group.id)} />
                                        <Form.Label>{group.name}</Form.Label>
                                    </Form.Group>
                                </Col>
                            );
                        })
                    }
                </Row>
            </Form>
        </React.Fragment>
    );

}

export default FormEditGroups;