<?php

/**
 * Used to generate dynamic queries with prepared statements. Returns an array containing both a type string and MYSQL formatted list of prepared statement tuples.
 * Output format: [typeString, tuples] 
 * $tupleSize: size of the tuples to be generated
 * $values: list of values used to generate the tuples. Size must be a multiple of $tupleSize.
 */
function generate_prepared_tuples(int $tupleSize, int $tupleCount){

    $valueCount = $tupleCount * $tupleSize;

    $valueString = "";
    $typeString = "";
    for($i = 0; $i < $valueCount; $i++) {
        $typeString =  $typeString . "s";
    }

    for($i = 0; $i < $valueCount; $i = $i + $tupleSize){
        $valueString = $valueString . "(";
        for($j = 0; $j < $tupleSize; $j++){
            $valueString = $valueString . "?, ";
        }
        $valueString = substr($valueString, 0, strlen($valueString) - 2);
        $valueString = $valueString . "), ";
    }
    $valueString = substr($valueString, 0, strlen($valueString) - 2);
    return [$typeString, $valueString];
}

?>