import React from 'react';
import { Formik, Form as FormikForm, Field } from 'formik';
import { Form, Button } from 'react-bootstrap';
import Cookies from 'universal-cookie';
import Loading from '../Loading.js';

const FormSearch = (props) => {

    const initialValues = {
        firstName: '',
        lastName: '',
        email: '',
        action: 'get_users',
        token: new Cookies().get('token')
    };

    return (
        <Formik initialValues={initialValues} onSubmit={(data, { setSubmitting }) => props.load(data, setSubmitting)}>
            {
                ({ values, isSubmitting, setSubmtting, handleSubmit }) => {
                    return (

                        <React.Fragment>
                            {isSubmitting && <Loading/>}
                            <FormikForm onSubmit={handleSubmit}>

                                <Form.Group>
                                    <Form.Label>First name</Form.Label>
                                    <Field
                                        placeholder='Bob'
                                        name='firstName'
                                        type='text'
                                        as={Form.Control}
                                    />
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Last name</Form.Label>
                                    <Field
                                        placeholder='Ross'
                                        name='lastName'
                                        type='text'
                                        as={Form.Control}
                                    />
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Email</Form.Label>
                                    <Field
                                        placeholder='joyof@painting.net'
                                        name='email'
                                        type='text'
                                        as={Form.Control}
                                    />
                                </Form.Group>
                                <Form.Group>
                                    <Button type="submit" disabled={isSubmitting}>
                                        Search
                                    </Button>   
                                </Form.Group>
                            </FormikForm>
                        </React.Fragment>
                    );
                }
            }
        </Formik>
    );
}

export default FormSearch;