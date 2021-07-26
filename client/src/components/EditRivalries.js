import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { Button, Table, Container, Col, Row, Form, Card } from 'react-bootstrap';
import Cookies from 'universal-cookie';
import Loading from './Loading.js';

const EditRivalries = (props) => {

    const [rivalries, setRivalries] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rivalry, setRivalry] = useState({
        city1: undefined,
        city2: undefined
    });

    const loadRivalries = (city) => {
        let url = '/php/api/cities/rivalries.php';
        if (city !== undefined && city !== null) url += ('?city=' + city);
        setLoading(true)
        axios.get(url).then(
            (res) => {
                setLoading(false);
                if (res.data.error) {
                    alert(res.data);
                } else {
                    setRivalries(res.data);
                }
            }
        )
    }

    const citySearch = (evt) => {
        evt.preventDefault();
        setLoading(true);
        axios.get('/php/api/cities/cities.php?cityName=' + evt.target.cityName.value).then(
            (res) => {
                setLoading(false);
                if (res.data.error) {
                    alert(res.data.error);
                } else {
                    setSearchResults(res.data);
                }
            }
        )
    }

    const deleteRivalry = (city1, city2, index) => {
        setLoading(true);
        const params = {
            action: 'delete',
            token: new Cookies().get('token'),
            city1: city1,
            city2: city2
        };
        axios.post('/php/api/cities/rivalries.php', params)
            .then((res) => {
                setLoading(false);
                if (res.data.error) {
                    alert(res.data.error);
                } else {
                    let newRivalries = [];
                    for (let i = 0; i < rivalries.length; i++) {
                        if (i !== index) newRivalries.push(rivalries[i]);
                    }
                    setRivalries(newRivalries);
                }
            });
    }

    const addToRivalry = (city) => {
        console.log({
            city1: rivalry.city2,
            city2: city
        });
        if(rivalry.city1 === undefined && rivalry.city2 === undefined) {
            setRivalry({...rivalry, city1: city});
        } else if(rivalry.city2 === undefined) {
            setRivalry({city1: rivalry.city1, city2: city});
        } else {
            setRivalry({
                city1: rivalry.city2,
                city2: city
            })
        }
    }


    const createRivalry = (evt) => {
        evt.preventDefault();
        const params = {
            action: 'create',
            token: new Cookies().get('token'),
            city1: rivalry.city1.id,
            city2: rivalry.city2.id
        };

        axios.post('/php/api/cities/rivalries.php', params).then(
            (res) => {
                if (res.data.error) {
                    alert(res.data.error);
                } else {
                    loadRivalries();
                    setRivalry({city1: undefined, city2: undefined});
                }
            }
        );
    }

    useEffect(loadRivalries, []);
    useEffect(() => axios.get('/php/api/cities/cities.php?cityName=').then(
        (res) => {
            setLoading(false);
            if (res.data.error) {
                alert(res.data.error);
            } else {
                setSearchResults(res.data);
            }
        }
    ), []);

    const history = useHistory();

    if (props.hasPermission('controlpanel.view') === false) {
        history.push('/');
    }

    return (
        <React.Fragment>
            {loading && <Loading />}
            <Container>
                <h1>Rivalry Editor</h1>
                <hr />
                <h2>Current rivalries</h2>
                <Table striped bordered hover variant="light">
                    <thead>
                        <tr>
                            <th>City 1</th>
                            <th>City 2</th>
                            <th>Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            rivalries.map((rivalry, index) => {
                                return (
                                    <tr key={index}>
                                        <td>{rivalry.city1?.name}</td>
                                        <td>{rivalry.city2?.name}</td>
                                        <td>
                                            <Button variant="danger" onClick={() => deleteRivalry(rivalry.city1.id, rivalry.city2.id, index)}>Delete</Button>
                                        </td>
                                    </tr>
                                );
                            })
                        }
                    </tbody>
                </Table>
                <h2>Current rivalry</h2>
                <Form onSubmit={() => { }}>
                    <Row>
                        <Col xs={12} md={6}>
                            <Form.Group>
                                <Form.Label>City 1:</Form.Label>
                                <Form.Control name="city1" disabled value={rivalry.city1 !== undefined ? rivalry.city1.name : ''}></Form.Control>
                            </Form.Group>
                        </Col>
                        <Col xs={12} md={6}>
                            <Form.Group>
                                <Form.Label>City 2:</Form.Label>
                                <Form.Control name="city2" disabled value={rivalry.city2 !== undefined ? rivalry.city2.name : ''}></Form.Control>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Form.Group>
                                <Button type="submit" onClick={createRivalry}>Add rivalry</Button>
                            </Form.Group>
                        </Col>
                    </Row>
                </Form>
                <h2>City Search</h2>
                <Form onSubmit={citySearch}>

                    <Row>
                        <Col xs={12} md={9}>
                            <Form.Group>
                                <Form.Control name="cityName"></Form.Control>
                            </Form.Group>
                        </Col>
                        <Col xs={12} md={3}>
                            <Form.Group>
                                <Button className="w-100" type="submit">Search</Button>
                            </Form.Group>
                        </Col>
                    </Row>
                </Form>
                <Table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>State</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {searchResults.map((city, index) => {
                            return (
                                <tr key={index}>
                                    <td>{city.id}</td>
                                    <td>{city.name}</td>
                                    <td>{city.state}</td>
                                    <td><Button onClick={() => addToRivalry(city)}>Add to rivalry</Button></td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>
            </Container>
            <br />
        </React.Fragment>
    );

}

export default EditRivalries;