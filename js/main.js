var IW = {animating:false};
IW.animationID = undefined;
IW.animationRotation = 0;
IW.dragging = undefined;


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

IW.currentWinWidth = $(window).width();
IW.currentWinHeight = $(window).height();

IW.getCircularPositioning= function(percent,radiusPx,centerPos) {
	percent = (percent + IW.animationRotation)%1 - .25;
	if (.25 < percent && percent < .75) {
		percent = percent - .5;
	}
	var radAngle = percent * 2 * Math.PI - (.5 * Math.PI);
	var xValue = radiusPx * Math.cos(radAngle) + radiusPx;
	var yValue = radiusPx * Math.sin(radAngle) + radiusPx;
	var coord = {x:xValue,y:yValue};
	var rotAngle = percent * 360;

	var result = {loc:coord,rot:rotAngle};
	return result;
}

$(document).ready(function () {
	var container = $(".web-region ul");
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

	for(var i = 0; i < test.length; i++){
		var itemNumber = i;
		var percent = itemNumber/test.length;
		var returnVal = IW.getCircularPositioning(percent,radius,thisCenter,IW.animationRotation);
		var rotateString = "rotate(" + returnVal.rot + "deg)";
		var xPosition = returnVal.loc.x - itemWidth/2;
		$(test[i]).css({
			position:"absolute",
			left:xPosition,
			top:returnVal.loc.y,
			transform: rotateString
		});
	}
	
});
IW.setRotation = function(jqueryContainer) {
	var container = jqueryContainer;
	var chilren = container.children();
	var itemCount = test.length;
	var radius = ((IW.currentWinWidth-200)/2);
	container.css({
		width: IW.currentWinWidth - 200,
		height: radius/2
	});
}

IW.startAnimation = function() {
	var container = $(".web-region ul");
	var test = container.children();
	var itemCount = test.length;
	var radius = ((IW.currentWinWidth-200)/2);
	var centerX = IW.currentWinWidth/2;
	var centerY = IW.currentWinHeight/2;
	var thisCenter = {x:centerX, y:centerY};
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

IW.animateWithMouse = function() {
	$(document).mousemove(function(e){
		IW.animationID = setTimeout(function() {
			var xPos = e.pageX;
			var yPos = e.pageY;


		},17);
	});
}

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
	IW.animateWithMouse();
});

$(document).mouseup(function() {
	if (IW.dragging) {
		IW.dragging = false;
		clearInterval(IW.animationID);
		alert("Stopped dragging");
	}
});