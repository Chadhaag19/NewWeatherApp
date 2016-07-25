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

function getWeatherWithGeoLocation() {

    navigator.geolocation.getCurrentPosition(onGetLocationSuccess, onGetLocationError,
      { enableHighAccuracy: true });

    $('#error-msg').show();
    $('#error-msg').text('Getting your current location . . .');

    //$('#get-weather-btn').prop('disabled', true);

}
function onGetLocationSuccess(position) {

    //Inform user that location is recieved and getting data.
    $('#error-msg').text('Requesting weather data . . .');

    //GPS Coordinates
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;

    //Today's Weather Data
    var queryString =
      'http://api.openweathermap.org/data/2.5/weather?lat='
        + latitude + '&lon=' + longitude + '&appid=' + OpenWeatherAppKey + '&units=imperial';

    //$('#get-weather-btn').prop('disabled', false);

    //Send for today's weather data
    $.getJSON(queryString, function (todayResults) {

        showWeatherData(todayResults);

    }).fail(function (jqXHR) {
        $('#error-msg').show();
        $('#error-msg').text("Error retrieving data. " + jqXHR.statusText);
    });

    //Forecasted Weather Data
    queryString =
    'http://api.openweathermap.org/data/2.5/forecast?lat='
      + latitude + '&lon=' + longitude + '&appid=' + OpenWeatherAppKey + '&units=imperial';

    //$('#get-weather-btn').prop('disabled', false);
    //Send for forecast weather data
    $.getJSON(queryString, function (forecastResults) {

        showForecastedWeatherData(forecastResults);

        }).fail(function (jqXHR) {
            $('#error-msg').show();
            $('#error-msg').text("Error retrieving data. " + jqXHR.statusText);

        });
    showRadarMap(longitude, latitude);

}
function onGetLocationError(error) {

    $('#error-msg').text('Error getting location');
    $('#get-weather-btn').prop('disabled', false);
}

function showWeatherData(results) {

    if (results.weather.length) {

        $('#error-msg').hide();
        $('#today-weather-data').show();

        //City Name
        $('#todayCity').text(results.name);

        //Temps
        $('#temperature').text(results.main.temp.toFixed(1));
        $('#minTemp').text(results.main.temp_min.toFixed(1));
        $('#maxTemp').text(results.main.temp_max.toFixed(1));
        
        //Wind Speed / Direction
        $('#windSpeed').text(results.wind.speed.toFixed(1));
        $('#windDir').text(showWindDir(results.wind.deg.toFixed(0)));

        //Humidity and weather conditions
        $('#humidity').text(results.main.humidity);
        $('#todayPressure').text(results.main.pressure.toFixed(1));
        $('#conditions').text(results.weather[0].description);
        $('#conditionIcon').prop('src', 'http://openweathermap.org/img/w/' + results.weather[0].icon + '.png');

        //Rain volume for last 3 hours. 
        if (results.rain["1h"]) {
            outxt = "Rain Volume for last hour: " + results.rain["1h"] + '"';
            $('#rainVolume').text(outxt);
        }
        else if (results.rain["3h"]) {
            outxt = "Rain Volume for last 3 hours: " + results.rain["3h"] + '"';
            $('#rainVolume').text(outxt);
        }
        else {
            outxt = "No Rain Volume for the last 3 hours.";
            $('#rainVolume').text(outxt);
        }
        
        var sunriseDate = new Date();
        sunriseDate.setTime(results.sys.sunrise + "000");
        $('#sunrise').text(sunriseDate.toLocaleTimeString());

        var sunsetDate = new Date();
        sunsetDate.setTime(results.sys.sunset + "000");
        $('#sunset').text(sunsetDate.toLocaleTimeString());



    } else {
        $('#today-weather-data').hide();
        $('#error-msg').show();
        $('#error-msg').text("Error retrieving data. ");
    }
}

