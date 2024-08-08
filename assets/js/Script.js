$(document).ready(function () {
  // Search button feature
  $("#search-button").on("click", function () {
    var searchTerm = $("#search-value").val().trim(); // Get search term and trim any extra spaces
    $("#search-value").val(""); // Empty input field
    if (searchTerm) {
      weatherFunction(searchTerm);
      weatherForecast(searchTerm);
    }
  });

  // Trigger search on Enter key press
  $("#search-value").keypress(function (event) {
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if (keycode === 13) {
      var searchTerm = $("#search-value").val().trim();
      $("#search-value").val(""); // Empty input field
      if (searchTerm) { // Ensure the search term is not empty
        weatherFunction(searchTerm);
        weatherForecast(searchTerm);
      }
    }
  });

  // Pull previous searches from local storage
  var history = JSON.parse(localStorage.getItem("history")) || [];

  // Sets history array search to correct length
  if (history.length > 0) {
    weatherFunction(history[history.length - 1]);
  }

  // Makes a row for each element in history array (search terms)
  for (var i = 0; i < history.length; i++) {
    createRow(history[i]);
  }

  // Creates a row for searched cities
  function createRow(text) {
    var listItem = $("<li>").addClass("list-group-item").text(text);
    $(".history").append(listItem);
  }

  // Listener for list item on click function
  $(".history").on("click", "li", function () {
    weatherFunction($(this).text());
    weatherForecast($(this).text());
  });

  function weatherFunction(searchTerm) {
    $.ajax({
      type: "GET",
      url: "https://api.openweathermap.org/data/2.5/weather?q=" + searchTerm + "&appid=2dd70f96425193662876c70ffc46427e",
    }).then(function (data) {
      // If index of search value does not exist
      if (history.indexOf(searchTerm) === -1) {
        // Push search value to history array
        history.push(searchTerm);
        // Store in local storage
        localStorage.setItem("history", JSON.stringify(history));
        createRow(searchTerm);
      }
      // Clear out old content
      $("#today").empty();

      var title = $("<h3>").addClass("card-title").text(data.name + " (" + new Date().toLocaleDateString() + ")");
      var img = $("<img>").attr("src", "https://openweathermap.org/img/w/" + data.weather[0].icon + ".png");

      var card = $("<div>").addClass("card");
      var cardBody = $("<div>").addClass("card-body");
      var wind = $("<p>").addClass("card-text").text("Wind Speed: " + data.wind.speed + " MPH");
      var humid = $("<p>").addClass("card-text").text("Humidity: " + data.main.humidity + " %");
      var temp = $("<p>").addClass("card-text").text("Temperature: " + data.main.temp + " °F");

      var lon = data.coord.lon;
      var lat = data.coord.lat;

      $.ajax({
        type: "GET",
        url: "https://api.openweathermap.org/data/2.5/uvi?lat=" + lat + "&lon=" + lon + "&appid=2dd70f96425193662876c70ffc46427e",
      }).then(function (response) {
        var uvResponse = response.value;
        var uvIndex = $("<p>").addClass("card-text").text("UV Index: ");
        var btn = $("<span>").addClass("btn btn-sm").text(uvResponse);

        if (uvResponse < 3) {
          btn.addClass("btn-success");
        } else if (uvResponse < 7) {
          btn.addClass("btn-warning");
        } else {
          btn.addClass("btn-danger");
        }

        cardBody.append(uvIndex.append(btn));
      });

      // Merge and add to page
      title.append(img);
      cardBody.append(title, temp, humid, wind);
      card.append(cardBody);
      $("#today").append(card);
    });
  }

  function weatherForecast(searchTerm) {
    $.ajax({
      type: "GET",
      url: "https://api.openweathermap.org/data/2.5/forecast?q=" + searchTerm + "&appid=2dd70f96425193662876c70ffc46427e",
      success: function (data) {
        $("#forecast").html("<h4 class=\"mt-3\">5-Day Forecast:</h4>").append("<div class=\"row\">");

        for (var i = 0; i < data.list.length; i++) {
          if (data.list[i].dt_txt.indexOf("15:00:00") !== -1) {
            var titleFive = $("<h3>").addClass("card-title").text(new Date(data.list[i].dt_txt).toLocaleDateString());
            var imgFive = $("<img>").attr("src", "https://openweathermap.org/img/w/" + data.list[i].weather[0].icon + ".png");
            var colFive = $("<div>").addClass("col-md-2.5");
            var cardFive = $("<div>").addClass("card bg-primary text-white");
            var cardBodyFive = $("<div>").addClass("card-body p-2");
            var humidFive = $("<p>").addClass("card-text").text("Humidity: " + data.list[i].main.humidity + "%");
            var tempFive = $("<p>").addClass("card-text").text("Temperature: " + data.list[i].main.temp + " °F");

            colFive.append(cardFive.append(cardBodyFive.append(titleFive, imgFive, tempFive, humidFive)));
            $("#forecast .row").append(colFive);
          }
        }
      },
      error: function () {
        console.error('Error fetching forecast data.');
        $("#forecast").html("<p>Error fetching forecast data.</p>");
      }
    });
  }
});
