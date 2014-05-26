var W4170 = {};

var _isDown, _points, _r, _g, _rc;
		$(document).ready(function() {
			_points = new Array();
			_r = new DollarRecognizer();
			// console.log(_r);

			var canvas = document.getElementById('myCanvas');
			_g = canvas.getContext('2d');
			_g.strokeStyle = "rgb(0,0,225)";
			_g.lineWidth = 3;
			_g.font = "16px Gentilis";
			_rc = getCanvasRect(canvas); // canvas rect on page
			_g.fillRect(0, 0, _rc.width, 20);

			_isDown = false;
			W4170.videoSize = 100;
			$("body").mousedown(function(e) {
				// console.log("mosuemove!");
				mouseDownEvent(e.clientX, e.clientY);
			});
			$("body").mouseup(function(e) {
				// console.log("mosueup!");
				var action = mouseUpEvent(e.clientX, e.clientY);
				if (action !== false) {
					console.log(action);
					W4170.controlVideo(action);
				} else {
					//we're dealing with a click.
					var video = document.getElementsByTagName("video");
					video = video[0];
					if ( (!video.paused) && (!video.ended) ) {
						video.pause();
						W4170.statusMessage("Pause");
					} else {
						video.play();
						W4170.statusMessage("Play");
					}
				}
			});
			$("body").mousemove(function(e) {
				mouseMoveEvent(e.clientX, e.clientY);
			});
			$(".exit-help").click(function() {
				$('.help-overlay').animate(
					{opacity:0},
					{duration:250, 
					 complete:function() {
						$(this).css({'z-index':-1});
					}}
				);
			});
			$(".status-contain .get-help").click(function() {
				$('.help-overlay').css({'z-index':1000}).animate({opacity:1},250);
			});
		});
		W4170.statusMessage = function(message) {
			var duration = 800;
			$(".status-contain h3").html(message);
			$(".status-contain").css({'z-index':5}).animate({opacity:1},{duration:800,complete:hide});

			function hide(){
				if (W4170.messageShow === true) {
					window.clearTimeout(W4170.pendingAnimation);
				} else {
					W4170.messageShow = true;
				}
				W4170.pendingAnimation = setTimeout(function() {
				$(".status-contain").animate({opacity:0},{duration:800,complete:function() {
					$(this).css({'z-index':'-1'});
					W4170.messageShow = false;
				}});
				}, 2000);
			}
		}
		W4170.controlVideo = function (action) {
			var adjString, positionVal;
			var video = document.getElementsByTagName("video");
			video = video[0];

			if (action.name === "line") {
				switch (action.endX) {
					case "+x":
						console.log("skip forward");
						video.currentTime += 10;
						W4170.statusMessage(Math.round(video.currentTime) + " seconds");
						break;
					case "-x":
						console.log("skip backward");
						video.currentTime -= 10;
						W4170.statusMessage(Math.round(video.currentTime) + " seconds");
						break;
					case "+y":
						console.log("volume up");
						if(video.volume !== 1) {
							video.volume += 0.1;
							W4170.statusMessage("Volume: " + Math.round(video.volume * 100) + "%");
						} else {
							W4170.statusMessage("Volume already at maximum.")
						}
						break;
					case "-y":
						console.log("volume down");
						if (video.volumes !== 0) {
							video.volume-= 0.1;
							W4170.statusMessage("Volume: " + Math.round(video.volume * 100) + "%");
						} else {
							W4170.statusMessage("Volume already at minimum.")
						}
				}
			} else {
				switch (action.name) {
					case "play":
						video.play();
						W4170.statusMessage("Play");
						break;
					case "pause":
						video.pause();
						W4170.statusMessage("Pause")
						break;
					case "mute":
						if (action.score > 0.84) {
							video.volume = 0;
							W4170.statusMessage("Muted");
						} else {
							video.playbackRate -= 0.5;
							W4170.statusMessage("Playback speed: " + video.playbackRate + "x");
						}
						break;
					case "increase speed":
						video.playbackRate += 0.5;
						W4170.statusMessage("Playback speed: " + video.playbackRate + "x");
						break;
					case "decrease speed":
						video.playbackRate -= 0.5;
						W4170.statusMessage("Playback speed: " + video.playbackRate + "x");
						break;
					case "size up":
						if (W4170.videoSize < 100) {
							W4170.videoSize += 10;
							positionVal = Math.round((100 - W4170.videoSize) / 2) + "%";;
							adjString = Math.round(W4170.videoSize) + "%";
							$(video).animate({width: adjString, left: positionVal}, 200);
							W4170.statusMessage("Video size: " + W4170.videoSize + "%");
						} else {
							W4170.statusMessage("Video size already at maximum.");
						}
						break;
					case "size down":
						if (W4170.videoSize > 10) {
							W4170.videoSize -= 10;
							positionVal = Math.round((100 - W4170.videoSize) / 2) + "%";
							adjString = Math.round(W4170.videoSize) + "%";
							$(video).animate({width: adjString, left: positionVal}, 200);
							W4170.statusMessage("Video size: " + W4170.videoSize + "%");
						} else {
							W4170.statusMessage("Video size already at minimum.");
						}
						break;
					case "volume full":
						video.volume = 1;
						W4170.statusMessage("Volume: 100%");
						break;

				}
			}
		}
		W4170.getLineDirection = function (points) {

			function determineDirection() {
				if (xVariation > yVariation) {//we're moving in x.
					if (xDisplacement > 0) {
						return "+x";
					} else {
						return "-x";
					}
				} else { //we're moving in y.
					if (yDisplacement > 0) {
						return "+y";
					} else {
						return "-y";
					}
				}
			}
			var xVariation = 0;
			var yVariation = 0;
			var returnObj;
			for (var i = 0; i < points.length -1; i++) {
				var j = i+1;
				var xStart = points[i].X;
				var yStart = points[i].Y;
				var xEnd = points[j].X;
				var yEnd = points[j].Y;

				xVariation += Math.abs(xStart - xEnd);
				yVariation += Math.abs(yStart - yEnd);
			}
			xStart = points[0].X;
			yStart = points[0].Y;
			xEnd = points[points.length - 1].X;
			yEnd = points[points.length - 1].Y;
			var xDisplacement = xEnd - xStart;
			var yDisplacement = yStart - yEnd; //we reverse these just because the coordinate system is reversed for y. 
			// console.log("xVar: " + xVariation +  ", yVar: " + yVariation);
			// console.log("xDis: " + xDisplacement + ", yDis: " + yDisplacement);

			var docWidth = $(document).width();
			var docHeight = $(document).height();

			if ((xVariation < docWidth/10) || (yVariation < docHeight/10)) { //we're now dealing with a line
				//let's check the direction.
				return determineDirection();
			} else {
				var direction = determineDirection();
				return {'isLine': false, 'direction': direction};
			}

		}
		function getCanvasRect(canvas)
		{
			var w = canvas.width;
			var h = canvas.height;

			var cx = canvas.offsetLeft;
			var cy = canvas.offsetTop;
			while (canvas.offsetParent != null)
			{
				canvas = canvas.offsetParent;
				cx += canvas.offsetLeft;
				cy += canvas.offsetTop;
			}
			return {x: cx, y: cy, width: w, height: h};
		}
		function getScrollY()
		{
			var scrollY = 0;
			if (typeof(document.body.parentElement) != 'undefined')
			{
				scrollY = document.body.parentElement.scrollTop; // IE
			}
			else if (typeof(window.pageYOffset) != 'undefined')
			{
				scrollY = window.pageYOffset; // FF
			}
			return scrollY;
		}
		//
		// Mouse Events
		//
		function mouseDownEvent(x, y)
		{
			document.onselectstart = function() { return false; } // disable drag-select
			document.onmousedown = function() { return false; } // disable drag-select
			_isDown = true;
			x -= _rc.x;
			y -= _rc.y - getScrollY();
			if (_points.length > 0)
				_g.clearRect(0, 0, _rc.width, _rc.height);
			_points.length = 1; // clear
			_points[0] = new Point(x, y);
			// console.log("Recording unistroke...");
			_g.fillRect(x - 4, y - 3, 9, 9);
		}
		function mouseMoveEvent(x, y)
		{
			if (_isDown)
			{
				x -= _rc.x;
				y -= _rc.y - getScrollY();
				_points[_points.length] = new Point(x, y); // append
				drawConnectedPoint(_points.length - 2, _points.length - 1);
			}
		}
		function mouseUpEvent(x, y)
		{
			document.onselectstart = function() { return true; } // enable drag-select
			document.onmousedown = function() { return true; } // enable drag-select
			if (_isDown)
			{
				_isDown = false;
				if (_points.length >= 10)
				{
					var resultObj;
					// console.log(_points);
					//if we think it's a line, we won't even run gesture recognizer. OH SNAP.
					var lineCheck = W4170.getLineDirection(_points);
					if (lineCheck.isLine === false) {
						var result = _r.Recognize(_points, false);
						console.log(result);
						resultObj = {
									 'name': result.Name,
									 'endX': _points[_points.length-1].X ,
									 'direction': lineCheck.direction,
									 'score' : result.Score
									};
					} else {
						// console.log(lineCheck);
						resultObj = {
							'name': 'line',
							'endX': lineCheck
						};
					}
					return resultObj;
				}
				else // fewer than 10 points were inputted
				{
					// console.log("Too few points made. Please try again.");
					return false;
				}
			}
		}
		function drawConnectedPoint(from, to)
		{
			_g.beginPath();
			_g.moveTo(_points[from].X, _points[from].Y);
			_g.lineTo(_points[to].X, _points[to].Y);
			_g.closePath();
			_g.stroke();
		}
		function round(n, d) // round 'n' to 'd' decimals
		{
			d = Math.pow(10, d);
			return Math.round(n * d) / d
		}
