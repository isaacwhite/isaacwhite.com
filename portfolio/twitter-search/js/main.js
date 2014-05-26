//global object for storage
var G4170 = {};

//model a tweet
G4170.Tweet = function (text,user,geocode,date) {
	this.text = text;
	this.user = user;
	this.geocode = geocode;
	this.date = new Date(date);
}

//tweet to html
G4170.Tweet.prototype.toHTML = function() {
	var options = {}; 
	var dateString = "";
	if (this.date.toDateString() !== G4170.currentDate.toDateString()) {
		options = {"year":"numeric",
					 "month":"short",
					 "day": "numeric"}
		dateString = this.date.toLocaleDateString("en-US",options);
	} else {
		options = {"formatMatcher":"basic" };
		dateString = this.date.toLocaleTimeString("en-US",options);
	}


	var outputString = "<div class='date-created'>" + dateString + "</div>"
	outputString += "<div class='content-area'><div class='user'>" + this.userHTML() + "</div>";
	outputString += "<div class='text-area'><p>" + this.text + "</p></div>";
	outputString += "<div class='tweet-foot'><div class='geo'>";
	if (this.geocode !== null) {
		outputString += this.geocode.coordinates[0] + "," + this.geocode.coordinates[1];
		outputString = "<div class='tweet'>" + outputString;
	} else {
		outputString = "<div class='tweet no-geo'>" + outputString;
	};

	outputString += "</div></div></div></div>";

	return outputString;
}
G4170.Tweet.prototype.userHTML = function () {
	var imagePath = this.user.profile_image_url;
	var userName = this.user.name;
	var screenName = this.user.screen_name;

	var returnText = "";
	returnText += "<img src='" + imagePath + "'><div class='user-info'>";
	returnText += "<h3>" + userName + "</h3><p>" + screenName + "</p></div>";

	return returnText;
}
//html for more button
G4170.moreButton = "<div class='more'><span>Show older tweets</span></div>";

//html for loading animation
G4170.loadingAnimation = "<img src='img/working.gif'>";
G4170.noResults = "<h4>Sorry, there are no results for that query</h4>";
G4170.errorText = "<h4>Sorry, there was an error. Please try again.</h4>";

//app information
G4170.values =  {
	consumer_key: "bVqnffzJMoGfGppYe4rV0Q",
	consumer_secret: "87FCBTsHDbrPDwd47vN02STL3ZjwH8q2dCjFJTV2c",
	access_token: "1927234692-IaONzicUimJBIORCjgWxSZj3JqafMS0KdgJ0g1V",
	access_token_secret: "DuanJb2HVT6A8BVQV4eyni7bkZLchNlJ03ARbmp1DfE"
};

//function for retreiving search results and appending to search area
G4170.getResults = function(client,options,geocodeQuery) {
	G4170.loading = 1;
	$(".more").hide();
	// console.log(options);
	$(".tweet").remove();
	$(".search-contain").append(G4170.loadingAnimation);
	// console.log(geocodeQuery);
	if(typeof geocodeQuery !== 'undefined') {
		client.__call(
			"geo_search",
			{query:geocodeQuery},
			function(reply) {
				// console.log(reply);

			if(reply.result.places.length !== 0) {
				var coordinates = reply.result.places[0].bounding_box.coordinates[0][0];
				console.log(coordinates);
				var lon = coordinates[0];
				var lat = coordinates[1];
				options.geocode = "" + lat + "," + lon + ",5mi";
			}
			G4170.performSearch(client,options);

		});
	} else {
		delete(options.geocode);
		G4170.performSearch(client,options);
	}
	
};

G4170.performSearch = function(client,options) {
	console.log(options);
	client.__call(
		"search/tweets",
		options,
			function(reply) {
				// console.log(reply);
				for(var i = 0; i<reply.statuses.length; i++) {
					var currentContent = reply.statuses[i].text;
					var thisUser = reply.statuses[i].user;
					var thisGeo = reply.statuses[i].geo;
					var thisDate = reply.statuses[i].created_at;

					var thisTweet = new G4170.Tweet(currentContent,thisUser,thisGeo,thisDate);
						$(".results-area").append(thisTweet.toHTML());

					if(i === reply.statuses.length-1) {
						G4170.lastid = reply.statuses[i].id;
					};

					G4170.loading = 0;
					$('.search-contain img').remove();
					
				};
				if(reply.statuses.length === 0) {
					$('.search-contain img').remove();
					G4170.loading = 0;
					$('.results-area').html(G4170.noResults);
				}
				if((reply.statuses.length === 50) && (G4170.firstSearch === 1)) {

					G4170.firstSearch = 0;
					$(".footer-container").append(G4170.moreButton).click(function() {
						if (G4170.loading === 0) {
							var searchIndex = G4170.searches.length-1;
							var search = G4170.searches[searchIndex];
							options.q = search;
							$('.tweet').remove();
							options.max_id = G4170.lastid;
							try {
								G4170.getResults(client, options);
								
							} catch(err) {
								console.warn(err);
								$('.search-contain img').remove();
								$('.results-area').html(G4170.errorText).append("<p>" + err.toString() + "</p>");
							}	
						} else {
							// console.log("extra click on search button");
						}
					});
				};
				if(reply.statuses.length < 50) {
					G4170.firstSearch = 1;
					$(".more").remove();
				} else {
					$(".more").show();
				}
		});
}

