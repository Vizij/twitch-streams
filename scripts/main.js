$(document).ready(function() {
	var $allButton = $("#allButton");
	var $onlineButton = $("#onlineButton");
	var $offlineButton = $("#offlineButton");
	var $defunctButton = $("#defunctButton");
	var $searchInput = $("#searchInput");
	var $searchButton = $("#searchButton");
	var $resultsBox = $("#resultsBox");
	
	var twitchArr = ["freecodecamp", "programming", "itshafu", "2mgovercsquared", "kittybearattacksquad", "manvsgame", "monstercat", "bobross", "brunofin", "comster404"];
	var trigger = "ON";
	var results = {
		online: "",
		offline: "",
		defunct: "",
		search: ""
	};
	
	// Part 1: Check for live streams in our array. Display these 'online' streamers first.
	$.ajax({
		method: "GET",
		dataType: "json",
		url: "https://api.twitch.tv/kraken/streams?channel=" + twitchArr.join(),
		headers: {
			"Accept": "application/vnd.twitchtv.v3+json",
			"Client-ID": "jszr5x97eijg8uj7do9axr1svtho7y4",
		},
		error: function(jqXHR, textStatus, errorThrown) {
			alert("Sorry, there was an error! " + textStatus + ": " + errorThrown);
		},
		success: function(data) {
			data.streams.forEach(function(stream) {
				buildResults(stream.channel.name, stream.channel.logo, stream.channel.display_name, stream.game, stream.channel.status, "online");
			});
			$resultsBox.html(results.online); // This is essential for Part 2 to work correctly.
			
			/* Part 2: Check each index in our array to see if the channel exists on the page via a
			unique class identifier. If not, perform an AJAX request for the channel data. If this
			request results in an error, the channel does not exist. */
			twitchArr.forEach(function(value) {
				if (!$("." + value).length) {
					$.ajax({
						method: "GET",
						dataType: "json",
						url: "https://api.twitch.tv/kraken/channels/" + value,
						headers: {
							"Accept": "application/vnd.twitchtv.v3+json",
							"Client-ID": "jszr5x97eijg8uj7do9axr1svtho7y4",
						},
						error: function() {
							buildResults(value, "images/twitch_logo.png", value, "", "", "defunct");
						},
						success: function(data) {
							buildResults(data.name, data.logo, data.display_name, data.game, data.status, "offline");
						}
					});
				}
			});
			
			/* Part 3: After the last AJAX request finishes, overwrite the page with all of the
			results. This only fires once to prevent interference with the search functionality. */
			$(document).ajaxStop(function() {
				if (trigger === "ON") {
					$resultsBox.html(results.online + results.offline + results.defunct);
					trigger = "OFF";
				}
			});
		}
	});
	
	setupTabs();
	setupSearch($searchInput, $searchButton, twitchChannels);
	
	function buildResults(channel, logo, title, game, description, state) {
		// Conditionals to handle null values
		if (!logo) {
			logo = "images/twitch_logo.png";
		}
		if (!game) {
			game = "";
		}
		if (!description) {
			description = "";
		}
		// Build a box
		var box = "";
		box += "<div class='row entry " + channel + "'>"; // Unique class identifier
		box += "<div class='col-xs-4'>";
		box += "<img class='img-responsive round-corners' src='" + logo + "'>";
		box += "</div>";
		box += "<div class='col-xs-8'>";
		box += "<a href='https://www.twitch.tv/" + channel + "' target='_blank'>" + title + "</a><br>" + game + "<br>" + description + "<br>" + "<span class='glyphicon glyphicon-off " + state + "' aria-hidden='true'></span> " + state;
		box += "</div></div>";
		// Add box to appropriate state container
		switch (state) {
			case "online":
				results.online += box;
				break;
			case "offline":
				results.offline += box;
				break;
			case "defunct":
				results.defunct += box;
				break;
			case "search":
				results.search += box;
		}
	}
	
	function setupTabs() {
		$allButton.click(function() {
			$resultsBox.html(results.online + results.offline + results.defunct);
		});
		$onlineButton.click(function() {
			$resultsBox.html(results.online);
		});
		$offlineButton.click(function() {
			$resultsBox.html(results.offline);
		});
		$defunctButton.click(function() {
			$resultsBox.html(results.defunct);
		});
	}
	
	function setupSearch(sInput, sButton, sFunction) {
		sInput.keyup(function(key) {
			if (key.which == 13) {
				sFunction();
			}
		});
		sButton.click(sFunction);
	}
	
	function twitchChannels() {
		$.ajax({
			method: "GET",
			dataType: "json",
			url: "https://api.twitch.tv/kraken/search/channels?q=" + $searchInput.val(),
			headers: {
				"Accept": "application/vnd.twitchtv.v3+json",
				"Client-ID": "jszr5x97eijg8uj7do9axr1svtho7y4",
			},
			error: function(jqXHR, textStatus, errorThrown) {
				alert("The search feature encountered an error. " + textStatus + ": " + errorThrown);
			},
			success: function(data) {
				results.search = "";
				data.channels.forEach(function(channel) {
					buildResults(channel.name, channel.logo, channel.display_name, channel.game, channel.status, "search");
				});
				$resultsBox.html(results.search);
			}
		});
	}
});
