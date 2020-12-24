import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Table, Container, Alert } from 'react-bootstrap';
import Loading from './Loading.js';
import {NavLink} from 'react-router-dom';

const Rivalries = (props) => {

    const [loading, setLoading] = useState(true);
    const [rivalries, setRivalries] = useState([]);

    const loadRivalries = () => {
        setLoading(true);
        axios.get('/php/api/cities/rivalries.php?').then(
            (res) => {
                setLoading(false);
                if(res.data.error) {
                    alert(res.data.error);
                } else {
                    setRivalries(res.data);
                    console.log(res.data);
                }
            }
        )
    }

    useEffect(loadRivalries, []);

    return (
        <React.Fragment>
            {loading && <Loading />}
            <Container>
                <h1>City Rivalries</h1>
                <hr/>
                <Alert variant="secondary">
                    <p>Here, you can see which cities are competing against each other for the title of safest city. For a more detailed summary, visit the <NavLink to='/accidents/summary' style={{textDecoration: 'underline'}}>accidents page</NavLink>.</p>
                </Alert>
                <Table striped bordered hover variant="light">
                    <thead>
                        <tr>
                            <th>City 1</th>
                            <th>City 2</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            rivalries.map((rivalry, index) => {
                                return (
                                    <tr key={index}>
                                        <td>{rivalry.city1.name}</td>
                                        <td>{rivalry.city2.name}</td>
                                    </tr>
                                );
                            })
                        }
                    </tbody>
                </Table>
            </Container>
        </React.Fragment>
    );
}

export default Rivalries;