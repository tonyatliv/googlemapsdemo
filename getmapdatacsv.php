<?php
// returns the requested data set as xml
// is not passed an actual filename for security reasons
header('Content-Type: application/xml');
$filename = 'mapdata_test.csv';
$file = $_GET['data'];
if ($file == 'crime')
{
    $filename = 'mapdata_crime.csv';
}


// Opening the file for reading...
$fp = fopen($filename, 'r');

// Headrow
$head = fgetcsv($fp, 4096, ',', '"');
 
print("<?xml version='1.0' encoding='ISO-8859-1'?><markers>");

// Rows
while($column = fgetcsv($fp, 4096, ',', '"'))
{
 
    $string = "<marker";
    // This is a great trick, to get an associative row by combining the headrow with the content-rows.
    $i = 0;
    foreach ( $head as $col)
    {
        $val = $column[$i];
        $val = trim($val,' ');
        $val = trim($val,'\'');
        if (strlen( $val) > 0)
        {
            $string = $string ." ".$col."='" .  $val."'";
        }
        $i = $i + 1;
    }
    $string = $string ." />\n";
    print($string);
}

print("</markers>");
?> 