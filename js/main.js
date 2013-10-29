var IW = {animating: false};
IW.animationID = undefined;
IW.animationRotation = 0;
IW.dragging = undefined;
IW.carouselCenter = undefined;
IW.cardDimensions = undefined;

//function to calculate coordinates of element on circle
//simple enough, though not sure if it should be modeled as some kind of other obj
IW.getQuadrant = function(xPos,yPos) {
    if (xPos > IW.carouselCenter.x) {
        //quadrants 1 or 2
        if (yPos > IW.carouselCenter.y) {
            return 1;
        } else {
            return 2;
        }
    } else {
        //quadrants 3 or 4
        if (yPos > IW.carouselCenter.y) {
            return 4;
        } else {
            return 3;
        }
    }
}

//this is good.
IW.getAngle = function(xPos,yPos) {
    //a private function
    var getQuadrant = function(xPos,yPos) {
        if (xPos >= IW.carouselCenter.x) {
            //quadrants 1 or 2
            if (yPos >= IW.carouselCenter.y) {
                return 2;
            } else {
                return 1;
            }
        } else {
            //quadrants 3 or 4
            if (yPos >= IW.carouselCenter.y) {
                return 3;
            } else {
                return 4;
            }
        }
    }

    var quad = getQuadrant(xPos,yPos);
    var xCenter = IW.carouselCenter.x;
    var yCenter = IW.carouselCenter.y;
    var deltaX = xPos - xCenter;
    var deltaY = yPos - yCenter;
    var rawAngle = Math.atan(deltaY/deltaX) * (180/Math.PI);
    var adjAngle;

    if (quad === 1 || quad === 2) {
        adjAngle = 90 + rawAngle;
    } else {
        adjAngle = 270 + rawAngle;
    }

    return adjAngle;

}
//this could have problems.
IW.getCircularPositioning = function (percent, radiusPx, centerPos) {
    "use strict";
    //rotate so that the first element starts at the 12 oclock position
    percent = percent % 1 - 0.25;
    //make sure all elements are between 9 and 3, or shift if necessary
    if (!(-0.25 < percent && percent < 0.25)) {
        if (percent < -0.25) {
            percent += 0.5;
        } else {
            percent -= - 0.5;
        }
    }
    if (percent < - 0.25) {
        console.log("error! percent is " + percent);
    }

    //some preliminary calculations
    var radAngle = percent * 2 * Math.PI - (0.5 * Math.PI);
    var degAngle = radAngle * 180 / Math.PI;
    var yOffset = IW.cardDimensions.h / 2;
    var xOffset = IW.cardDimensions.w / 2;
    var xValue = centerPos.x + (radiusPx * Math.cos(radAngle));
    var yValue = centerPos.y + (radiusPx * Math.sin(radAngle)) + 20;
    var coord = {x:xValue,y:yValue};
    var rotAngle = percent * 360;
    var result = {loc:coord,rot:rotAngle};
    return result;
}