/**MAIN CODE RUN ON PAGE LOAD**/

$(function(){
	
	var client = new Codebird;
	  client.setConsumerKey(G4170.values.consumer_key, G4170.values.consumer_secret);
	  client.setToken(G4170.values.access_token, G4170.values.access_token_secret);
	
	G4170.searches = [];
	G4170.lastid = "not set";
	G4170.firstSearch = 1;
	G4170.currentDate = new Date();
	G4170.loading = 0;
	var options = {};
	

	$("#submit-button").click(function(e) {

		G4170.lastid = "not set";
		delete(options.max_id);
		$('.results-area h4').remove();
		if (G4170.loading === 0) {
			var search = $("#search-box").val();
			var searchString = search;
			console.log("Searching for " + search);
			var moreOptions = $('.more-options');
			if (moreOptions.hasClass("active")) {
				
				var startDate = $('#start-date');
				var endDate = $('#end-date');
				var location = $('#location');
				var addQuery = "";
				
				if(!(endDate.hasClass('empty'))) {
					var parsedEnd = "" + endDate.val().substr(6);
					parsedEnd += "-" + endDate.val().substr(0,5).replace("/","-");
					addQuery += " until:" + parsedEnd;
					// options.until = parsedEnd;
				}
				if(!(startDate.hasClass('empty'))) {
					var parsedStart = "" + startDate.val().substr(6);
					parsedStart += "-" + startDate.val().substr(0,5).replace("/","-");
					addQuery += " since:" + parsedStart;
					// options.since = parsedStart;
				}
				if(!(location.hasClass('empty'))) {
					var geocodeQuery = location.val();
					if(geocodeQuery === "") {
						geocodeQuery = undefined;
					}
				}

				search += addQuery;

			};//no else
			
			options.q = search;
			options.count = 50;

			// console.log(options);

			if (search === "") {
				$("#search-box").val("Please enter something to search");
			} else if (searchString === "Please enter something to search") {
				//do nothing
			} else {
				if (G4170.firstSearch === 0 ) {
					$('.tweet').remove();
				};
				try {
					G4170.getResults(client, options,geocodeQuery);
					G4170.searches.push(search);
					
				} catch(err) {
					console.warn(err);
					$('.search-contain img').remove();
					$('.results-area').html(G4170.errorText).append("<p>" + err.toString() + "</p>");

				}
			};
			
		} else {
			// console.log("extra click, still loading");
			
		}
		
		e.preventDefault();
	});

	$(".more-options h5.want-more").click(function() {
			var moreOptions = $(".more-options");
		if (!(moreOptions.hasClass("active")) ) {
				var datePickOptions = {
					onSelect: function() {
					$(this).removeClass("empty");
					}
				};
				moreOptions.addClass("active");
				$(this).text("Hide these options");

				$("#start-date").datepicker(datePickOptions).addClass("empty").val("Start date");
				$("#end-date").datepicker(datePickOptions).addClass("empty").val("End date");
				$("#location").addClass("empty").val("Search for a location").click(function() {
					$(this).val("").removeClass("empty");
				});
			} else {
				moreOptions.removeClass("active");
				$(this).text("Want more options?");
				$("#start-date").addClass("empty").val("");
				$("#end-date").addClass("empty").val("");
				$("#location").addClass("empty").val("");
			};
		});

		$("h5.search-history").click(function() {
			if (G4170.searches.length !== 0 ) {

				$('div.more-options').append("<div class='searches'><h3>Want to search for something again?</h3><ul></ul></div>").hover(function(){},
					function() {
						$("div.searches").remove();
					});

				for (var i = 0; i<G4170.searches.length; i++) {
					var thisSearch = $("<li>" + G4170.searches[i] + "</li>");
					thisSearch.click(function() {
						var search = $(this).text();
						$("#search-box").val(search);
						var options = {};
						options.q = search;
						options.count = 50;
						G4170.getResults(client,options);
						$("div.searches").remove();
					});
					$('div.more-options ul').append(thisSearch);
				};

			
			};
			//don't do anything if there isn't a history

		});

	});


