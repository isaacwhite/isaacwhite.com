var IW = {};

var IW = {animating: false};
IW.animationID;
IW.animationRotation;
IW.dragging;
IW.carouselCenter;
IW.cardDimensions;

//this should be more elegant.
//model a carousel object itself?!
//contain carousel within object

IW.RChild = function(domElement,queuePosition,cssProperties) {
    this.domObj = domElement;
    this.positionInQueue = queuePosition;
    this.css = cssProperties;
}

IW.RChild.prototype.setPosition = function(transformObject) {

}

IW.RadialCarousel = function(center,radius,jQDomContainer) {
    this.center = center;
    this.radius = radius;
    //expecting a jQuery object for jQuery methods.
    this.domElement = jQDomContainer;
    this.children = [];
    this.zIndexMap = [];
    var domChildren = jQDomContainer.children();
    var zIndexMax = Math.ceil(domChildren.length / 2);
    //just check that it's not even, or we could have problems.
    if ((zIndexMax % 2) === 0) {
        zIndexMax++;
    }
    var decrease = true;
    var thisZIndex = zIndexMax;
    //loop to make out zIndexMap and our slide objects
    for (var i = 0; i < domChildren.length; i++) {
        this.zIndexMap.push(thisZIndex);
        this.children.push(new IW.RChild(domChildren[i],i,null));
        if (decrease) {
            thisZIndex--;
        } else {
            thisZIndex++;
        }
        if (thisZIndex < 1) {
            thisZIndex = 1;//start from 1 again.
            decrease = false;
        }
     }
     this.itemCount = this.children.length;
    //initialize the list of children.
    this.setAngle(0); //initialize with 0 initial angle
}
/**
 * A function that controls the angle setting on the carousel
 * @param an angle in degrees. Positive or negative
 * @return Nothing, sets rotation on carousel.
 */
IW.RadialCarousel.prototype.setAngle = function(inputDegAngle) {
    var that = this; //lets allow the inner functions to see "this"
    //prevents values that are not 0 < x < 360
    var limitAngle = function(rawAngle) {
        var angle = rawAngle % 360;
            if (angle < 0) {
                angle = angle + 360;
            }
            //OPTIONAL CONSTRAIN TO HALF
            angle = angle % 180;
        return angle;
    }


    //we're now going to be passed one adjusted angle for the start positioning
    //we'll need to use this angle to set hte position of all the other
    //cards.
    var calculatePositioning = function(adjAngle) {
        var currentAngle;//to set the currentAngle for the children
            //more variables here?
        var angleRange = (360/(that.itemCount * 2));
        //we'll draw the first element from the adjAngle location
        //and then map the zIndexMap onto the elements by position counting from 270 -> 90
        var mapCalc = [];
        currentAngle = adjAngle;//guranteed less than 180.
        for (var i = 0; i < that.children.length; i++) {
            if ((currentAngle > 90) && (currentAngle < 270)) {
                currentAngle += 180;
            }
            mapCalc.push({"ang": currentAngle, "li": i});
            currentAngle += angleRange;
            currentAngle = currentAngle % 360;//prevent going past 360.
        }
    }

    // var angle = angleInDeg + 270;//correct for starting from 3 oclock position.
    // angle = limitAngle(angle);//constrain it to positive values less than 360.


    //  for (var i = 0; i < this.Children; i++) {
    //     //the first item always gets drawn starting from IW.animationRotation
    //     var angularPosition = (degRotation - 270) + (i * angleRange);
        
    //     //try to fix this.
    //     angularPosition = correctAngle(angularPosition);

    //     angularString += i + ": " + angularPosition + ", ";
    //     var indexCount, zIndexVal;
    //     var startPos = 0 - (angleRange / 2);
        

    //     zIndexMapping[i] = zIndexVal;
    // }
    var angle = limitAngle(inputDegAngle);
    calculatePositioning(angle);

}

IW.RadialCarousel.prototype.limitAngle = function(someAngle) {
    //will we need this?
    //we might not
}

