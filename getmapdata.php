<?php
// returns the requested data set as xml
// is not passed an actual filename for security reasons
header('Content-Type: application/xml');

$pcFile = "postcode_lch.csv";
$pc_array = array();
foreach (file($pcFile) as $line)
{
    $l = trim($line);
    $fields = explode(",", $l, 2);
    $pc = trim($fields[0],'"');
    $loc = trim($fields[1],'"');
    $pc_array[$pc]=$loc;
}
 


$filename = 'mapdata_test.xml';
$file = $_GET['data'];
if ($file == 'crime')
{
    $filename = 'mapdata_crime.xml';
}
$xml = simplexml_load_file($filename );

foreach($xml->children() as $child)
  {
    if (!$child['location'])
    {
    $pc = $child['postcode'];
    $pc = trim($pc);
    $loc = $pc_array[$pc];
    $child['location'] = $loc;
    }
  }


 
$output = $xml->asXML();

// file_get_contents($filename );


//header('Content-Type: application/xml');
//$pc = $_GET['postcode'];
//$output = $pc_array[$pc];
 


print ($output);
?>  