var IW = {}; //global object

//model for the children in the carousel
IW.RChild = function (domElement,queuePosition,parent) {
    //just copy and declare values, no calculation
    this.domElement = domElement;
    this.parent = parent;
    this.positionInQueue = queuePosition;
    this.css;
}

//function to set positions 
IW.RChild.prototype.setPositioning = function (transformObject,position) {
    var transformString; //to store the inline css adjustments as css transforms
    
    //just concatenante string and set values, no calculation
    transformString = "rotate(" + transformObject.rot + "deg)" + 
        "translate(-" + transformObject.xTrans + "px," + 
        transformObject.yTrans + "px)";
    this.css = transformObject;
    this.positionInQueue = position;
    $(this.domElement).css({
        "position"          : "absolute",
        "top"               : transformObject.y,
        "left"              : transformObject.x,
        "z-index"           : transformObject.zIndex,
        "-webkit-transform" : transformString,
        "transform"         : transformString
    });
}

//a carousel object
IW.RadialCarousel = function (radius,jQDomContainer) {
    var offset = $(jQDomContainer).offset();
    this.radius = radius;
    this.domElement = jQDomContainer;
    this.children = [];
    this.valueMap = {};
    this.valueMap.zIndex = [];
    this.valueMap.angAnc = [];
    this.currentStart = 0; //is this internal or external?
    this.currentAngle = 0; //This should just be set to whatever value is passed to setAngle when isRotating is false.
    this.liveAngle;//leave undefined.
    this.center = {
        x: offset.left + radius,
        y: offset.top + radius
    };
    this.intCenter = {
        x: $(jQDomContainer).width() / 2, //this is fine for width, but what about height!?
        y: radius + 20
    }
    //we should make sure we are drawing relative to the center of the container.

    var domChildren = jQDomContainer.children();
    var zIndexMax = Math.ceil(domChildren.length / 2);
    //just check that it's not even, or we could have problems.
    if ((zIndexMax % 2) === 0) {
        zIndexMax++;
    }
    var decrease = true;
    var thisZIndex = zIndexMax;
    var angStart = 100;
    var swipe = 180 / domChildren.length;
    //loop to make our valueMap and our slide objects
    for (var i = 0; i < domChildren.length; i++) {
        this.valueMap.zIndex.push(thisZIndex);
        this.valueMap.angAnc.push(angStart);
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
        angStart += swipe;
        if (angStart != 180) {
            angStart = angStart % 180;
        }
     }
    this.itemCount = this.children.length;
    this.setAngle(0); //initialize with 0 initial angle
}
/**
 * A function that controls the angle setting on the carousel
 * @param an angle in degrees. Positive or negative,
 * based on -90 -> 90 coord system between 9 & 3 oclock
 * @return Nothing, sets rotation on carousel.
 */
