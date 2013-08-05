<?php

$today = date("mdy"); //determine the current date as a 6 character string
$todayString = date("m/d/y");
$file = 'useCount.txt';
$zipCode = 10027;

function getWeatherElements($iconCode,$isDay) {
    $iconHTML = "<ul class=\"weather\"><li class=\"";
    if ($isDay) {
        $sunMoon = " icon-sunny";
    } else {
        $sunMoon = " icon-night";
    }
    if ($iconCode == "cloudy") {
        $iconHTML .= "icon-cloud";
    } else if ($iconCode == "rain") {
        $iconHTML .= "basecloud\"></li><li class=\"";
        $iconHTML .= "icon-rainy";
    } else if (($iconCode == "chanceflurries") ||
        ($iconCode == "chancesnow") ||
        ($iconCode == "flurries") ||
        ($iconCode == "snow")) {
        $iconHTML .= "basecloud\"></li><li class=\"";
        $iconHTML .= "icon-snowy";
    } else if (($iconCode == "sleet") ||
        ($iconCode == "chancesleet")) {
        $iconHTML .= "icon-sleet";
    } else if (($iconCode == "chancetstorms") ||
        ($iconCode == "tstorms")) {
        $iconHTML .= "basecloud storm\"></li><li class=\"";
        $iconHTML .= "icon-thunder";
    } else if ( (stristr($iconCode,'partly')) || 
        (stristr($iconCode,'mostly')) ) {
            $iconHTML .= "basecloud\"></li><li class=\"";
            $iconHTML .= $sunMoon;
    } else if (stristr($iconCode,'chance')) {
            $iconHTML .= "basecloud\"></li><li class=\"";
            $iconHTML .= $sunMoon;
    }else {
        if($isDay) {
            $iconHTML .= "icon-sun";
        } else {
            $iconHTML .= "icon-moon";
        }
    }
    $iconHTML .= "\"></li></ul>";

    return $iconHTML;
}

function applyColor($temperature) {
    
    $labelHTML = "<p class=\"wlabel";
    if ($temperature > 75) {
        $labelHTML .= " hot\">";
    } else if ($temperature < 55) {
        $labelHTML .= " cold\">";
    } else {
        $labelHTML .= "\">";
    }
    $labelHTML .= $temperature . " °F</p>";
    return $labelHTML;
}

//actual api lookup
$forecastLookup = "http://api.wunderground.com/api/ae1ee363833e1943/forecast/q/";
$conditionsLookup = "http://api.wunderground.com/api/ae1ee363833e1943/geolookup/conditions/q/";
$astronomyLookup = "http://api.wunderground.com/api/ae1ee363833e1943/astronomy/q/";

//some saved responses for testing
// $forecastLookup = "forecast_";
// $conditionsLookup = "conditions_";


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
// Append a new use string to the file
$newUseString = "";
$newUseString .= $today . "," . $queryCount;

// Write the contents back to the file
file_put_contents($file, $newUseString);

$jsonForecast = file_get_contents($forecastLookup . $zipCode . ".json");
$jsonConditions = file_get_contents($conditionsLookup . $zipCode . ".json");
$jsonAstronomy = file_get_contents($astronomyLookup . $zipCode . ".json");
$parsedForecast = json_decode($jsonForecast);
$parsedConditions = json_decode($jsonConditions); 
$parsedAstronomy = json_decode($jsonAstronomy); 

/*$location = $parsed_json->{'location'}->{'city'};
$temp_f = $parsed_json->{'current_observation'}->{'temp_f'};
$currentHigh = $parse_json->*/
$currentObservation = $parsedConditions ->{'current_observation'};
$forecasts = $parsedForecast->{'forecast'}->{'txt_forecast'}->{'forecastday'};
$simpleForecasts = $parsedForecast->{'forecast'}->{'simpleforecast'}->{'forecastday'};
$currentTemp = $currentObservation->{'temp_f'};
$feelsLike = $currentObservation->{'feelslike_f'};;
$conditionsKey = $currentObservation->{'icon'};
$iconClass = getWeatherElements($conditionsKey);
$lastUpdated = $currentObservation->{'observation_time'};
$sunset = $parsedAstronomy->{'moon_phase'}->{'sunset'};
$sunrise = $parsedAstronomy->{'moon_phase'}->{'sunrise'};
$sunsetString = ($sunset->{'hour'} - 12) . ":" . ($sunset->{'minute'});
$sunriseString = ($sunrise->{'hour'}) . ":" . ($sunrise->{'minute'});
$periodTitles = array();
$forecastIcons = array();

// print $sunriseString;
// print $sunsetString;

foreach($forecasts as $period) {
    $title = $period->{'title'};
    $icon = $period->{'icon'};
    if(!stristr($title,'night')) {
         $daytime = TRUE;
    } else {
        $daytime = FALSE;
    }

    $iconClean = getWeatherElements($icon,$daytime);
    array_push($periodTitles, $title);
    array_push($forecastIcons, $iconClean);
}
$forecastTemps = array();
foreach($simpleForecasts as $period) {
    $high = $period->{'high'}->{'fahrenheit'};
    $low = $period->{'low'}->{'fahrenheit'};
    //if the first forecast is an evening value

    if(!stristr($periodTitles[0],'night')) {
         array_push($forecastTemps,$high,$low);
    } else {
        array_push($forecastTemps,$low,$high);
    }
}

