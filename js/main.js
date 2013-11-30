var IW = {};

$(function() {
    $(document).on('click', '.view-page h3', function(e) { // Make your changes here
        var viewButton = $("#under-construction .view-page");
        $("#portfolio h1").after(viewButton);
        viewButton.find("h3").html("View my recent projects");
        $("#under-construction").hide('1s');
        e.preventDefault();
    });
    $(document).on('click', '#portfolio h3', function(e) {
        var viewButton = $("#portfolio .view-page");
        $(".content-contain").append(viewButton);
        viewButton.find("h3").html("View the old portfolio page");
        $("#under-construction").show('1s');
        e.preventDefault();
    })

});