IW.RadialCarousel.prototype.setAngle = function (inputDegAngle,isRelative) {
    //do a check on if we just started rotating and record the angle?
    //if the check checks out, we actually shouldn't request an angle change.

    var that = this; //let's allow the inner functions to see "this"

    //prevents values that are not 0 <= x < 360
    function limitAngle(rawAngle) {
        var angle = rawAngle % 360;
            if (angle < 0) {
                angle = angle + 360;
            }
            //OPTIONAL CONSTRAIN TO HALF
            angle = angle % 180;
        return angle;
    }
    //only positive numbers reach this. -10 becomes 170, and so on.
    function calcFirst(adjAngle) {
        var returnObj = {};
        var childCount = that.children.length;
        adjAngle = (adjAngle + 10) % ( 360 / 2 );
        var angleRange = (360 / (childCount * 2));
        var offset = -(adjAngle % angleRange);
        var startIndex = Math.floor(adjAngle / angleRange);
        returnObj = {
            "swipe": angleRange,
            "start": startIndex,
            "offset": offset
        } 
        return returnObj;
    }
    function getRotationInfo(angle) {
        var rotAngle, //rotation value in degrees to align with circumference
            radAngle, //angle as radians
            xVal, //calculated x position for current angle on circumference
            yVal, //calculated y position for current angle on circumference
            results; //returnable results.
        rotAngle = 90 - angle;    
        radAngle = (angle * Math.PI) / 180;
        xVal = that.intCenter.x + (that.radius * Math.cos(radAngle));
        yVal = that.intCenter.y - (that.radius * Math.sin(radAngle));
        results = {
            "x"   : xVal,
            "y"   : yVal,
            "rot" : rotAngle
        };
        return results;
    }
    //calculates positioning and sets them on all children
    function calcPos(startIndex,swipe,offset) {
        var currentElement = startIndex;
        for (var i = 0; i< that.children.length; i++) {
            var currentZIndex = that.valueMap.zIndex[i];
            var currentAnchorAngle = that.valueMap.angAnc[i];
            var rotationInfo = getRotationInfo(currentAnchorAngle + offset);
            var domElement = that.children[currentElement].domElement;
            var currentWidthAdj = (($(domElement).width() / 2) + 16);
            var cssValues = {
                "x"      : rotationInfo.x,
                "y"      : rotationInfo.y,
                "rot"    : rotationInfo.rot,
                "zIndex" : currentZIndex,
                "xTrans" : currentWidthAdj,
                "yTrans" : 0
            }
            that.children[currentElement].setPositioning(cssValues,i);
            currentElement = (currentElement + 1) % that.children.length;
        }
    } 

    //does this make sense??? Have to think about this more.
    /*

    Let's just think about this for a minute. 

    When we are rotating the carousel when it's already been set, we click the mouse, drag, and are now passing in an angle into the carousel
    If the first time we mousedown we can make a different observation (that we're now dragging)
    we can stop interpreting the angle literally and can instead use this first angle as a starting point. 
    This initial angle becomes 0 rotation, if we don't rotate at all from here, we shouldn't. Now we need coluto measure offset against this first point
    We rotate the angle of the slider by adding this offset against the "current rotation".

    To do this the primary requirement is: grabbing and saving the first requested angle.

    We need a better way to record the current position. Maybe the final position should always be called on mouseup? On mousedown we are only going to rotate based on a relative angle.

    When we start rotating, we'll change a variable
    We also need a conversion function to go from -90 0 90 position system to regular 0 - 180 position system.
    I think we already have one but it's in another function.
    */

    // if (that.isRotating) { //different behavior if we are dragging.
    //     //we need to just determine where we are starting.
    //     var tempOffset = that.currentAngle - that.offsetRotation;
    //     inputDegAngle = inputDegAngle - tempOffset;
    // } else {
    //     that.currentAngle = angle;
    // }

    //this is not ok, messes up initialization.
    var angle = limitAngle(inputDegAngle);

    //probably rotate by relative angle should handle this crap.
    // if (!that.relativeAngle) {
    //     that.relativeAngle = angle;
    //     that.currentAngle = that.liveAngle;
    //     //we need to have the currentAngle set before we reach this point.
    // } else {

    //     if (that.isRotating !== false) {
    //         //if we are rotating, let's actually reset our angle to something else
    //         angle = limitAngle(that.currentAngle + (that.relativeAngle + angle));
    //         console.log(angle);
    //     } else {
            that.liveAngle = angle; //we already did this at the end?
            //how do we update this when we're done doing the first rotation?
            var returnObj = calcFirst(angle);
            calcPos(returnObj.start,returnObj.swipe,returnObj.offset);
            that.liveAngle = angle;
        // }
    // }
}


