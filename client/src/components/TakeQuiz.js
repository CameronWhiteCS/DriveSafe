import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useHistory, useParams } from 'react-router';
import {signedIn} from '../session.js';
import {Row, Col, Form, Button, Alert} from 'react-bootstrap';

import Loading from './Loading.js';
import Cookies from 'universal-cookie';

const TakeQuiz = (props) => {

    const { id } = useParams();

    const [quiz, setQuiz] = useState(null);

    const history = useHistory();

    const loadQuiz = () => {
        axios.get('/php/api/quizzes/quizzes.php?id=' + id)
            .then((res) => {
                if (res.data.error) {
                    alert(res.data.error);
                } else {
                    setQuiz(res.data);
                }
            });
    }

    const onSubmit = (evt) => {
        evt.preventDefault();
        let correct = 0;
        quiz.questions.forEach((question, questionIndex) => {
            let answer = evt.target['question-' + questionIndex].value;
            if(answer === '') return;
            if(question.choices[answer].correct === true) correct++;
        });
        const score = (correct / quiz.questions.length * 100);
        if(!signedIn()) {
            alert('You scored a ' + score + '%');
            return;
        }
        const params = {
            action: 'submit_score',
            token: new Cookies().get('token'),
            score: score,
            quiz: quiz.id
        };
        axios.post('/php/api/quizzes/quizzes.php', params).then(
            (res) => {
                if(res.data.error) {
                    alert(res.data.error);
                } else {
                    alert('You scored a ' + score + '%');
                    history.push('/quizzes/');
                }
            }
        )
    }

    useEffect(loadQuiz, []);



    if (quiz === null) {
        return <Loading />
    } else {
        console.log(quiz);
        return (
            <React.Fragment>
                <Row>
                    <Col xs={1} />
                    <Col xs={10}>
                        <h1>{quiz.name}</h1>
                        <hr />
                        <Alert variant="secondary">
                            <p>You must be signed in to record your quiz scores, but you can take quizzes without being signed in.</p>
                        </Alert>
                        <Form onSubmit={onSubmit}>
                        {
                            quiz.questions.map((question, questionIndex) => {
                                return (
                                    <React.Fragment key={questionIndex}>
                                        <p><b>{question.text}</b></p>
                                        {
                                            question.choices.map((choice, choiceIndex) => {
                                                return (
                                                    <React.Fragment key={choiceIndex}>
                                                        <p> <input type="radio" name={"question-" + questionIndex} value={choiceIndex}/> {choice.text}</p>
                                                    </React.Fragment>
                                                )
                                            })  
                                        }
                                        <br/>
                                    </React.Fragment>
                                );
                            })
                        }
                        <Button type="submit">Submit</Button>
                        </Form>
                    </Col>
                    <Col xs={1} />
                </Row>
            </React.Fragment>
        );
    }

}

export default TakeQuiz;