$(document).ready(function () {
  function fetchWeatherData(searchTerm) {
    if (searchTerm) {
      weatherFunction(searchTerm);
      weatherForecast(searchTerm);
    }
  }

  // Search button click and Enter key press
  $("#search-button").on("click", function () {
    var searchTerm = $("#search-value").val().trim();
    $("#search-value").val(""); // Empty input field
    fetchWeatherData(searchTerm);
  });

  $("#search-value").on("keypress", function (event) {
    if (event.keyCode === 13) { // Enter key
      var searchTerm = $(this).val().trim();
      $(this).val(""); // Empty input field
      fetchWeatherData(searchTerm);
    }
  });

  // Pull previous searches from local storage
  var history = JSON.parse(localStorage.getItem("history")) || [];
  if (history.length > 0) {
    weatherFunction(history[history.length - 1]);
  }

  // Make a row for each element in history array (search terms)
  history.forEach(function (term) {
    createRow(term);
  });

  function createRow(text) {
    var listItem = $("<li>").addClass("list-group-item").text(text);
    $(".history").append(listItem);
  }

  $(".history").on("click", "li", function () {
    var searchTerm = $(this).text();
    fetchWeatherData(searchTerm);
  });

  function weatherFunction(searchTerm) {
    $.ajax({
      type: "GET",
      url: "https://api.openweathermap.org/data/2.5/weather?q=" + searchTerm + "&appid=0022907a25d60eb4489974f0c50f1352",
      success: function (data) {
        if (history.indexOf(searchTerm) === -1) {
          history.push(searchTerm);
          localStorage.setItem("history", JSON.stringify(history));
          createRow(searchTerm);
        }

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
          url: "https://api.openweathermap.org/data/2.5/uvi?lat=" + lat + "&lon=" + lon + "&appid=0022907a25d60eb4489974f0c50f1352",
          success: function (response) {
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
          },
          error: function () {
            console.error('Error fetching UV index data.');
            $("#today").append("<p>Error fetching UV index data.</p>");
          }
        });

        title.append(img);
        cardBody.append(title, temp, humid, wind);
        card.append(cardBody);
        $("#today").append(card);
      },
      error: function () {
        console.error('Error fetching weather data.');
        $("#today").html("<p>Error fetching weather data.</p>");
      }
    });
  }

  function weatherForecast(searchTerm) {
    $.ajax({
      type: "GET",
      url: "https://api.openweathermap.org/data/2.5/forecast?q=" + searchTerm + "&appid=0022907a25d60eb4489974f0c50f1352",
      success: function (data) {
        $("#forecast").html("<h4 class=\"mt-3\">5-Day Forecast:</h4>").append("<div class=\"row\">");

        data.list.forEach(function (item) {
          if (item.dt_txt.indexOf("15:00:00") !== -1) {
            var titleFive = $("<h3>").addClass("card-title").text(new Date(item.dt_txt).toLocaleDateString());
            var imgFive = $("<img>").attr("src", "https://openweathermap.org/img/w/" + item.weather[0].icon + ".png");
            var colFive = $("<div>").addClass("col-md-2.5");
            var cardFive = $("<div>").addClass("card bg-primary text-white");
            var cardBodyFive = $("<div>").addClass("card-body p-2");
            var humidFive = $("<p>").addClass("card-text").text("Humidity: " + item.main.humidity + "%");
            var tempFive = $("<p>").addClass("card-text").text("Temperature: " + item.main.temp + " °F");

            colFive.append(cardFive.append(cardBodyFive.append(titleFive, imgFive, tempFive, humidFive)));
            $("#forecast .row").append(colFive);
          }
        });
      },
      error: function () {
        console.error('Error fetching forecast data.');
        $("#forecast").html("<p>Error fetching forecast data.</p>");
      }
    });
  }
});