IW.RadialCarousel.prototype.rotateByRelativeAngle = function(xPos,yPos) {
    var getQuadrant = function (xPos,yPos) {
        var quad = -1;
        if (xPos >= this.center.x) {
            //quadrants 1 or 2
            if (yPos >= this.center.y) {
                quad = 2;
            } else {
                quad = 1;
            }
        } else {
            //quadrants 3 or 4
            if (yPos >= this.center.y) {
                quad = 3;
            } else {
                quad = 4;
            }
        }

        return quad;
    }
    var calculateTanAngle = function (xPos,yPos) {
        var deltaX = xPos - this.center.x;
        var deltaY = yPos - this.center.y;
        var rawAngle = Math.atan(deltaY/deltaX) * (180/Math.PI);

        return rawAngle;
    }
    var adjTanAngle = function (angle,quadrant) {
        if (quadrant === 1 || quadrant === 2) {
            adjAngle = 90 + rawAngle;
        } else {
            adjAngle = 270 + rawAngle;
        }

        return adjAngle;
    }

    var rawAngle = calculateTanAngle(xPos,yPos,yCenter);
    var quad = getQuadrant(xPos,yPos);
    var adjAngle = adjTanAngle(rawAngle,quad);

    this.setAngle(adjAngle);

    //don't return anything.

}

IW.getAngle = function (xPos,yPos) {
    //references global variables for carousel center.
    //a private function
    var getQuadrant = function (xPos,yPos) {
        var quad = -1;
        if (xPos >= IW.carouselCenter.x) {
            //quadrants 1 or 2
            if (yPos >= IW.carouselCenter.y) {
                quad = 2;
            } else {
                quad = 1;
            }
        } else {
            //quadrants 3 or 4
            if (yPos >= IW.carouselCenter.y) {
                quad = 3;
            } else {
                quad = 4;
            }
        }

        return quad;
    }

    var calculateAngle = function (xStart,yStart,xEnd,yEnd) {
        var deltaX = xPos - xCenter;
        var deltaY = yPos - yCenter;
        var rawAngle = Math.atan(deltaY/deltaX) * (180/Math.PI);

        return rawAngle;
    }

    var constrainAngle = function (angle,quadrant) {
        if (quad === 1 || quad === 2) {
            adjAngle = 90 + rawAngle;
        } else {
            adjAngle = 270 + rawAngle;
        }

        return adjAngle;
    }


    /*FUNCTION BODY*/
    var xCenter = IW.carouselCenter.x;
    var yCenter = IW.carouselCenter.y;
    
    var rawAngle = calculateAngle(xPos,yPos,xCenter,yCenter);
    var quad = getQuadrant(xPos,yPos);
    var adjAngle = constrainAngle(quad,rawAngle);

    return adjAngle;

}

//this could have problems.
//We shouldn't correct percent requests, in fact, it's silly to allow input in this format.
//Let's just take in degrees and use the same correction function we've already written to fix it
//That would work.
IW.getCircularPositioning = function(percent, radiusPx, centerPos) {
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
//looks like this does not have a closing bracket!! Inspect!!
//WHOA!!! OUT OF CONTROL!
IW.setRotation = function (degRotation) {


    IW.degreeRotation = degRotation;//do we need this?
    //degree rotation is set ot whatever rotation we request for the slider on initial call.

    //correct rotation for clockwise positioning
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
            //constrain to positive values less than 360.
            angle = angle % 360;
            if (angle < 0) {
                angle = angle + 360;
            }
            
            return angle;

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
//wrapper function for animating to position? Really nothing to do with a mouse.
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
//AJAX
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

//this should show the code. If we need to do further processing on the code highlighting let's put it somewhere else.
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

//here's a listener for mousedown on a list item. it needs to do two things:
//1. Turn on dragging / mousemove
//2. Initiate a function to rotate the slider by angle of mouse
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


//here's a listener on mouseup. It needs to do two things:
// 1. Turn off dragging / mousemove detection
// 2. Record where we stopped.
$(document).mouseup(function() {
    console.log("Mouseup!");
    if (IW.dragging) {
        $(document).off("mousemove");
        IW.dragging = false;

        //IW.degreeRotation must be set somewhere else.
        IW.animationRotation = IW.degreeRotation;

        //this correction should happen somewhere else.
        //MAIN FUNCTION FOR ANGLE CORRECTION!!
        if (IW.degreeRotation >= 360) {
            IW.degreeRotation = IW.degreeRotation - 360;
        }
        console.log(IW.degreeRotation)
    }
});



//ignore this for now.
$(document).ready(function () {
    IW.currentWinWidth = $(window).width();
    IW.currentWinHeight = $(window).height();
    //make a carousel
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

    IW.setRotation(720); //0 should be the 12 oclock position here.
    
});