var OpenWeatherAppKey = "583ea95bfe7c1b1b24e39e93b32f31b1";

function getWeatherWithZipCode() {

    var zipcode = $('#zip-code-input').val();

    var queryString =
        'http://api.openweathermap.org/data/2.5/weather?zip='
        + zipcode + ',us&appid=' + OpenWeatherAppKey + '&units=imperial';

    $.getJSON(queryString, function (results) {

        showWeatherData(results);

    }).fail(function (jqXHR) {
        $('#error-msg').show();
        $('#error-msg').text("Error retrieving data. " + jqXHR.statusText);
    });

    return false;
}

function showWeatherData(results) {

    if (results.weather.length) {

        $('#error-msg').show();
        $('#weather-data').show();

        //City Name
        $('#title').text(results.name);

        //Temps
        $('#temperature').text(results.main.temp);
        $('#minTemp').text(results.main.temp_min);
        $('#maxTemp').text(results.main.temp_max);
        
        //Wind Speed / Direction
        $('#windSpeed').text(results.wind.speed);
        $('#windDir').text(results.wind.deg);

        //Humidity and weather conditions
        $('#humidity').text(results.main.humidity);
        $('#conditions').text(results.weather[0].description);
        //add condition icon here?

        //Rain volume for last 3 hours. 
        if (results.rain) {
            $('#rainVolume').text(results.rain[0].3h);
        } else {
            $('#rainVolume').text("??");
        }
        

        var sunriseDate = new Date();
        sunriseDate.setTime(results.sys.sunrise + "000");
        $('#sunrise').text(sunriseDate.toLocaleTimeString());

        var sunsetDate = new Date();
        sunsetDate.setTime(results.sys.sunset + "000");
        $('#sunset').text(sunsetDate.toLocaleTimeString());

    } else {
        $('#weather-data').hide();
        $('#error-msg').show();
        $('#error-msg').text("Error retrieving data. ");
    }
}