function showForecastedWeatherData(results) {
    if (results.cnt){
        $('#error-msg').hide();
        $('#forecast-weather-data').show();

        var i;
        var a = 0;
        for (i = 0; i < 5; i++) {

            a += 1;
            //Time of Forecast
            var z = Date.parse(results.list[i].dt_txt);
            var y = new Date;
            var outTxt;
            y.setTime(z);
            if (y.getHours() >= 13) {
                outTxt = y.getHours()-12 + " pm";
            }
            else if (y.getHours() == 0) {
                outTxt = "Midnight";
            }
            else if (y.getHours() == 12) {
                outTxt = "Noon";
            }
            else {
                outTxt = y.getHours() + " am";
            }
            
            $('#forecast' + i + 'DayTime').text(outTxt);

            //Temperature
            $('#forecast' + i + 'Temp').text(results.list[i].main.temp.toFixed(1));

            //Wind Speed / Direction
            $('#forecast' + i + 'WindSpeed').text(results.list[i].wind.speed.toFixed(1));
            $('#forecast' + i + 'WindDir').text(showWindDir(results.list[i].wind.deg));

            //Humidity and weather conditions
            $('#forecast' + i + 'ConditionIcon').prop('src', 'http://openweathermap.org/img/w/' + results.list[i].weather[0].icon + '.png');
        }

    } else {
        $('#forecast-weather-data').hide();
        $('#error-msg').show();
        $('#error-msg').text("Error retrieving data. ");
    }
}

