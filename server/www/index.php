<?php

	require_once __DIR__ . '/php/models/Quiz.php';
	require_once __DIR__ . '/php/models/QuizQuestion.php';
	require_once __DIR__ . '/php/models/QuestionChoice.php';
	
	header('Content-Type: application/json');

	$question2 = new QuizQuestion('AHAHAHAHAHAHAHAH?', []);
	$question2->addChoice('Yes', true);
	$question2->addChoice('No', false);

	$quiz = new Quiz('Quiz #2', 'c3b06734-fa42-48ff-becf-043f6801cc1d', [$question2]);
	exit(json_encode(['success' => 	$quiz->save()]));

?>