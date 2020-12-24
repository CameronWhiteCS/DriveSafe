import React, { useEffect, useState } from 'react';
import { Formik, Form as FormikForm, Field } from 'formik';
import { Row, Col, Form, Button } from 'react-bootstrap';
import Cookies from 'universal-cookie';

import Loading from './Loading.js';
import axios from 'axios';

const EditProfile = (props) => {

    const [insurers, setInsurers] = useState(null);

    const load = () => {
        axios.get('/php/api/insurers/insurers.php').then(
            (res) => {
                res.data.error ? alert(res.data.error) : setInsurers(res.data);
            }
        )
    }

    useEffect(load, []);

    if (props.userData === null || insurers === null) return (<Loading />)

    const initialValues = {
        firstName: props.userData.firstName,
        lastName: props.userData.lastName,
        address: props.userData.address,
        phoneNumber: props.userData.phoneNumber,
        insuranceCompany: props.userData.insuranceCompany === null ? 1 : props.userData.insuranceCompany.id,
        dashcam: props.userData.dashcam,
        action: 'update_profile',
        token: new Cookies().get('token')
    };

    const onSubmit = (data, setSubmitting) => {
        setSubmitting(true);
        axios.post('/php/api/users/users.php', data).then(
            (res) => {
                setSubmitting(false)
            }
        )
    }

    return (
        <React.Fragment>
            <Row>
                <Col xs={1} md={3} />
                <Col xs={10} md={6}>
                    <h1>Edit Profile</h1>
                    <hr />
                    <Formik
                        initialValues={initialValues}
                        onSubmit={(data, { setSubmitting }) => { onSubmit(data, setSubmitting); }}
                    >
                        {
                            ({ values, handleChange, isSubmitting }) => {
                                return (
                                    <FormikForm onChange={() => {console.log(values);}}>
                                        <Form.Group>
                                            <Form.Label>First Name</Form.Label>
                                            <Field
                                                name="firstName"
                                                type="input"
                                                as={Form.Control}
                                            />
                                        </Form.Group>
                                        <Form.Group>
                                            <Form.Label>Last Name</Form.Label>
                                            <Field
                                                name="lastName"
                                                type="input"
                                                as={Form.Control}
                                            />
                                        </Form.Group>
                                        <Form.Group>
                                            <Form.Label>Address</Form.Label>
                                            <Field
                                                name="address"
                                                type="input"
                                                as={Form.Control}
                                            />
                                        </Form.Group>
                                        <Form.Group>
                                            <Form.Label>Phone number</Form.Label>
                                            <Field
                                                name="phoneNumber"
                                                type="input"
                                                as={Form.Control}
                                            />
                                        </Form.Group>
                                        <Form.Group>
                                            {/* Hacky wordaround to avoid dealing with Formik */}
                                            <Form.Label>Insurer</Form.Label>
                                            <Field
                                                name="insuranceCompany"
                                                as="select"
                                                className="form-control"
                                            >
                                                {
                                                    insurers.map((insurer, index) => {
                                                    return <option key={index} value={insurer.id} >{insurer.name}</option>
                                                    })
                                                }
                                            </Field>

                                        </Form.Group>
                                        <Button type="submit" disabled={isSubmitting}>Save profile</Button>
                                    </FormikForm>
                                );
                            }
                        }
                    </Formik>
                </Col>
                <Col xs={1} md={3} />
            </Row>
        </React.Fragment>
    );

}

export default EditProfile;