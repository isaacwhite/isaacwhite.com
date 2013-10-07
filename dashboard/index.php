<?php

$today = date("mdy"); //determine the current date as a 6 character string
$todayString = date("m/d/y");
$file = 'useCount.txt';
$zipCode = 10027;

//actual api lookup
// $forcastLookup = "http://api.wunderground.com/api/ae1ee363833e1943/forecast/q/";
// $conditionsLookup = "http://api.wunderground.com/api/ae1ee363833e1943/geolookup/conditions/q/"

//some saved responses for testing
$forcastLookup = "10027_forcast";
$conditionsLookup = "10027_conditions";


// Open the file to get previous page info
$useString = file_get_contents($file);

//split the available info to get count and last run date
$useQuery = explode( ',', $useString );

//assign strings for comparison
$lastDate = $useQuery[0];
$queryCountString = $useQuery[1];

//parse the query count into a variable to increment
$queryCount = intval($queryCountString);
if ($lastDate == $today) {
	$queryCount++;
} else {
	$queryCount = 1;
}
// Append a new person to the file
$newUseString = "";
$newUseString .= $today . "," . $queryCount;

// Write the contents back to the file
file_put_contents($file, $newUseString);

$jsonForcast = file_get_contents($forcastLookup . $zipCode . ".json");
$jsonConditions = file_get_contents($conditionsLookup . $zipCode . ".json");
$parsedForcast = json_decode($jsonForcast);
$parsedConditions = json_decode($jsonConditions); 
/*$location = $parsed_json->{'location'}->{'city'};
$temp_f = $parsed_json->{'current_observation'}->{'temp_f'};
$currentHigh = $parse_json->*/
?>
<!DOCTYPE html>
<!--[if lt IE 7]>      <html class="no-js lt-ie9 lt-ie8 lt-ie7"> <![endif]-->
<!--[if IE 7]>         <html class="no-js lt-ie9 lt-ie8"> <![endif]-->
<!--[if IE 8]>         <html class="no-js lt-ie9"> <![endif]-->
<!--[if gt IE 8]><!--> <html class="no-js"> <!--<![endif]-->
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
        <title>Dashboard</title>
        <meta name="description" content="">
        <meta name="viewport" content="width=device-width">

        <link rel="stylesheet" href="../css/normalize.min.css">
        <link rel="stylesheet" href="../css/style.css">

        <script src="../js/vendor/modernizr-2.6.2.min.js"></script>
        <script>
        // var date = "Date: " + <?php print $todayString; ?>;
        // var fileOut = "File output: \"" + <?php print $newUseString; ?> + "\"";
        var queryCount = "Daily Query Count: " + <?php print $queryCount; ?> ;
        var serverResponse = <?php print $jsonForcast;?>;
        var conditionResponse = <?php print $jsonConditions; ?>;
        console.log(serverResponse);
        console.log(conditionResponse);
        // console.log(date);
        // console.log(fileOut);
        console.log(queryCount);
        </script>
    </head>
    <body>
        <!--[if lt IE 7]>
            <p class="chromeframe">You are using an <strong>outdated</strong> browser. Please <a href="http://browsehappy.com/">upgrade your browser</a> or <a href="http://www.google.com/chromeframe/?redirect=true">activate Google Chrome Frame</a> to improve your experience.</p>
        <![endif]-->
        <div id="dashboard">
        	<h3>Date: <?php print $todayString ?></h3>
        	<h3>File output: "<?php print $newUseString ?>"</h3>
        	<h3>Daily Query Count : <?php print $queryCount ?> </h3>
        </div>

    </body>
</html>