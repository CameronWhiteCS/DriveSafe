import React, { useEffect } from 'react';
import { useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Loading from '../Loading.js';
import axios from 'axios';
import { useHistory } from 'react-router-dom';

import Button from 'react-bootstrap/Button';

import Cookies from 'universal-cookie';

import { signedIn } from '../../session.js';

const QuizManager = (props) => {

    const [quizDescriptors, setQuizDescriptors] = useState(null);

    const history = useHistory();

    const load = () => {
        axios.get('/php/api/quizzes/quizzes.php?action=get-descriptors')
            .then((res) => {
                setQuizDescriptors(res.data);
            })
    }

    const onClick = (evt) => {
        evt.preventDefault();
        history.push(evt.target.pathname);
    }

    const createQuiz = () => {
        const params = {
            token: new Cookies().get('token'),
            action: 'create'
        };
        axios.post('/php./api/quizzes/quizzes.php', params).then((res) => {
            if (res.data.error) {
                alert(res.data.error);
            } else {
                load();
            }
        });
    }

    useEffect(load, []);
    if (!signedIn()) {
        return (<p>You must be signed in to view this page.</p>);
    } else if (quizDescriptors === null) {
        return <Loading />
    } else {
        return (
            <Row>
                <Col xs={0}></Col>
                <Col xs={10}>
                    <h1>Quiz Manager</h1>
                    <hr/>
                    <Alert variant="dark">
                        Here, you can create new quizzes and modify old ones. Quiz questions can have any number of possible answers, and more than one answer can be marked as correct.
             </Alert>
                    {
                        quizDescriptors.map((quiz, i) => {
                            return (
                                <React.Fragment key={i}>
                                    <a href={"/admin/quizmanager/edit/" + quiz.id} onClick={onClick}>{quiz.name}</a><br></br><br />
                                </React.Fragment>
                            );
                        })
                    }
                    <Button onClick={createQuiz}>Create new quiz</Button>
                </Col>
                <Col xs={1}></Col>
            </Row>
        );
    }


}

export default QuizManager;