//this could also have problems
IW.setRotation = function (degRotation) {
    IW.degreeRotation = degRotation;
    //degree rotation is set ot whatever rotation we request for the slider on initial call.

    degRotation = degRotation + 270;
    if (degRotation >= 360) {
        degRotation = degRotation - 360;
    }

    var container = IW.carousel;
    var children = container.children();
    var itemCount = children.length;
    var radius = $(".web-region").width()/2;
    if (radius > 360) {
        radius = 360;
    }//no else;
    var offsetCheck = $(".web-region").offset();
    var centerX = radius;
    var centerY = radius;
    var plotCenter = {x:centerX,y:centerY};
    if (radius === 360) {
        centerX = $(window).width()/2;
    }//no else
    var thisCenter = {x:centerX, y:centerY};
    IW.carouselCenter = thisCenter;
    var itemWidth = $(".web-region ul li").width() + 32;
    var itemHeight = $(".web-region ul li").height();

    IW.cardDimensions = {h:itemHeight,w:itemWidth};

    container.css({
        width: IW.currentWinWidth - 200,
        height: radius/2
    });
    
   
    var itemCount = children.length;

    //we need to know the position of the 
    //first element to anticipate the angle values of each item
    var makeZIndexMap = function (itemCount) {
         //this is how many degrees to divide the circle by.
        var angleRange = 360 / (itemCount * 2);
        var zIndexMapping = [];
        var angularString = ""
        
        var correctAngle = function(angle) {
            
            if( (-90 > angle) || (angle > 90) ) {
                //we have to correct it.
                if (angle > 0) {
                    while (angle > 90) {
                        angle = angle - 180;
                    }
                } else {
                    while (angle < -90) {
                        angle = angle + 180;
                    }
                }
                return angle;
            } else {
                return angle;
            }
        }
        
        for (var i = 0; i < itemCount; i++) {
            //the first item always gets drawn starting from IW.animationRotation
            var angularPosition = (degRotation - 270) + (i * angleRange);
            
            //try to fix this.
            angularPosition = correctAngle(angularPosition);

            angularString += i + ": " + angularPosition + ", ";
            var indexCount, zIndexVal;
            var startPos = 0 - (angleRange / 2);
            if (angularPosition >= startPos) {
                //if positive, check the distance from 0 divided by angleRange
                indexCount = Math.floor(angularPosition/angleRange);
                zIndexVal = 100 - indexCount;
            } else {
                //if negative, check the distance from 0 divided by angleRange
                indexCount = Math.floor(angularPosition/angleRange);
                zIndexVal = 50 + indexCount;
            }

            zIndexMapping[i] = zIndexVal;
        }
        var htmlString = "";
        for (var i = 0; i < zIndexMapping.length; i++) {
            htmlString += i + ": " + zIndexMapping[i] + ", ";
        }
        $(".art-region h2").html(htmlString).css({"margin-top":"15rem"});
        $(".art-region h3").html(angularString);
        return zIndexMapping;

    }
    

    var zIndexMapping = makeZIndexMap(itemCount);

    for(var i = 0; i < itemCount; i++){
        var itemNumber = i;
        var percent = itemNumber/(children.length * 2) + degRotation/360;
        var returnVal = IW.getCircularPositioning(percent,radius,plotCenter);
        var rotateString = "rotate(" + returnVal.rot + "deg) translate(-" + 
            IW.cardDimensions.w/2 + "px)";
        var xPosition = returnVal.loc.x;
        var yPosition = returnVal.loc.y; 
        // console.log(returnVal.rot);
        var currentRotation = returnVal.rot;

        //we have to calculate the simulated position by determining how much 
        //space is used by each card
        //it's equal to angleRange
        //so we can say that for the length of children, (itemCount), we get 
        //to go from rotation 0, + angleRange, while currentRotation < 90
        //so we need to know how long children.length is, which in this case i
        //s 11, but we'll just use itemCount
        //lets count from z index 100
        //so whichever element is at rotation 0 gets z index 100, and then 
        //while currentRotation < 90 but greater than 0, we'll count up.
        //index 0 -> 100 //0
        //index 1 -> 99 //20
        //index 3 -> 98 //40
        //index 4 -> 97 //60
        //index 5 -> 96 //80
        //index 6 -> 0 //-80
        //index 7 -> 1 //-60
        //index 8 -> 2 //-40
        //index 9 -> 3 //-20



        $(children[i]).css({
            position:"absolute",
            left:xPosition,
            top: yPosition,
            transform: rotateString,
            "z-index": zIndexMapping[i]
        });
        
        // if (( 0 - angleRange / 2 ) < currentRotation && 
        //     currentRotation < ( angleRange/2 )) {

        //     // console.log(currentRotation);
        //     $(children[i]).css({
        //         "z-index":2
        //     });
        // }
    }
}

//could have problems.
IW.animateWithMouse = function (xPos,yPos) {

    
    var thisAngle = IW.getAngle(xPos,yPos);
    var startAngle = IW.getAngle(IW.dragStart.x,IW.dragStart.y);

    var dispAngle = thisAngle - startAngle;

    console.log(thisAngle);
    // console.log(angle);
    IW.setRotation(dispAngle + IW.animationRotation);
    //we have to take into account the position when it started...
}

