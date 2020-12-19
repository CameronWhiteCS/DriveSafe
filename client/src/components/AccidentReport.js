import React, { useState } from 'react';
import axios from 'axios';
import Cookies from 'universal-cookie';

import { Form as FormikForm, Formik, Field } from 'formik';
import { Form, Row, Col, Button, Alert } from 'react-bootstrap';
import { Checkbox } from '@material-ui/core';
import {NavLink} from 'react-router-dom';

import Loading from './Loading.js';

const AccidentReport = (props) => {

    const onLocationSuccess = (loc, values, setValues) => {
        setValues({
            ...values,
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            accuracy: loc.coords.accuracy,
            _requested: true
        });

    }

    const onLocationFailure = (loc, values, setValues) => {

    }

    const initialValues = {
        address: '',
        latitude: '',
        longitude: '',
        accuracy: '',
        rain: false,
        hail: false,
        sleet: false,
        snow: false,
        fog: false,
        wind: false,
        _requested: false
    };

    const onSubmit = (data, setSubmitting, setValues) => {
        if(data.address === '' && (data.latitude === '' || data.longitude === '')) {
            
            alert('You must specifcy either an address or a coordinate pair.');
            setSubmitting(false);
            return;
        }
        setSubmitting(true);
        const token = new Cookies().get('token');
        axios.post('/php/api/reports/reports.php', { ...data, token: token }).then(
            (res) => {
                setSubmitting(false);
                if (res.data.error) {
                    alert(res.data.error);
                } else {
                    alert('Accident recorded.');
                    setValues(initialValues);
                }
            }
        );
    }

    return (
        <Row>
            <Col xs={1} sm={2} md={3} lg={4}></Col>
            <Col xs={10} sm={8} md={6} lg={4}>
                <h1>Submit Accident Report</h1>
                <hr />
                <Alert variant="light">
                    <p>If an address for an accident is provided, the location of the address will take priority over the GPS coordinates. </p>
                </Alert>
                <Formik
                    initialValues={initialValues}
                    onSubmit={(data, { setSubmitting, setValues }) => { onSubmit(data, setSubmitting, setValues); }}
                >
                    {
                        ({ isSubmitting, values, setValues }) => {

                            if (values._requested === false) {
                                navigator.geolocation.getCurrentPosition((loc) => onLocationSuccess(loc, values, setValues), (loc) => onLocationFailure(loc, values, setValues));
                            }

                            return (
                                <FormikForm>
                                    {isSubmitting && <Loading />}
                                    <Form.Group>
                                        <Form.Label htmlFor="address">Address</Form.Label>
                                        <Field
                                            type="text"
                                            as={Form.Control}
                                            id="address"
                                            name="address"
                                        />
                                    </Form.Group>
                                    <Form.Group>
                                        <Row>
                                            <Col xs={12} sm={6}>
                                                <Form.Group>
                                                    <Form.Label htmlFor="latitude" >Latitude: </Form.Label>
                                                    <Field
                                                        type="text"
                                                        name="latitude"
                                                        id="latitude"
                                                        as={Form.Control}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col xs={12} sm={6}>
                                                <Form.Group>
                                                    <Form.Label htmlFor="longitude" >Longitude: </Form.Label>
                                                    <Field
                                                        type="text"
                                                        name="longitude"
                                                        id="longitude"
                                                        as={Form.Control}
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </Form.Group>
                                    <Row>
                                        <Col xs={6} sm={4}>
                                            <Form.Group>
                                                <Field
                                                    type="checkbox"
                                                    name="sleet"
                                                    id="sleet"
                                                    color="primary"
                                                    as={Checkbox}
                                                />
                                                <Form.Label htmlFor="sleet">Sleet</Form.Label>
                                            </Form.Group>
                                        </Col>
                                        <Col xs={6} sm={4}>
                                            <Form.Group>
                                                <Field
                                                    type="checkbox"
                                                    name="snow"
                                                    id="snow"
                                                    color="primary"
                                                    as={Checkbox}
                                                />
                                                <Form.Label htmlFor="snow">Snow</Form.Label>
                                            </Form.Group>
                                        </Col>
                                        <Col xs={6} sm={4}>
                                            <Form.Group>
                                                <Field
                                                    type="checkbox"
                                                    name="hail"
                                                    id="hail"
                                                    color="primary"
                                                    as={Checkbox}
                                                />
                                                <Form.Label htmlFor="hail">Hail</Form.Label>
                                            </Form.Group>
                                        </Col>
                                        <Col xs={6} sm={4}>
                                            <Form.Group>
                                                <Field
                                                    type="checkbox"
                                                    name="rain"
                                                    id="rain"
                                                    color="primary"
                                                    as={Checkbox}
                                                />
                                                <Form.Label htmlFor="rain">Rain</Form.Label>
                                            </Form.Group>
                                        </Col>
                                        <Col xs={6} sm={4}>
                                            <Form.Group>
                                                <Field
                                                    type="checkbox"
                                                    name="wind"
                                                    id="wind"
                                                    color="primary"
                                                    as={Checkbox}
                                                />
                                                <Form.Label htmlFor="wind">Wind</Form.Label>
                                            </Form.Group>
                                        </Col>
                                        <Col xs={6} sm={4}>
                                            <Form.Group>
                                                <Field
                                                    type="checkbox"
                                                    name="fog"
                                                    id="fog"
                                                    color="primary"
                                                    as={Checkbox}
                                                />
                                                <Form.Label htmlFor="fog">Fog</Form.Label>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <Button type="submit" disabled={isSubmitting}>Submit report</Button>
                                    <br/>
                                    <br/>
                                </FormikForm>
                            );
                        }
                    }
                </Formik>
            </Col>
            <Col xs={1} sm={2} md={3} lg={4}></Col>
        </Row>
    );

}

export default AccidentReport;