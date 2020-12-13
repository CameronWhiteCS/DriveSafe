import React, { useEffect } from 'react';
import { useState } from 'react';

import QuestionPanel from './QuestionPanel.js';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import axios from 'axios';

import Cookies from 'universal-cookie';
import { useHistory, useParams } from 'react-router';

import Loading from '../Loading.js';
import { signedIn } from '../../session.js';

const QuizPanel = (props) => {

    const { quizId } = useParams();
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editTitle, setEditTitle] = useState(false);

    const history = useHistory();

    const loadQuiz = () => {
        axios.get('/php/api/quizzes/quizzes.php?id=' + quizId).then((res) => {
            if (res.data.error) {
                alert(res.data.error);
                history.push('/admin/quizmanager');
            } else {
                setQuiz(res.data);
                setLoading(false);
            }
        });
    }


    const saveQuiz = () => {
        const params = {
            token: new Cookies().get('token'),
            action: 'save',
            quiz: quiz
        };
        console.log(params);

        axios.post('/php/api/quizzes/quizzes.php', params).then((res) => {
            console.log(res.data);
            if (res.data.error) {
                alert(res.data.error);
            } else {
                history.push('/admin/quizmanager/');
            }
        });
    }

    const deleteQuiz = () => {
        if (window.confirm('WARNING! This action is irreversible, are you sure you wish to continue?')) {

            const params = {
                action: 'delete',
                id: quiz.id,
                token: new Cookies().get('token')
            };

            axios.post('/php/api/quizzes/quizzes.php', params).then((res) => {
                if (res.data.error) {
                    alert(res.data.error);
                } else {
                    history.push('/admin/quizmanager/');
                }
            });
        }
    }

    const addQuestion = () => {
        const newQuiz = {...quiz};
        newQuiz.questions.push({text: 'Blank question', choices: []});
        setQuiz(newQuiz);
    }

    useEffect(loadQuiz, []);

    if (!quiz) {
        return (<Loading />);
    } else if (!signedIn()) {
        return (<p>You must be signed in to view this page.</p>);
    }

    return (
        <Row>
            <Col xs={1} />
            <Col xs={10}>
                {loading ? <Loading /> : <React.Fragment />}
                {
                    editTitle ?
                        <fieldset>
                            <Form.Control style={{width: '250px', display: 'inline-block'}} onChange={(evt) => setQuiz({ ...quiz, name: evt.target.value })} />
            
                            <Button style={{marginLeft: '10px', display: 'inline-block', position: 'relative', bottom: '2px'}} onClick={() => setEditTitle(false)}>Save quiz title</Button>
                         
                        </fieldset>
                        :
                        <h2 onClick={() => { setEditTitle(true) }}>{quiz.name}</h2>
                }
                <hr/>
                {
                    quiz.questions.map((question, questionIndex) => {
                        return (
                            <React.Fragment key={questionIndex}>
                                <QuestionPanel questionIndex={questionIndex} quiz={quiz} setQuiz={setQuiz} question={question} key={questionIndex} /><br />
                            </React.Fragment>
                        );

                    })
                }
                <Button style={{width: '125px'}} onClick={addQuestion}>Add question</Button>&nbsp;&nbsp;&nbsp;
                <Button style={{width: '125px'}} variant="primary" onClick={saveQuiz}>Save quiz</Button>&nbsp;&nbsp;&nbsp;
                <Button style={{width: '125px'}} variant="danger" onClick={deleteQuiz}>Delete quiz</Button>

                <hr />
            </Col>
            <Col xs={1} />
        </Row>

    );



}

export default QuizPanel;