//EVENT HANDLERS

$(".web").click( function (e) {
    window.history.pushState(null,null,"/portfolio/web")
     e.preventDefault();
    $.get("/portfolio/ajax/web.html")
     .done(function( data ) {
        $(".web-region").html(data);
     }, false);
});

$(".print").click( function (e) {
    window.history.pushState(null,null,"/portfolio/print")
     e.preventDefault();
    $.get("/portfolio/ajax/print.html")
     .done(function( data ) {
        $(".print-region").html(data);
     }, false);
    
});
$(".art").click(function(e) {
    window.history.pushState(null,null,"/portfolio/art")
     e.preventDefault();
    $.get("/portfolio/ajax/art.html")
     .done(function( data ) {
        $(".art-region").html(data);
     }, false);
});

$(".see-code").click( function (e) {
     e.preventDefault();
    $.get("/js/main.js")
     .done(function (data) {
        $(".code-view").html(data);
        prettyPrint();

        //let's get some better specificy on these operators.
        $(".pun").each( function () {
            var currentItem = $(this);
            var contents = currentItem.text();

            var operator = new RegExp(/(\=|\+|-|\*|\/|%)/);
            var notJustOperator = new RegExp(/^(\=|\+|-|\*|\/|%)/);
            var locInString = contents.search(operator);
            if (locInString !== -1) {
                if(contents.length !== 1 && contents.length !== 3) {
                    contents.split(locInString);
                    // console.log(contents);
                } else {
                // console.log(contents);
                currentItem.removeClass("pun").addClass("operator");
                }
            }

        });
     }, false);
});

$(".web-region ul li").mousedown(function() {
    $(document).mousemove( function (e){
        //only execute after first mousemove
        if (!IW.dragging) {
            IW.dragging = true;
            //get our start position for displacement measurements
            var xStart = e.pageX;
            var yStart = e.pageY;
            IW.dragStart = {x:xStart,y:yStart};
        }
        //now the normal checker
        setTimeout(function() {
            var xPos = e.pageX;
            var yPos = e.pageY;
            //this references the dragstart we've already set.
            IW.animateWithMouse(xPos,yPos);
            // $(".print-region h2").html(IW.carouselCenter.x + "," + 
            //     IW.carouselCenter.y);
        },17);
    });
});

$(document).mouseup(function() {
    console.log("Mouseup!");
    if (IW.dragging) {
        $(document).off("mousemove");
        IW.dragging = false;

        // set rotation.

        //vodoo magic!!
        // if (IW.degreeRotation < -90 || IW.degreeRotation > 90) {
        //     console.log("Out of bounds!");
        //     if (IW.degreeRotation < -90) {
        //         IW.degreeRotation += 90;
        //     }
        //     if (IW.degreeRotation > 90) {
        //         IW.degreeRotation -= 90;
        //     }
        // }
        IW.animationRotation = IW.degreeRotation;
        if (IW.degreeRotation >= 360) {
            IW.degreeRotation = IW.degreeRotation - 360;
        }
        console.log(IW.degreeRotation)
    }
});

IW.currentWinWidth = $(window).width();
IW.currentWinHeight = $(window).height();

$(document).ready(function () {
    IW.carousel = container = $(".web-region ul");
    var test = container.children();
    var itemCount = test.length;
    var radius = ((IW.currentWinWidth - 200) / 2);
    var centerX = IW.currentWinWidth / 2;
    var centerY = IW.currentWinHeight / 2;
    var thisCenter = {x:centerX, y:centerY};
    var itemWidth = $(".web-region ul li").width();

    if (IW.currentWinWidth > 720) {
        IW.currentWinWidth = 720;
    } else {
        IW.currentWinWidth = IW.currentWinWidth - 200;
    }

    $(".web-region").css({
        width: IW.currentWinWidth,
        height: radius / 2
    });

    IW.setRotation(0); //0 should be the 12 oclock position here.
    
});