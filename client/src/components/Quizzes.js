import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Loading from './Loading.js';
import {useHistory} from 'react-router-dom';
import {Row, Col} from 'react-bootstrap';

const Quizzes = (props) => {

    const [quizzes, setQuizzes] = useState(null);

    const history = useHistory();

    const loadQuizzes = () => {
        axios.get('/php/api/quizzes/quizzes.php?action=get-descriptors').then(
            (res) => {
                if (res.data.error) {
                    alert(res.data.error);
                } else {
                    setQuizzes(res.data);
                }
            }
        );
    }

    const onClick = (evt) => {
        evt.preventDefault();
        history.push(evt.target.pathname);
    }

    useEffect(loadQuizzes, []);

    if (quizzes === null) {
        return <Loading />
    } else {
        return (
            <React.Fragment>
                <Row>
                    <Col xs={1}/>
                    <Col xs={10}>
                    <h1>Quizzes</h1>
                    <hr/>
                        {
                            quizzes.map((quiz, index) => {
                                return (
                                    <p key={index}><a onClick={onClick} href={"/quizzes/" + quiz.id}>{quiz.name}</a></p>
                                );
                            })
                        }
                    </Col>
                    <Col xs={1}  />
                </Row>
            </React.Fragment>
        );
    }



}

export default Quizzes;