var IW = {animating:false};
IW.animationID = undefined;
IW.animationRotation = undefined;
IW.dragging = undefined;
IW.carouselCenter = undefined;
IW.cardDimensions = undefined;


IW.getCircularPositioning = function(percent,radiusPx,centerPos) {
	percent = percent%1 - .25;
	// console.log(percent);
	if (!(-.25 < percent && percent < .25)) {
		percent = percent - .5;
	}
	var radAngle = percent * 2 * Math.PI - (.5 * Math.PI);

	// console.log("X offset: " + Math.cos(radAngle));
	// console.log("Y offset: " + Math.sin(radAngle));
	var degAngle = radAngle * 180/Math.PI;
	console.log("Angle as degrees:" + degAngle);
	var yOffset = IW.cardDimensions.h/2;
	var xOffset = IW.cardDimensions.w/2;

	// var xValue = (radiusPx * Math.cos(radAngle)) + radiusPx + (Math.sin(radAngle) * (width/2)) + (Math.cos(radAngle) * (height/2));
	// var yValue = (radiusPx * Math.sin(radAngle)) + radiusPx  - (Math.cos(radAngle) * (height/2)) + 20;

	// console.log()
	console.log(Math.cos(radAngle));
	console.log(Math.sin(radAngle));
	var xValue = centerPos.x + (radiusPx * Math.cos(radAngle));
	var yValue = centerPos.y + (radiusPx * Math.sin(radAngle)) + 20;
	var coord = {x:xValue,y:yValue};
	var rotAngle = percent * 360;
	// rotAngle = 0;

	var result = {loc:coord,rot:rotAngle};
	return result;
}

IW.setRotation = function(degRotation) {
	//if we haven't set a rotation yet, let's do this.
	// if (IW.animationRotation === undefined) {
	// 	IW.animationRotation = degRotation/360;
	// }
	IW.degreeRotation = degRotation;

	var container = IW.carousel;
	var children = container.children();
	var itemCount = children.length;
	var radius = $(".web-region").width()/2;
	var offsetCheck = $(".web-region").offset();
	var centerX = radius;
	var centerY = radius;
	var thisCenter = {x:centerX, y:centerY};
	IW.carouselCenter = thisCenter;
	var itemWidth = $(".web-region ul li").width();
	var itemHeight = $(".web-region ul li").height();

	IW.cardDimensions = {h:itemHeight,w:itemWidth};

	container.css({
		width: IW.currentWinWidth - 200,
		height: radius/2
	});
	

	for(var i = 0; i < children.length; i++){
		var itemNumber = i;
		var percent = itemNumber/(children.length * 2) + degRotation/360;
		var returnVal = IW.getCircularPositioning(percent,radius,thisCenter);
		var rotateString = "rotate(" + returnVal.rot + "deg) translate(-" + IW.cardDimensions.w/2 + "px)";
		var xPosition = returnVal.loc.x;
		var yPosition = returnVal.loc.y;
		var circle = $("<div class='circle'></div>").css({height:2,width:2,"border-radius":"9999px",border:"1px solid red",top:yPosition,left:xPosition});
		// $(".web-region ul").append(circle);
		console.log($(children[i]).text());
		// console.log("angle: " + percent);
		$(children[i]).css({
			position:"absolute",
			left:xPosition,
			top: yPosition,
			transform: rotateString
		});
	}
}

IW.animateWithMouse = function(xPos,yPos) {

	var xCenter = IW.carouselCenter.x;
	var yCenter = IW.carouselCenter.y;
	var deltaX = xPos - xCenter;
	var deltaY = yPos - yCenter;
	var angle = Math.atan(deltaY/deltaX) * (180/Math.PI);
	IW.setRotation(angle);
}

//EVENT HANDLERS

$(".web").click(function(e) {
	window.history.pushState(null,null,"/portfolio/web")
 	e.preventDefault();
	$.get("/portfolio/ajax/web.html")
	 .done(function( data ) {
	    $(".web-region").html(data);
	 }, false);
});

$(".print").click(function(e) {
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

$(".web-region ul li").mousedown(function() {
	IW.dragging = true;
	$(document).mousemove(function(e){
		setTimeout(function() {
			var xPos = e.pageX;
			var yPos = e.pageY;
			IW.animateWithMouse(xPos,yPos);
			$(".print-region h2").html(IW.carouselCenter.x + "," + IW.carouselCenter.y);
		},17);
	});
});

$(document).mouseup(function() {
	if (IW.dragging) {
		$(document).off("mousemove");
		IW.dragging = false;
	}
});

IW.currentWinWidth = $(window).width();
IW.currentWinHeight = $(window).height();

$(document).ready(function () {
	IW.carousel = container = $(".web-region ul");
	var test = container.children();
	var itemCount = test.length;
	var radius = ((IW.currentWinWidth-200)/2);
	var centerX = IW.currentWinWidth/2;
	var centerY = IW.currentWinHeight/2;
	var thisCenter = {x:centerX, y:centerY};
	var itemWidth = $(".web-region ul li").width();

	$(".web-region").css({
		width: IW.currentWinWidth - 200,
		height: radius/2
	});

	IW.setRotation(270);
	
});