
var map;

var iconCache={}
//colours for value ranges
//green yellow orange red
var colours = ["rgb(46,191,46)","rgb(206,172,1)","rgb(251,131,20)","rgb(191,46,46)"];
//e.g. greater than 2 is yellow
var colourCounts = [0,2,4,5];
//don't display below this at all
var minCount = 0;

//makes the image for the marker
function createMarkerImage(width, height, number, title) {
    var key = number+","+title;
    if (key in iconCache)
    {
        return iconCache[key];
    }
    var canvas, context, radius = height/2;
    canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    context = canvas.getContext("2d");
    context.clearRect(0, 0, width, height);
    
    var count = parseFloat(number);
    var colour = colours[0];
    for (i=0; i < colourCounts.length; i++)
        {
            if (count > colourCounts[i])
            {
                colour = colours[i];
            }
        }

    
    context.fillStyle = colour;

    context.strokeStyle = "rgb(0,0,0)";
    context.beginPath();
    context.moveTo(radius, 0);
    context.lineTo(width - radius, 0);
    context.quadraticCurveTo(width, 0, width, radius);
    context.lineTo(width, height - radius);
    context.quadraticCurveTo(width, height, width - radius, height);
    context.lineTo(radius, height);
    context.quadraticCurveTo(0, height, 0, height - radius);
    context.lineTo(0, radius);
    context.quadraticCurveTo(0, 0, radius, 0);
    context.closePath();
    context.fill();
    context.stroke();
    context.font = "bold 10pt Arial"
    context.textAlign = "center";
    context.fillStyle = "rgb(255,255,255)";
    context.fillText(title, width/2, height/2+5);

    iconCache[key] = canvas.toDataURL();
    return iconCache[key];
    
}
var markerCache={}
var markerStore=[]
var latlngbounds = new google.maps.LatLngBounds();
var markersAdded = 0;
var totalMarkers = 0;
var errorCount = 0;
var postcodeCache = {}

//makes the marker and adds it to the map
function addPoint(point, map, value, html,hover, label) {


    var count = parseFloat(value);
    if (count < minCount)
        return;

    var key = point.lat()+","+point.lng()+","+value+","+label;

    var sz = Math.round(parseFloat(value)/2);
    if (sz > 20)
        sz = 20;

    var wd = (label.length+1)*8+sz;
    var ImageIcon = createMarkerImage(wd, 20+sz, value, label);

    var showText = hover;
 
    var marker;
    if (key in markerCache)
    {
        marker = markerCache[key];
        marker.setMap(map);
    }
    else
    {
     marker = new google.maps.Marker({
        position: point,
        map: map,
        title: showText,
        icon: ImageIcon,
        
      
    });
    markerCache[key] = marker;


    }
    if (html.length > 4) {
        let infowindow = new google.maps.InfoWindow({
            content: html
        });
        google.maps.event.addListener(marker, 'click', function() {
            infowindow.open(map, marker);
        });
    }
    markerStore.push(marker);


}
// once marker is added, keep track of count, etc.
function markerAdded(point)
{
    if (markersAdded == 0)
         latlngbounds = new google.maps.LatLngBounds();

    if(point)
    {
        latlngbounds.extend(point);
    }

    markersAdded =  markersAdded +1;
    if (markersAdded == totalMarkers)
    {
        map.fitBounds(latlngbounds);
    }

}

//lookup the location to add
function doGeocode(postal_code, map, value, html, hover, location, label ) {

    
    if (postal_code in postcodeCache)
    {
        point = postcodeCache[postal_code];
        addPoint(point, map, value, html, hover, label);
        markerAdded(point);
        return;
    }

    // if a lat,long string is provided, use that instead
    if (location.length > 0)
    {
        let spl = location.split(",");
        if (spl.length < 2)
            return;
        let lat = parseFloat(spl[0]);
        let lng = parseFloat(spl[1]);

        let point = new google.maps.LatLng(lat,lng);

        addPoint(point, map, value, html, hover, label);
        markerAdded(point);
        return;
    }

    
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({

        'componentRestrictions': {
            'postalCode': postal_code,
            'country': 'uk'
        }
    }, function(results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
            let point = new google.maps.LatLng(results[0].geometry.location.lat(),
            results[0].geometry.location.lng());

            postcodeCache[postal_code] = point;

            addPoint(point, map, value, html, hover, label);
            markerAdded(point);
        } else {

            //Error handling - bad postcode,  overloaded api, for example
            console.log('Geocode was not successful : ' + status + ' ' + postal_code);
            errorCount  = errorCount  + 1;
            markerAdded(null);
        }

 
    });

}

