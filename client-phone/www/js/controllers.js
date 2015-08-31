var geolocalisation = {

  /**
   * @property {google.maps.Map} map
   */
  map: undefined,
  /**
   * @property {google.maps.Marker} location The current location
   */
  location: undefined,
  /**
   * @property {google.map.PolyLine} path The list of background geolocations
   */
  path: undefined,
  /**
   * @property {Boolean} aggressiveEnabled
   */
  aggressiveEnabled: false,
  /**
   * @property {Array} locations List of rendered map markers of prev locations
   */
  locations: [],
  /**
   * @private
   */
  btnEnabled: undefined,
  btnPace: undefined,
  btnHome: undefined,
  btnReset: undefined,

  initializeMap: function () {

    var localStorage = window.localStorage;
    var mapOptions = {
      center: {lat: -34.397, lng: 150.644},
      zoom: 8,
      zoomControl: false
    };

    var header = $('#header'),
      footer = $('#footer'),
      canvas = $('#map-canvas'),
      canvasHeight = window.innerHeight - header[0].clientHeight - footer[0].clientHeight;

    canvas.height(150);
    canvas.width(window.clientWidth);
    console.log(canvas[0]);
    geolocalisation.map = new google.maps.Map(canvas[0], mapOptions);
  },
  initialize: function ($cordovaDevice, $http) {

    // if (window.plugins.backgroundGeoLocation) {
    //geolocalisation.initializeMap;
    geolocalisation.configureBackgroundGeoLocation($cordovaDevice, $http);
    geolocalisation.watchPosition();

    // }
  },
  configureBackgroundGeoLocation: function ($cordovaDevice, $http) {
    var device = $cordovaDevice.getUUID();
    var phone = {};
    var Location = {};

    $http.get('http://dascent-dascent.rhcloud.com/api/devices/' + device)

      .success(function (data) {
        phone = data[0];

        window.navigator.geolocation.getCurrentPosition(function (location) {
          //var map     = geolocalisation.map,
          var coords = location.coords;
          //ll      = new google.maps.LatLng(coords.latitude, coords.longitude);
          /*
           zoom    = map.getZoom();

           map.setCenter(ll);
           if (zoom < 15) {
           map.setZoom(15);
           }*/
          geolocalisation.setCurrentLocation(coords);
          console.log(location);
        });

        var bgGeo = window.plugins.backgroundGeoLocation;

        /**
         * This would be your own callback for Ajax-requests after POSTing background geolocation to your server.
         */
        var yourAjaxCallback = function (response) {
          bgGeo.finish();
        };

        /**
         * This callback will be executed every time a geolocation is recorded in the background.
         */
        var callbackFn = function (location) {
          console.log('[js] BackgroundGeoLocation callback:  ' + location.latitude + ',' + location.longitude);
          yourAjaxCallback.call(this);
        };

        var failureFn = function (error) {
          console.log('BackgroundGeoLocation error');
        };

        // BackgroundGeoLocation is highly configurable.
        bgGeo.configure(callbackFn, failureFn, {
          url: 'http://dascent-dascent.rhcloud.com/api/notifications',
          params: {
            device: phone
          },
          desiredAccuracy: 10,
          stationaryRadius: 20,
          distanceFilter: 30,
          notificationTitle: 'Background tracking',   // <-- android only, customize the title of the notification
          notificationText: 'ENABLED',                // <-- android only, customize the text of the notification
          activityType: 'AutomotiveNavigation',
          debug: false, // <-- enable this hear sounds for background-geolocation life-cycle.
          stopOnTerminate: true
        });

        // Turn ON the background-geolocation system.  The user will be tracked whenever they suspend the geolocalisation.
        bgGeo.start();

      }).error(function (error) {
        console.log(error.message);
      });


  },
  watchPosition: function () {
    var fgGeo = window.navigator.geolocation;
    if (geolocalisation.watchId) {
      geolocalisation.stopPositionWatch();
    }
    // Watch foreground location
    geolocalisation.watchId = fgGeo.watchPosition(function (location) {
      geolocalisation.setCurrentLocation(location.coords);
    }, function () {
    }, {
      enableHighAccuracy: true,
      maximumAge: 5000,
      frequency: 10000,
      timeout: 10000
    });
  },
  stopPositionWatch: function () {
    var fgGeo = window.navigator.geolocation;
    if (geolocalisation.watchId) {
      fgGeo.clearWatch(geolocalisation.watchId);
      geolocalisation.watchId = undefined;
    }
  },
  setCurrentLocation: function (location) {
    if (!geolocalisation.location) {
      geolocalisation.location = new google.maps.Marker({
        map: geolocalisation.map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 3,
          fillColor: 'blue',
          strokeColor: 'blue',
          strokeWeight: 5
        }
      });
      geolocalisation.locationAccuracy = new google.maps.Circle({
        fillColor: '#3366cc',
        fillOpacity: 0.4,
        strokeOpacity: 0,
        map: geolocalisation.map
      });
    }
    if (!geolocalisation.path) {
      geolocalisation.path = new google.maps.Polyline({
        map: geolocalisation.map,
        strokeColor: '#3366cc',
        fillOpacity: 0.4
      });
    }
    var latlng = new google.maps.LatLng(location.latitude, location.longitude);

    if (geolocalisation.previousLocation) {
      var prevLocation = geolocalisation.previousLocation;
      // Drop a breadcrumb of where we've been.
      geolocalisation.locations.push(new google.maps.Marker({
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 3,
          fillColor: 'green',
          strokeColor: 'green',
          strokeWeight: 5
        },
        map: geolocalisation.map,
        position: new google.maps.LatLng(prevLocation.latitude, prevLocation.longitude)
      }));
    }

    // Update our current position marker and accuracy bubble.
    geolocalisation.location.setPosition(latlng);
    geolocalisation.locationAccuracy.setCenter(latlng);
    geolocalisation.locationAccuracy.setRadius(location.accuracy);

    // Add breadcrumb to current Polyline path.
    geolocalisation.path.getPath().push(latlng);
    geolocalisation.previousLocation = location;
  },
  onClickHome: function () {
    var fgGeo = window.navigator.geolocation;

    // Your geolocalisation must execute AT LEAST ONE call for the current position via standard Cordova geolocation,
    //  in order to prompt the user for Location permission.
    fgGeo.getCurrentPosition(function (location) {
      var map = geolocalisation.map,
        coords = location.coords,
        ll = new google.maps.LatLng(coords.latitude, coords.longitude),
        zoom = map.getZoom();

      map.setCenter(ll);
      if (zoom < 15) {
        map.setZoom(15);
      }
      geolocalisation.setCurrentLocation(coords);
    });
  },

  close: function () {
    var bgGeo = window.plugins.backgroundGeoLocation;
    bgGeo.stop();
  }

};
