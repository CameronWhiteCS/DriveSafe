import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { startSession } from '../session.js';
import React from 'react';
import { Formik, Form as FormikForm, Field } from 'formik';

const Signin = (props) => {

    const history = useHistory();

    const processResponse = (res, setSubmitting) => {
        setSubmitting(false);
        console.log(res.data);
        if (res.data.error) {
            alert(res.data.error);
        } else if (res.data.token && res.data.userData) {
            props.setUserData(res.data.userData);
            startSession(res.data.token);
            history.push('/');
        }
    }

    const validate = (data) => {
        if (data.password === '' || data.email === '') {
            alert('All fields are required.');
            return false;
        }
        return true;
    }

    const onSubmit = (data, setSubmitting) => {
        if(validate(data)) {
            axios.get('/php/api/users/users.php?email=' + data.email + "&password=" + data.password)
            .then((res) => processResponse(res, setSubmitting));
        } else {
            setSubmitting(false);
        }
    }

    const onClick = (evt) => {
        evt.preventDefault();
        history.push('/signup');
    }

    const initialValues = {
        email: '',
        password: ''
    };

    return (
        <Row>
            <Col xs={1} sm={2} md={3} lg={4}></Col>
            <Col xs={10} sm={8} md={6} lg={4}>
                <h1>Sign in</h1>
                <hr />
                <Formik
                    initialValues={initialValues}
                    onSubmit={(data, { setSubmitting }) => { onSubmit(data, setSubmitting); }}
                >
                    {({ values, isSubmitting, handleChange }) => {
                        return (
                            <FormikForm>
                                <Form.Group>
                                    <Form.Label>Email address</Form.Label>
                                    <Field
                                        placeholder="cow@cow.jp"
                                        name="email"
                                        type="input"
                                        as={Form.Control}
                                    />
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Password</Form.Label>
                                    <Field
                                        placeholder="m000!1"
                                        name="password"
                                        type="password"
                                        as={Form.Control}
                                    />
                                </Form.Group>
                                <Button disabled={isSubmitting} variant="primary" type="submit">
                                    Sign in
                                </Button>
                            </FormikForm>
                        );
                    }}
                </Formik>
                <br />
                <p>Don't have an account? Sign up <a href="/signup" onClick={onClick}>here</a>.</p>
            </Col>
            <Col xs={1} sm={2} md={3} lg={4}></Col>
        </Row>
    );

}

export default Signin;