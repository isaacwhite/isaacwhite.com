<?php

$today = date("mdy"); //determine the current date as a 6 character string
$todayString = date("m/d/y");
$file = 'useCount.txt';
$zipCode = 10027;

function getWeatherElements($iconCode,$isDay) {
    $iconHTML = "<ul class=\"weather\"><li class=\"";
    if ($iconCode == "cloudy") {
        $iconHTML .= "icon-cloud";
    } else if (($iconCode == "chancerain") ||
            ($iconCode == "rain")) {
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
        $iconHTML .= "basecloud\"></li><li class=\"";
        $iconHTML .= "icon-thunder";
    } else if (stristr($iconCode,'partly')) {
        // if ($iconHTML == "partlycloudy") {
            $iconHTML .= "basecloud\"></li><li class=\"";
            $iconHTML .= "icon-night";
        // }
    } else {
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
$forcastLookup = "http://api.wunderground.com/api/ae1ee363833e1943/forecast/q/";
$conditionsLookup = "http://api.wunderground.com/api/ae1ee363833e1943/geolookup/conditions/q/";

//some saved responses for testing
$forcastLookup = "forcast_";
$conditionsLookup = "conditions_";


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
$currentObservation = $parsedConditions ->{'current_observation'};
$forcasts = $parsedForcast->{'forecast'}->{'txt_forecast'}->{'forecastday'};
$simpleForcasts = $parsedForcast->{'forecast'}->{'simpleforecast'}->{'forecastday'};
$currentTemp = $currentObservation->{'temp_f'};
$feelsLike = $currentObservation->{'feelslike_f'};;
$conditionsKey = $currentObservation->{'icon'};
$iconClass = getWeatherElements($conditionsKey);
$lastUpdated = $currentObservation->{'observation_time'};

$previewArray = array();
$forecastIcons = array();

foreach($forcasts as $period) {
    $title = $period->{'title'};
    $icon = $period->{'icon'};
    if(!stristr($title,'night')) {
         $daytime = TRUE;
    } else {
        $daytime = FALSE;
    }

    $iconClean = getWeatherElements($icon,$daytime);
    array_push($previewArray, $title);
    array_push($forecastIcons, $iconClean);
}
$forecastTemps = array();
foreach($simpleForcasts as $period) {
    $high = $period->{'high'}->{'fahrenheit'};
    $low = $period->{'low'}->{'fahrenheit'};
    //if the first forecast is an evening value

    if(!stristr($previewArray[0],'night')) {
         array_push($forecastTemps,$high,$low);
    } else {
        array_push($forecastTemps,$low,$high);
    }
}

//var_dump($previewArray);
// var_dump($forcasts);

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
            color: orange;
            margin-bottom: -.25em;
        }
        .weather p {
            font-size: 4rem;
            margin: 0;
            color: white;
            text-align: center;
        }
        .wlabel {
            text-align: center;
            padding-top: -15%;
            margin:0;
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
            color: rgb(204, 204, 204);
        }
        .icon-moon,
        .icon-night {
            color: white;
        }

        footer p {
            float: right;
            bottom: 0;
            margin: 8em 3em 0 0;
            color: #d7d7d7;
        }
        .hot {
            color: #ed9128;
        }
        .cold {
            color: #28b3ed;
        }

        </style>
        <script>

        // var date = "Date: " + <?php print $todayString; ?>;
        // var fileOut = "File output: \"" + <?php print $newUseString; ?> + "\"";
        var queryCount = "Daily Query Count: " + <?php print $queryCount; ?> ;
        var serverResponse = <?php print $jsonForcast;?>;
        var conditionResponse = <?php print $jsonConditions; ?>;
        var currentCondition = "<?php print $conditionsKey; ?>";
        console.log(serverResponse);
        console.log(conditionResponse);
        console.log(currentCondition);
        console.log(queryCount);
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
        </div>
        <div class="preview first">
            <h3><?php print $previewArray[0]; ?></h3>
            <?php print $forecastIcons[0]; ?>
            <?php print applyColor($forecastTemps[0]); ?>
        </div>
        <div class="preview second">
             <h3><?php print $previewArray[1];  ?></h3>
             <?php print $forecastIcons[1]; ?>
             <?php print applyColor($forecastTemps[1]); ?>
        </div>
        <div class="preview third">
            <h3><?php print $previewArray[2];  ?></h3>
                <?php print $forecastIcons[2]; ?>
                <?php print applyColor($forecastTemps[2]); ?>
        </div>
        <div class="preview fourth">
             <h3><?php print $previewArray[3];  ?></h3>
             <?php print $forecastIcons[3]; ?>
             <?php print applyColor($forecastTemps[3]); ?>
        </div>

    </body>
    <footer>
        <p><?php print $lastUpdated?></p>
    </footer>
</html>
