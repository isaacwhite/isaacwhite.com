var IW = {};


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

