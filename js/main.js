var IW = {animating:false};
IW.animationID = undefined;
IW.animationRotation = 0;
IW.dragging = undefined;
IW.carouselCenter = undefined;


IW.getCircularPositioning = function(percent,radiusPx,centerPos) {
	percent = (IW.animationRotation + percent)%1 - .25;
	// console.log(percent);
	if (!(-.25 < percent && percent < .25)) {
		percent = percent - .5;
	}
	var radAngle = percent * 2 * Math.PI - (.5 * Math.PI);
	var xValue = radiusPx * Math.cos(radAngle) + radiusPx;
	var yValue = radiusPx * Math.sin(radAngle) + radiusPx + 20;
	var coord = {x:xValue,y:yValue};
	var rotAngle = percent * 360;

	var result = {loc:coord,rot:rotAngle};
	return result;
}

IW.setRotation = function(degRotation) {
	IW.animationRotation =+ degRotation/360;
	IW.degreeRotation = degRotation;
	var container = IW.carousel;
	var children = container.children();
	var itemCount = children.length;
	var radius = ((IW.currentWinWidth-200)/2);
	var centerX = IW.currentWinWidth/2;
	var centerY = (IW.currentWinHeight/2) + 20;
	var thisCenter = {x:centerX, y:centerY};
	IW.carouselCenter = thisCenter;
	var itemWidth = $(".web-region ul li").width();
	container.css({
		width: IW.currentWinWidth - 200,
		height: radius/2
	});
	for(var i = 0; i < children.length; i++){
		var itemNumber = i;
		var percent = itemNumber/(children.length * 2);
		var returnVal = IW.getCircularPositioning(percent,radius,thisCenter);
		var rotateString = "rotate(" + returnVal.rot + "deg)";
		var xPosition = returnVal.loc.x - itemWidth/2;
		var yPosition = returnVal.loc.y;
		$(children[i]).css({
			position:"absolute",
			left:xPosition,
			top: yPosition,
			transform: rotateString
		});
	}
}

IW.startAnimation = function() {
	var container = $(".web-region ul");
	var test = container.children();
	var itemCount = test.length;
	var radius = ((IW.currentWinWidth-200)/2);
	var centerX = IW.currentWinWidth/2;
	var centerY = IW.currentWinHeight/2;
	var thisCenter = {x:centerX, y:centerY};
	IW.carouselCenter = thisCenter;
	var itemWidth = $(".web-region ul li").width();
	console.log(itemWidth);
	container.css({
		width: IW.currentWinWidth - 200,
		height: radius/2
	});
	var id = setInterval(function(){
		for(var i = 0; i < test.length; i++){
			var itemNumber = i;
			var percent = itemNumber/(test.length * 2);
			var returnVal = IW.getCircularPositioning(percent,radius,thisCenter);
			// console.log(returnVal);
			var rotateString = "rotate(" + returnVal.rot + "deg)";
			var xPosition = returnVal.loc.x - itemWidth/2;
			var yPosition = returnVal.loc.y + 20;
			$(test[i]).css({
				position:"absolute",
				left:xPosition,
				top: yPosition,
				transform: rotateString
			});
		}
		IW.animationRotation += .003;
	},17);

	return id;	
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

$(".toggle-animation").click(function() {
	if(!IW.animating) {
		IW.animationID = IW.startAnimation();
		IW.animating = true;
	} else {
		clearInterval(IW.animationID);
		IW.animating = false;
	}
})

$(".web-region ul li").mousedown(function() {
	IW.dragging = true;
	$(document).mousemove(function(e){
		setTimeout(function() {
			var xPos = e.pageX;
			var yPos = e.pageY;
			IW.animateWithMouse(xPos,yPos);
			$(".print-region h2").html(IW.degreeRotation);
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

	container.css({
		width: IW.currentWinWidth - 200,
		height: radius/2
	});

	IW.setRotation(270);
	
});