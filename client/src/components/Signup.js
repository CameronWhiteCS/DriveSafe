import React from 'react';
import axios from 'axios';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { useHistory } from 'react-router-dom';
import { startSession } from '../session';
import { Formik, Form as FormikForm, Field } from 'formik';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

const Signup = (props) => {

    const history = useHistory();

    const processResponse = (res, setSubmitting) => {
        setSubmitting(false);
        if (res.data.token !== undefined && res.data.userData !== undefined ) {
            startSession(res.data.token);
            props.setUserData(res.data.userData);
            history.push('/');
        } else if (res.data.error) {
            alert(res.data.error);
        }
    }

    const onLinkClick = (evt) => {
        evt.preventDefault();
        history.push(evt.target.pathname);
    }

    const initialValues = {
        email: '',
        password: '',
        passwordConfirm: '',
        firstName: '',
        lastName: '',
        address: '',
        phoneNumber: '',
        insuranceCompany: '',
        dashcam: "false"
    };

    const validate = (data) => {
        const requiredFields = ['email', 'password', 'passwordConfirm', 'firstName', 'lastName', 'address', 'phoneNumber', 'insuranceCompany', 'dashcam'];
        for(let i = 0; i < requiredFields.length; i++){
            if(data[requiredFields[i]] === undefined || data[requiredFields[i]] === '') {
                alert('All fields are required.');
                return false;
            }
        }
        return true;
    }

    const onSubmit = (data, setSubmitting) => {
        if(validate(data)) {
            axios.post('/php/api/users/users.php', data)
                .then((res) => processResponse(res, setSubmitting));
        } else {
            setSubmitting(false);
        }
    }

    return (
        <React.Fragment>
            <Row>
                <Col xs={1} sm={2} md={3} lg={4} />
                <Col xs={10} sm={8} md={6} lg={4}>
                    <h1>Sign Up</h1>
                    <p>Already have an account? Sign in <a href="/signin" onClick={onLinkClick}>here</a>.</p>
                    <hr />
                    <Formik
                    initialValues={initialValues}
                    onSubmit={(data, {setSubmitting}) => { onSubmit(data, setSubmitting);}}
                    > 
                        {({ values, handleChange, handleSubmit, isSubmitting }) => {
                            return (
                                <FormikForm onSubmit={handleSubmit}>
                                    <Form.Group>
                                        <Form.Label>Email address</Form.Label>
                                        <Field
                                            placeholder="cow@cow.jp"
                                            name="email"
                                            type="email"
                                            as={Form.Control}
                                        />
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Label>Password</Form.Label>
                                        <Field
                                            placeholder="m000!"
                                            name="password"
                                            type="password"
                                            as={Form.Control}
                                        />
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Label>Confirm password</Form.Label>
                                        <Field
                                            placeholder="m000!"
                                            name="passwordConfirm"
                                            type="password"
                                            as={Form.Control}
                                        />
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Label>First name</Form.Label>
                                        <Field
                                            placeholder="Robert"
                                            name="firstName"
                                            type="input"
                                            as={Form.Control}
                                        />
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Label>Last name</Form.Label>
                                        <Field
                                            placeholder="Frost"
                                            name="lastName"
                                            type="input"
                                            as={Form.Control}
                                        />
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Label>Address</Form.Label>
                                        <Field
                                            placeholder="P. Sherman 42 Wallaby Way"
                                            name="address"
                                            type="input"
                                            as={Form.Control}
                                        />
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Label>Phone number</Form.Label>
                                        <Field
                                            placeholder="800-867-5309"
                                            name="phoneNumber"
                                            type="input"
                                            as={Form.Control}
                                        />
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Label>Insurance Company</Form.Label>
                                        <Field
                                            placeholder="Farm State"
                                            name="insuranceCompany"
                                            type="input"
                                            as={Form.Control}
                                        />
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Label>Do you have a dashcam in your car?</Form.Label>
                                        <select defaultValue={values.dashcam} onChange={handleChange} className="form-control" name="dashcam" id="dashcam">
                                            <option value="true">Yes</option>
                                            <option value="false">No</option>
                                        </select>
                                    </Form.Group>
                                    <p>By creating an account with us, you agree to our <a onClick={onLinkClick} href="/tos">terms of service</a> and <a onClick={onLinkClick} href="/privacy">privacy policy</a>.</p>
                                    <Button disabled={isSubmitting} variant="primary" type="submit">
                                        Create account
                                    </Button>
                                </FormikForm>
                            );
                        }}
                    </Formik>
                    <br />
                </Col>
                <Col xs={1} sm={2} md={3} lg={4} />
            </Row>
        </React.Fragment>
    );

}

export default Signup;