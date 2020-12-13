import React, { useState } from 'react';

import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

const QuestionPanel = (props) => {

    const [correct, setCorrect] = useState(false);
    const [choiceText, setChoiceText] = useState('');
    const [edit, setEdit] = useState(false);

    const toggleCorrectness = (choiceIndex) => {
        let newQuiz = { ...props.quiz };
        newQuiz.questions.forEach((question) => {
            if (question.id === props.question.id) {
                question.choices[choiceIndex].correct = !question.choices[choiceIndex].correct;
            }
        });
        props.setQuiz(newQuiz);
    }

    const deleteChoice = (choiceIndex) => {
        let newQuiz = { ...props.quiz };
        newQuiz.questions.forEach((question, questionIndex) => {
            if (question.id === props.question.id) {
                let newChoices = [];
                question.choices.forEach((choice, i) => {
                    if (i !== choiceIndex) newChoices.push(choice);
                });
                question.choices = newChoices;

            }
        });
        props.setQuiz(newQuiz);
    }

    const changeQuestionText = (text) => {
        let newQuiz = { ...props.quiz };
        let newQuestions = [];
        newQuiz.questions.forEach((question, index) => {
            if (question.id === props.question.id) {
                question.text = text;
            }
            newQuestions.push(question);
        });
        newQuiz.questions = newQuestions;
        props.setQuiz(newQuiz);
        console.log(props.quiz);
    }

    const addChoice = () => {
        let newQuiz = { ...props.quiz };
        newQuiz.questions.forEach((question, questionIndex) => {
            if (question.id === props.question.id) {
                question.choices.push({ text: choiceText, correct: correct });
                console.log(question.choices);
            }
        });
        props.setQuiz(newQuiz);
    }

    const deleteQuestion = () => {
        const newQuiz = {...props.quiz};
        const newQuestions = [];
        newQuiz.questions.forEach((question, index) => {
            if(props.questionIndex !== index) newQuestions.push(question);
        });
        newQuiz.questions = newQuestions;
        props.setQuiz(newQuiz);
    }

    const buttonStyle = {
        width: '100px'
    }

    return (
        <React.Fragment>
            <p style={{fontSize: '20px'}}><b>Question {props.questionIndex + 1}</b></p>
            {
                edit ?

                    <React.Fragment>

                                <Form.Control style={{display: 'inline-block', width: '250px'}} onChange={(evt) => changeQuestionText(evt.target.value)} />
                                <Button style={{marginLeft: '10px', display: 'inline-block', width: '125px', position: 'relative', bottom: '2px'}} onClick={() => setEdit(false)}>Update text</Button>
                                <br/>
                                <br/>
                    </React.Fragment>

                    :

                    <React.Fragment>
                        <p onClick={() => setEdit(true)}>{props.question.text}</p>
                    </React.Fragment>
            }
            <Table striped bordered hover variant="light">
                <thead>
                    <tr>
                        <th><b>Choice</b></th>
                        <th><b>Correct</b></th>
                        <th><b>Delete/Add Choice</b></th>
                    </tr>
                </thead>
                <tbody>
                    {
                        props.question.choices.map((choice, choiceIndex) => {
                            return (
                                <React.Fragment key={choiceIndex}>
                                    <tr>

                                        <td>{choice.text}</td>

                                        <td><Button style={buttonStyle} variant="primary" onClick={() => toggleCorrectness(choiceIndex)}>{choice.correct ? "Correct" : "Incorrect"}</Button></td>
                                        <td><Button style={buttonStyle} onClick={() => deleteChoice(choiceIndex)} variant="danger">Delete</Button></td>
                                    </tr>
                                </React.Fragment>
                            );
                        })
                    }
                    <tr>
                        <td><Form.Control onChange={(evt) => { setChoiceText(evt.target.value) }}></Form.Control></td>
                        <td><Button style={buttonStyle} onClick={() => setCorrect(!correct)}>{correct ? "Correct" : "Incorrect"}</Button></td>
                        <td><Button style={buttonStyle} onClick={addChoice}>Add choice</Button></td>
                    </tr>
                </tbody>
            </Table>
            <p><Button variant="danger" style={buttonStyle} onClick={deleteQuestion}>Delete</Button></p>
            <br/>
            <br/>
            <br/>
        </React.Fragment>
    );

}

export default QuestionPanel;