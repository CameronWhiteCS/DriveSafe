import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useHistory, useParams } from 'react-router';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import Loading from './Loading.js';

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
        const result = (correct / quiz.questions.length * 100);
        alert('You scored a ' + result + '%');
        history.push('/quizzes/');
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