//should the carousel itself keep track of if it's being rotated? Or should it be stored somewhere else?
//An elegant solution (I think) is to toggle a state on the carousel the first time it is being rotated that records its current position
//then until the deactivation method is called (or a variable is changed, whatever), the setting of angles behaves differently.
//then the code below could actually be perfect.

    //a function to convert coordinates to relative angles for insert into setAngle function.
    IW.RadialCarousel.prototype.convertCoordToAngle = function (xPos,yPos) {
        var that = this;
        var rawAngle = calculateTanAngle(xPos,yPos);
        var quad = getQuadrant(xPos,yPos);
        var adjAngle = adjTanAngle(rawAngle,quad);

        return adjAngle;

        function getQuadrant(xPos,yPos) {
            var quad = -1;
            if (xPos >= that.center.x) {
                //quadrants 1 or 2
                if (yPos >= that.center.y) {
                    quad = 2;
                } else {
                    quad = 1;
                }
            } else {
                if (yPos >= that.center.y) {
                    quad = 3;
                } else {
                    quad = 4;
                }
            }
            return quad;
        }
        function calculateTanAngle(xPos,yPos) {
            var deltaX = xPos - that.center.x;
            var deltaY = yPos - that.center.y;
            var rawAngle = Math.atan(deltaY/deltaX) * (180/Math.PI);
            return rawAngle;
        }
        function adjTanAngle(angle,quadrant) {
            if (quadrant === 1 || quadrant === 2) {
                adjAngle = 90 + rawAngle;
            } else {
                adjAngle = 270 + rawAngle;
            }
            return adjAngle;
        }
    }

    IW.RadialCarousel.prototype.rotateByRelativeAngle = function (xPos,yPos) {
        var adjAngle, //the current angle
            refAngle, //the last angle we stopped at
            displacement, //drag start - current position
            reqAngle;//angle to request for positioning
        if (!this.currentStart) {
            //record our drag start
            this.currentStart = this.convertCoordToAngle(xPos,yPos);
        }
        var adjAngle = this.convertCoordToAngle(xPos,yPos);
        var refAngle = this.lastReqAngle;
        var displacement = adjAngle - this.currentStart;
        var reqAngle = refAngle + displacement;
        this.setAngle(reqAngle);
    }

    IW.RadialCarousel.prototype.startRotating = function () {
        this.isRotating = true;
        this.lastReqAngle = this.liveAngle;
    }
    IW.RadialCarousel.prototype.stopRotating = function () {
        this.isRotating = false;
        this.currentStart = null;
        //do we really not need to do anything else here?
    }

/**EVENT HANDLERS**/
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
    $(".art").click(function (e) {
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

    $(".web-region ul li").mousedown(function () {
        $(document).mousemove( function (e){
            //only execute after first mousemove
            if (!carouselTest.isRotating) {
                carouselTest.startRotating();
                console.log("Starting to rotate");
            }
            setTimeout(function () {
                var xPos = e.pageX;
                var yPos = e.pageY;
                //this references the dragstart we've already set.
                carouselTest.rotateByRelativeAngle(xPos,yPos);
            },17);
        });
    });
    //here's a listener on mouseup. It needs to do two things:
    // 1. Turn off dragging / mousemove detection
    // 2. Record where we stopped.
    $(document).mouseup(function (e) {
        console.log("Mouseup!");
        if (carouselTest.isRotating) {
            $(document).off("mousemove");
            carouselTest.stopRotating();
            //we don't need to pass a value here, though we could.
            //rather, the offset should be reset, and transferred into the actual value for the angle.
        }
    });

    var carouselTest;
    $(document).ready(function () {
        IW.currentWinWidth = $(window).width();
        if (IW.currentWinWidth > 960) {
            IW.currentWinWidth = 960;
        } else {
            IW.currentWinWidth = IW.currentWinWidth - 200;
        }
        var radius = ((IW.currentWinWidth) / 2);
        $(".web-region ul").css({
            width: IW.currentWinWidth,
            height: radius / 2
        });
        var jQObject = $(".web-region ul");

        carouselTest = new IW.RadialCarousel(radius,jQObject);
        $("body").append("<div class='center-target'></div>");

        $(".center-target").css({
            position: "absolute",
            left: carouselTest.center.x,
            top: carouselTest.center.y,
            width: "4px",
            height: "4px",
            "border-radius":"4px",
            "background-color": "red",
            "z-index": 1000
        });
        
    });