//var_dump($periodTitles);
// var_dump($forecasts);

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
        <link rel="stylesheet" href="../fonts/weather/iconvault-preview.css">
        <style>
        * {
            box-sizing: border-box;
        }

        html {
            /*overflow: hidden;*/
        }
        .current .weather {
            font-size: 20rem;
            margin: 0 auto -.25em;
            /*line-height: 0;*/
        }

        .current {
            margin-bottom: 3em;
        }

        ul.weather {
            font-size: 14rem;
            text-align: center;
            margin-bottom: -.15em;
        }
        .weather p {
            font-size: 4rem;
            margin: 0;
            color: white;
            text-align: center;
        }
        .wlabel {
            text-align: center;
            margin:0;
            font-size: 1.5em;
        }

        .current .wlabel {
            font-size: 3rem;
        }
        .preview {
            float: left;
            width: 50%;
            margin-top: 3em;
        }

        @media all and (min-width: 48em) {
            .preview {
                width: 25%;
            }
        }
        ul {
            padding: 0;
            margin: 0;
        }
        li:after {
            content: "";
        }


        li.basecloud {
            position:absolute;
        }

        h3 {
            font-style: normal;
            text-transform: uppercase;
            font-size: .925em;
        }
        .basecloud:before {
            font-family: "iconvault";
            font-style: normal;
            font-weight: normal;
            font-variant: normal;
            text-transform: none;
            line-height: 1;
            -webkit-font-smoothing: antialiased;
            text-decoration: inherit;
            content: '\f105';
            position:absolute;
            color: white;
        }

        .basecloud.storm:before {
            color: #4c4c4c;
        }
        .icon-moon,
        .icon-night {
            color: #f9f7af;
        }

        .icon-sun,
        .icon-sunny,
        .icon-sunrise,
        .icon-thunder  {
            color: #ffde00;
        }

        footer p {
            clear: both;
            float: right;
            bottom: 0;
            margin: 8em 3em 1em 0;
            color: #d7d7d7;
            text-transform: uppercase;
            font-size: .925em;
        }
        .hot {
            color: #ed9128;
        }
        .cold,
        .icon-rainy{
            color: #28b3ed;
        }

        .icon-sunset {
            color: #f96f23;
        }

        #almanac {
            display:block;
            text-align:center;
        }
        .icon-sunset,
        .icon-sunrise {
            font-size: 6rem;
            display: block;
            margin-bottom: -1.5rem;
        }

        .sunset p,
        .sunrise p{
            font-size: 2rem;
            display: block;
            margin: 0;
        }

        .sunrise,
        .sunset {
            display:inline-block;
            margin: 0 2rem;
        }

        </style>
        <script>

        // var date = "Date: " + <?php print $todayString; ?>;
        // var fileOut = "File output: \"" + <?php print $newUseString; ?> + "\"";
        var queryCount = "Daily Query Count: " + <?php print $queryCount; ?> ;
        var serverResponse = <?php print $jsonForecast;?>;
        var conditionResponse = <?php print $jsonConditions; ?>;
        var currentCondition = "<?php print $conditionsKey; ?>";
        var astronomy = <?php print $jsonAstronomy; ?>;
        console.log(serverResponse);
        console.log(conditionResponse);
        console.log(currentCondition);
        console.log(queryCount);
        console.log(astronomy);
        </script>
    </head>
    <body>
        <!--[if lt IE 7]>
            <p class="chromeframe">You are using an <strong>outdated</strong> browser. Please <a href="http://browsehappy.com/">upgrade your browser</a> or <a href="http://www.google.com/chromeframe/?redirect=true">activate Google Chrome Frame</a> to improve your experience.</p>
        <![endif]-->
        <div id="dashboard">
            <div class="current">
                <?php print $iconClass; ?>
                <?php print applyColor($currentTemp); ?>
            </div>
            <div id="almanac">
                <div class="sunrise">
                    <ul><li class="icon-sunrise"></li></ul>
                    <p><?php print $sunriseString; ?></p>
                </div>
                <div class="sunset">
                    <ul><li class="icon-sunset"></li></ul>
                    <p><?php print $sunsetString; ?></p>
                </div>
            </div>
        </div>
        <div class="preview first">
            <h3><?php print $periodTitles[0]; ?></h3>
            <?php print $forecastIcons[0]; ?>
            <?php print applyColor($forecastTemps[0]); ?>
        </div>
        <div class="preview second">
             <h3><?php print $periodTitles[1];  ?></h3>
             <?php print $forecastIcons[1]; ?>
             <?php print applyColor($forecastTemps[1]); ?>
        </div>
        <div class="preview third">
            <h3><?php print $periodTitles[2];  ?></h3>
                <?php print $forecastIcons[2]; ?>
                <?php print applyColor($forecastTemps[2]); ?>
        </div>
        <div class="preview fourth">
             <h3><?php print $periodTitles[3];  ?></h3>
             <?php print $forecastIcons[3]; ?>
             <?php print applyColor($forecastTemps[3]); ?>
        </div>
        <div class="preview fifth">
             <h3><?php print $periodTitles[4];  ?></h3>
             <?php print $forecastIcons[4]; ?>
             <?php print applyColor($forecastTemps[4]); ?>
        </div>
        <div class="preview sixth">
             <h3><?php print $periodTitles[5];  ?></h3>
             <?php print $forecastIcons[5]; ?>
             <?php print applyColor($forecastTemps[5]); ?>
        </div>
    </body>
    <footer>
        <p><?php print $lastUpdated?></p>
    </footer>
</html>
