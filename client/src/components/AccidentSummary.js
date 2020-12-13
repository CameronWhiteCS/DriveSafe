import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Loading from './Loading.js';
import { Row, Col, Table, Button, ButtonGroup, ButtonToolbar, Alert, Form } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

const AccidentSummary = (props) => {

    const [summary, setSummary] = useState(undefined);
    const [page, setPage] = useState(0);
    const [cityName, setCityName] = useState('');
    const [accidents, setAccidents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedCity, setSelectedCity] = useState(-1);

    const loadData = (page) => {
        setLoading(true);
        axios.get('/php/api/reports/summary.php?pageSize=5&page=' + page + '&cityName=' + cityName)
            .then((res) => {
                setLoading(false);
                if (res.data.error) {
                    alert(res.data.error);
                } else {
                    setSummary(res.data);
                    if(res.data.accidentTotals.length > 0){
                        loadMap(res.data.accidentTotals[0].id);
                    } else {
                        setAccidents([]);
                    } 
                }
            });
    }

    const loadMap = (cityId) => {
        setLoading(true);
        axios.get('/php/api/reports/reports.php?cityId=' + cityId)
            .then(
                (res) => {
                    setLoading(false);
                    if(res.data.error) {
                        alert(res.data.error)
                    } else {
                        setAccidents(res.data);
                        setSelectedCity(cityId);
                    } 
                }
            )
    }

    const pageForward = (pageDiff) => {
        setPage(page + pageDiff);
        loadData(page + pageDiff);
    }

    useEffect(() => { loadData(0) }, [])

    if (summary === undefined) {
        return <Loading />
    }

    const table = () => {
        if (summary.accidentTotals.length <= 0) {
            return (<p>No results found.</p>);
        } else {
            return (
                <Table striped bordered hover variant="light">
                    <thead>
                        <tr>
                            <th>City</th>
                            <th>Number of accidents</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            summary.accidentTotals.map((element) => {
                                return (
                                    <tr key={element.id} onClick={() => loadMap(element.id)} style={selectedCity === element.id ? {textDecoration: 'underline'} : {}}>
                                        <td>{element.name}</td>
                                        <td>{element.accidents}</td>
                                    </tr>
                                );
                            })
                            
                            
                        }
                    </tbody>
                </Table>
            )
        }
    }

    const searchForm = () => {
        return (
            <Form>
                <Form.Group>
                    <Form.Label>City name:</Form.Label>
                    <Form.Control onChange={(e) => { setCityName(e.target.value); }}></Form.Control>
                </Form.Group>
                <Form.Group>
                    <Button type="submit" onClick={(e) => { e.preventDefault(); loadData(page) }}>Search</Button>
                </Form.Group>
            </Form>
        );
    }

    const map = () => {
        let center = [29.6516300, -82.3248300];
        if (accidents.length > 0) center = [accidents[0].latitude, accidents[0].longitude];
        return (
            <MapContainer center={center} zoom={0} scrollWheelZoom={true} style={{ width: '100%', height: '500px' }}>
                <TileLayer
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {
                    accidents.map((element, id) => {
                        return (
                            <Marker id={id} position={[element.latitude, element.longitude]}>
                                <Popup>
                                    <p className="m-0">Date: {element.date}</p>
                                    <p className="m-0">Rain: {element.rain ? "True": "False"}</p>
                                    <p className="m-0">Hail: {element.hail ? "True": "False"}</p>
                                    <p className="m-0">Sleet: {element.sleet ? "True": "False"}</p>
                                    <p className="m-0">Snow: {element.snow ? "True": "False"}</p>
                                    <p className="m-0">Fog: {element.fog ? "True": "False"}</p>
                                    <p className="m-0">Wind: {element.wind ? "True": "False"}</p>
                                </Popup>
                            </Marker>
                        );
                    })
                }
            </MapContainer>
        );
    }

    const pageForwardDisabled = () => {
        return summary.numRows < (page + 1) * summary.pageSize;
    }

    const pageBackwardDisabled = () => {
        return page === 0;
    }

    return (
        <React.Fragment>
            {loading && <Loading/>}
            <Row>
                <Col xs={1} sm={2} md={3} />
                <Col xs={10} sm={8} md={6}>
                    <h1>Accident Data Summary</h1>
                    <hr />
                    {
                        props.hasPermission('report.create') &&
                        <Alert variant="light">
                            <p>Trying to submit a report? click <NavLink to="/accidents/create" style={{ textDecoration: 'underline' }}>here</NavLink>.</p>
                        </Alert>
                    }
                    <h2>City summaries</h2>
                    <hr />
                    {searchForm()}
                    {table()}
                    <ButtonToolbar>
                        <ButtonGroup className="mr 2">
                            <Button onClick={() => { pageForward(-1) }} disabled={pageBackwardDisabled()}>Page backward</Button>
                            <Button onClick={() => { pageForward(1) }} disabled={pageForwardDisabled()}>Page forward</Button>
                        </ButtonGroup>
                    </ButtonToolbar>
                    <br />
                    {map()}
                    <br />
                </Col>
                <Col xs={1} sm={2} md={3} />
            </Row>
        </React.Fragment>
    );

}

export default AccidentSummary;