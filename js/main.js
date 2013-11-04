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

IW.RChild = function(domElement,queuePosition,parent) {
    //initialize element
    this.domElement = domElement;
    this.parent = parent;
    this.positionInQueue = queuePosition;
    this.css;
}

IW.RChild.prototype.setPositioning = function(transformObject,position) {
    //this function should store the 

    var xPos = transformObject.x;
    var yPos = transformObject.y;
    var rotation = transformObject.rot;
    var xTranslate = transformObject.xTrans;
    var yTranslate = transformObject.yTrans;
    var zIndex = transformObject.zIndex;

    var transformString = "rotate(" + rotation + 
                          ") translate(" + xTranslate + "," + yTranslate +
                          ")";

    this.css = transformObject;
    this.positionInQueue = position;
    var domElement = this.domElement;
    $(domElement).css({
        "position" : "absolute",
        "top"      : yPos,
        "left"     : xPos,
        "z-index"  : zIndex,
        "transform": transformString
    })
    // var opacity = transformObject.opacity; we won't use this at first.
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
        this.children.push(new IW.RChild(domChildren[i],i,this));
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
    var that = this; //let's allow the inner functions to see "this"
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
    var calculateOrder = function(adjAngle) {
        var returnObj = {};
        var childCount = that.children.length;
        var angleRange = (360/(that.itemCount * 2));
        var startIndex = (Math.round(adjAngle / angleRange)) % childCount;
        //the element that is closest to center is startIndex
        returnObj.swipe = angleRange;
        returnObj.start = startIndex;
        
        return returnObj;
    }
    
    //this takes an angle betwee 0 and 180 degrees, so 
    var getRotationInfo = function(angle) {
        var rotAngle, //rotation value in degrees to align with circumference
            radAngle, //angle as radians
            trigAngle, //deg angle compatible with standard trig calcs
            xCenter, //x center of carousel
            yCenter, //y center of carousel
            radius, //radius of carousel
            xVal, //calculated x position for current angle on circumference
            yVal, //calculated y position for current angle on circumference
            results; //returnable results.
        if (angle <= 90) {
            trigAngle = 90 - angle;
            rotAngle = angle;
        } else {  //it must be bigger
            trigAngle = 90 + (180 - angle);
            rotAngle = 90 - angle;
        }
        radAngle = (trigAngle * Math.PI) / 180;
        xCenter = that.center.x;
        yCenter = that.center.y;
        radius = that.radius;
        //separate the values we're offsetting from by the location
        xVal = xCenter + (radius * Math.cos(radAngle));
        yVal = yCenter - (radius * Math.sin(radAngle));
        results = {
            "x"   : xVal,
            "y"   : yVal,
            "rot" : rotAngle
        };
        return results;
    }
    //calculates positioning and sets them on all children
    var calcPos = function(startIndex,adjAngle,swipe) {
        var offset = adjAngle % swipe;
        var currentAngle = adjAngle;
        var rotationInfo, //return value for a current rotation
            cssValues,
            domElement, //transform objects for child.
            currentWidth; //with of current item
        currentElement = startIndex;
        for (var i = 0; i< that.children.length; i++) {

            console.log(currentElement);
            currentZIndex = that.zIndexMap[i];
            //get the rotation information to apply to the elements
            rotationInfo = getRotationInfo(currentAngle);
            domElement = that.children[currentElement].domElement;
            currentWidth = $(domElement).width();

            cssValues = {
                "x"      : rotationInfo.x,
                "y"      : rotationInfo.y,
                "rot"    : rotationInfo.rot,
                "zIndex" : currentZIndex,
                //for now let's hard code the translation
                "xTrans" : currentWidth/2,
                "yTrans" : 0
            }
            that.children[currentElement].setPositioning(cssValues,i);
            //we have to do something with this now.
            //at the end of the loop, move to next element
            currentAngle = currentAngle + swipe;
            currentElement = (currentElement + 1) % that.children.length;
        }
        //currentElement should now be equal to startIndex again.
        //we'll use offset to calculate all other rotations.
    } 
    var angle = limitAngle(inputDegAngle);
    var returnObj = calculateOrder(angle);
    calcPos(returnObj.start,angle,returnObj.swipe);
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
    // $(document).mousemove( function (e){
    //     //only execute after first mousemove
    //     if (!IW.dragging) {
    //         IW.dragging = true;
    //         //get our start position for displacement measurements
    //         var xStart = e.pageX;
    //         var yStart = e.pageY;
    //         IW.dragStart = {x:xStart,y:yStart};
    //     }
    //     //now the normal checker
    //     setTimeout(function() {
    //         var xPos = e.pageX;
    //         var yPos = e.pageY;
    //         //this references the dragstart we've already set.
    //         IW.animateWithMouse(xPos,yPos);
    //         // $(".print-region h2").html(IW.carouselCenter.x + "," + 
    //         //     IW.carouselCenter.y);
    //     },17);
    // });
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
var carouselTest;
$(document).ready(function () {
    IW.currentWinWidth = $(window).width();
    IW.currentWinHeight = $(window).height();
    // //make a carousel
    // IW.carousel = container = $(".web-region ul");
    // var test = container.children();
    // var itemCount = test.length;
    var radius = ((IW.currentWinWidth - 200) / 2);
    var centerX = IW.currentWinWidth / 2;
    var centerY = IW.currentWinHeight / 2;
    var thisCenter = {x:centerX, y:centerY};
    // var itemWidth = $(".web-region ul li").width();

    if (IW.currentWinWidth > 720) {
        IW.currentWinWidth = 720;
    } else {
        IW.currentWinWidth = IW.currentWinWidth - 200;
    }

    $(".web-region").css({
        width: IW.currentWinWidth,
        height: radius / 2
    });
    var jQObject = $(".web-region ul");

    carouselTest = new IW.RadialCarousel(thisCenter,radius,jQObject);


    // IW.setRotation(720); //0 should be the 12 oclock position here.
    
});