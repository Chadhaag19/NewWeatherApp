(function () {
    "use strict";

    document.addEventListener( 'deviceready', onDeviceReady.bind( this ), false );

    function onDeviceReady() {
        // Handle the Cordova pause and resume events
        document.addEventListener( 'pause', onPause.bind(this), false);
        document.addEventListener('resume', onResume.bind(this), false);

        //$('#get-weather-btn').click(getWeatherWithZipCode);
        getWeatherWithGeoLocation();

        $('#get-cloudOverlay-btn').click(getCloudOverlay);
        $('#get-loopOverlay-btn').click(getLoopOverlay);
        $('#get-currentOverlay-btn').click(getCurrentOverlay);
    };

    function onPause() {

    };

    function onResume() {

    };

} )();