function showRadarMap(long, lat) {
    $('#error-msg').hide();
    $('#radarMap').show();

    var map;

    var mapOptions = {
        zoom: 8,
        disableDefaultUI: true,
        zoomControl: true,
        zoomControlOptions: {
            style: google.maps.ZoomControlStyle.SMALL
        },
        center: new google.maps.LatLng(lat, long),        
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    map = new google.maps.Map(document.getElementById("radarMap"), mapOptions);

    nexradNow = new google.maps.ImageMapType({
        getTileUrl: function(tile, zoom) {
            return "http://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/nexrad-n0q-900913/" + zoom + "/" + tile.x + "/" + tile.y +".png?"+ (new Date()).getTime();
        },
        tileSize: new google.maps.Size(256, 256),
        opacity: 0.25,
        name: 'NEXRAD',
        isPng: true
    });

    goes = new google.maps.ImageMapType({
        getTileUrl: function (tile, zoom) {
            return "http://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/goes-east-vis-1km-900913/" + zoom + "/" + tile.x + "/" + tile.y + ".png?" + (new Date()).getTime();
        },
        tileSize: new google.maps.Size(256, 256),
        opacity: 0.35,
        name: 'GOES East Vis',
        isPng: true
    });

    map.overlayMapTypes.setAt("1", goes);
    map.overlayMapTypes.setAt("2", nexradNow);
    $('#radarDesc').text("Now Radar and Cloud Cover");

    /*
    nexradFiveMin = new google.maps.ImageMapType({
        getTileUrl: function (tile, zoom) {
            return "http://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/nexrad-n0q-900913-m05m/" + zoom + "/" + tile.x + "/" + tile.y + ".png?" + (new Date()).getTime();
        },
        tileSize: new google.maps.Size(256, 256),
        opacity: 0.35,
        name: 'NEXRAD',
        isPng: true
    });

    nexradTenMin = new google.maps.ImageMapType({
        getTileUrl: function (tile, zoom) {
            return "http://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/nexrad-n0q-900913-m10m/" + zoom + "/" + tile.x + "/" + tile.y + ".png?" + (new Date()).getTime();
        },
        tileSize: new google.maps.Size(256, 256),
        opacity: 0.35,
        name: 'NEXRAD',
        isPng: true
    });

    nexradFifteenMin = new google.maps.ImageMapType({
        getTileUrl: function (tile, zoom) {
            return "http://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/nexrad-n0q-900913-m15m/" + zoom + "/" + tile.x + "/" + tile.y + ".png?" + (new Date()).getTime();
        },
        tileSize: new google.maps.Size(256, 256),
        opacity: 0.35,
        name: 'NEXRAD',
        isPng: true
    });

    nexradTwentyMin = new google.maps.ImageMapType({
        getTileUrl: function (tile, zoom) {
            return "http://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/nexrad-n0q-900913-m20m/" + zoom + "/" + tile.x + "/" + tile.y + ".png?" + (new Date()).getTime();
        },
        tileSize: new google.maps.Size(256, 256),
        opacity: 0.35,
        name: 'NEXRAD',
        isPng: true
    });

    nexradTwentyFiveMin = new google.maps.ImageMapType({
        getTileUrl: function (tile, zoom) {
            return "http://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/nexrad-n0q-900913-m25m/" + zoom + "/" + tile.x + "/" + tile.y + ".png?" + (new Date()).getTime();
        },
        tileSize: new google.maps.Size(256, 256),
        opacity: 0.35,
        name: 'NEXRAD',
        isPng: true
    });

    nexradThirtyMin = new google.maps.ImageMapType({
        getTileUrl: function (tile, zoom) {
            return "http://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/nexrad-n0q-900913-m30m/" + zoom + "/" + tile.x + "/" + tile.y + ".png?" + (new Date()).getTime();
        },
        tileSize: new google.maps.Size(256, 256),
        opacity: 0.35,
        name: 'NEXRAD',
        isPng: true
    });

    nexradThirtyFiveMin = new google.maps.ImageMapType({
        getTileUrl: function (tile, zoom) {
            return "http://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/nexrad-n0q-900913-m35m/" + zoom + "/" + tile.x + "/" + tile.y + ".png?" + (new Date()).getTime();
        },
        tileSize: new google.maps.Size(256, 256),
        opacity: 0.35,
        name: 'NEXRAD',
        isPng: true
    });
    nexradFortyMin = new google.maps.ImageMapType({
        getTileUrl: function (tile, zoom) {
            return "http://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/nexrad-n0q-900913-m40m/" + zoom + "/" + tile.x + "/" + tile.y + ".png?" + (new Date()).getTime();
        },
        tileSize: new google.maps.Size(256, 256),
        opacity: 0.35,
        name: 'NEXRAD',
        isPng: true
    });
    nexradFortyFiveMin = new google.maps.ImageMapType({
        getTileUrl: function (tile, zoom) {
            return "http://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/nexrad-n0q-900913-m45m/" + zoom + "/" + tile.x + "/" + tile.y + ".png?" + (new Date()).getTime();
        },
        tileSize: new google.maps.Size(256, 256),
        opacity: 0.35,
        name: 'NEXRAD',
        isPng: true
    });
    nexradFiftyMin = new google.maps.ImageMapType({
        getTileUrl: function (tile, zoom) {
            return "http://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/nexrad-n0q-900913-m50m/" + zoom + "/" + tile.x + "/" + tile.y + ".png?" + (new Date()).getTime();
        },
        tileSize: new google.maps.Size(256, 256),
        opacity: 0.35,
        name: 'NEXRAD',
        isPng: true
    });*/

    
}
    function getCloudOverlay() {
        goes = new google.maps.ImageMapType({
            getTileUrl: function (tile, zoom) {
                return "http://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/goes-east-vis-1km-900913/" + zoom + "/" + tile.x + "/" + tile.y + ".png?" + (new Date()).getTime();
            },
            tileSize: new google.maps.Size(256, 256),
            opacity: 0.35,
            name: 'GOES East Vis',
            isPng: true
        });

        map.overlayMapTypes.push(null); //create empty overlay
        map.overlayMapTypes.setAt("1", goes);
        $('#radarTimeFrame').text("Current Cloud Cover");
    }

    function getCurrentOverlay() {
        map.overlayMapTypes.push(null); //create empty overlay
        map.overlayMapTypes.setAt("1", nexradNow);
        $('#radarTimeFrame').text("Now");
    }

    //map.overlayMapTypes.push(null); //create empty overlay
    //map.overlayMapTypes.setAt("0", goes);

    //Nexrad Loop
    function getLoopOverlay() {
        var i = 11;
        var loopTimer = setInterval(nexradLoop, 1000);

        function nexradLoop() {
            if (i == 1) {
                map.overlayMapTypes.push(null); //create empty overlay
                map.overlayMapTypes.setAt("1", nexradNow);
                $('#radarTimeFrame').text("Now");
                i = 11;
            }
            else if (i == 2) {
                map.overlayMapTypes.push(null); //create empty overlay
                map.overlayMapTypes.setAt("1", nexradFiveMin);
                $('#radarTimeFrame').text("5 Minutes Ago");
                i--;
            }
            else if (i == 3) {
                map.overlayMapTypes.push(null); //create empty overlay
                map.overlayMapTypes.setAt("1", nexradTenMin);
                $('#radarTimeFrame').text("10 Minutes Ago");
                i--;
            }
            else if (i == 4) {
                map.overlayMapTypes.push(null); //create empty overlay
                map.overlayMapTypes.setAt("1", nexradFifteenMin);
                $('#radarTimeFrame').text("15 Minutes Ago");
                i--;
            }
            else if (i == 5) {
                map.overlayMapTypes.push(null); //create empty overlay
                map.overlayMapTypes.setAt("1", nexradTwentyMin);
                $('#radarTimeFrame').text("20 Minutes Ago");
                i--;
            }
            else if (i == 6) {
                map.overlayMapTypes.push(null); //create empty overlay
                map.overlayMapTypes.setAt("1", nexradTwentyFiveMin);
                $('#radarTimeFrame').text("25 Minutes Ago");
                i--;
            }
            else if (i == 7) {
                map.overlayMapTypes.push(null); //create empty overlay
                map.overlayMapTypes.setAt("1", nexradThirtyMin);
                $('#radarTimeFrame').text("30 Minutes Ago");
                i--;
            }
            else if (i == 8) {
                map.overlayMapTypes.push(null); //create empty overlay
                map.overlayMapTypes.setAt("1", nexradThirtyFiveMin);
                $('#radarTimeFrame').text("35 Minutes Ago");
                i--;
            }
            else if (i == 9) {
                map.overlayMapTypes.push(null); //create empty overlay
                map.overlayMapTypes.setAt("1", nexradFortyMin);
                $('#radarTimeFrame').text("40 Minutes Ago");
                i--;
            }
            else if (i == 10) {
                map.overlayMapTypes.push(null); //create empty overlay
                map.overlayMapTypes.setAt("1", nexradFortyFiveMin);
                $('#radarTimeFrame').text("45 Minutes Ago");
                i--;
            }
            else if (i == 11) {
                map.overlayMapTypes.push(null); //create empty overlay
                map.overlayMapTypes.setAt("1", nexradFiftyMin);
                $('#radarTimeFrame').text("50 Minutes Ago");
                i--;
            }
        }
    }

function showWindDir(degreeDir) {
    if (degreeDir >= 348.76 && degreeDir <= 360.00) {
        return "N";
    }
    else if (degreeDir <= 11.25) {
        return "N";
    }
    else if (degreeDir >= 11.26 && degreeDir <= 33.75) {
        return "NNE";
    }
    else if (degreeDir >= 33.76 && degreeDir <= 56.25) {
        return "NE";
    }
    else if (degreeDir >= 56.26 && degreeDir <= 78.75) {
        return "ENE";
    }
    else if (degreeDir >= 78.76 && degreeDir <= 101.25) {
        return "E";
    }
    else if (degreeDir >= 101.26 && degreeDir <= 123.75) {
        return "ESE";
    }
    else if (degreeDir >= 123.76 && degreeDir <= 146.25) {
        return "SE";
    }
    else if (degreeDir >= 146.26 && degreeDir <= 168.75) {
        return "SSE";
    }
    else if (degreeDir >= 168.76 && degreeDir <= 191.25) {
        return "S";
    }
    else if (degreeDir >= 191.26 && degreeDir <= 213.75) {
        return "SSW";
    }
    else if (degreeDir >= 213.76 && degreeDir <= 236.25) {
        return "SW";
    }
    else if (degreeDir >= 236.26 && degreeDir <= 258.75) {
        return "WSW";
    }
    else if (degreeDir >= 258.76 && degreeDir <= 281.25) {
        return "W";
    }
    else if (degreeDir >= 281.26 && degreeDir <= 303.75) {
        return "WNW";
    }
    else if (degreeDir >= 303.76 && degreeDir <= 326.25) {
        return "NW";
    }
    else if (degreeDir >= 326.26 && degreeDir <= 348.75) {
        return "NNW";
    }
    else {
        return degreeDir;
    }
}