//called when dataset changes
function reload() {
    // will remove the old markers before loading new ones
    var dataset = document.getElementById("Dataset");
    var datasetValue = dataset.value;
    for (var i = 0; i < markerStore.length; i++) {
            markerStore[i].setMap(null);
    }
    markerStore = []

    load(map,datasetValue);
}

function updateInfo(value)
{ 
    // error messages etc.
    var info  = document.getElementById("info");
    if (info)
        info.innerHTML = value;
}
function checkErrorCount()
{
    if (errorCount > 0)
        {
        if (errorCount == 1)
            updateInfo("Error displaying 1 value.");
        else
            updateInfo("Error displaying "+errorCount+" values.");

        errorCount = 0;
        }
}

function checkLoadedCount()
{
    if (markersAdded != totalMarkers)        {
        updateInfo(""+(totalMarkers-markersAdded)+" values notdisplayed");
        errorCount = 0;
        }
}

//checking if all are loaded yet, before reporting on errors
function checkLoaded()
{
    if (markersAdded != totalMarkers)
        {
            setTimeout(function() {
                checkLoaded();
            },1000);
        
            return;
        }
    checkErrorCount();

}


// load the data and add it to the map
function load(map, datatype) {
    errorCount = 0;
    markersAdded =  0;
    totalMarkers = -1;
    updateInfo("");
    downloadUrl("getmapdata.php?data="+datatype, function(data) {
        var xml = parse(data);
        var markers = xml.documentElement.getElementsByTagName("marker");
        totalMarkers = markers.length;
        for (var i = 0; i < markers.length; i++) {
            let value = markers[i].getAttribute("value");
            if (!value)
                value = "0";
            let label = markers[i].getAttribute("label");
            if (!label)
                label = value;

      
            let pc = markers[i].getAttribute("postcode");
            let html = markers[i].getAttribute("html");
            let hover = markers[i].getAttribute("hover");
            let location = markers[i].getAttribute("location");
            if (!html)
                html = "";
            if (!hover)
                hover = "";
            if (!location)
            {
                location = "";
                if (!pc || pc.length <5 || pc.length > 9)
                {
                    console.log("bad postcode "+pc);
                    errorCount =  errorCount +1;
                    markerAdded(null);
                   continue;
                }
            }
            if ( value.length < 1 || value.length > 12)
            {
                console.log("bad value "+value);
                errorCount =  errorCount +1;
                markerAdded(null);
               continue;
            }

    
            doGeocode(pc, map, value, html, hover, location, label);
 
      

        }
    });

    //check errors after all loaded
    setTimeout(function() {
       checkLoaded();
    },1000);

    //check errors anyway after 20 seconds
    //in case some call never returns
    setTimeout(function() {
        checkErrorCount();
        checkLoadedCount();
     },20000);
 

}

//called on page startup from index.html
function initialize() {

    var stylesArray = [
        {
          featureType: '',
          elementType: '',
          stylers: [
            {color: ''},
            {visibility: ''},
            // Add any stylers you need.
          ]
        },
        {
          featureType: '',
          // Add the stylers you need.
        }
      ]


// initial map view, will change when all markers are loaded
    var mapOptions = {
        center: {
            lat: 53.406,
            lng: -2.984
        },
        zoom: 12,
        mapTypeControl: false,
        streetViewControl: false,
        MapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [ 
            { 
              "featureType": "poi", 
              "stylers": [ 
                { "visibility": "off" } 
              ] ,
     
            },
            { 
                "featureType": "transit", 
                "stylers": [ 
                  { "visibility": "off" } 
                ] ,
       
              },
        ]
           
    };
    map = new google.maps.Map(document.getElementById('map-canvas'),
        mapOptions);

    load(map, "test");

}

