var map;
//debug only
var gmarkers= [];
var side_bar_html ="";
var ginfo = [];

function initialize() {

	var mapOptions = {
		center: new google.maps.LatLng(34.397, 150.644),
        zoom: 3,
        mapTypeId: google.maps.MapTypeId.ROADMAP

	};
	map = new google.maps.Map(document.getElementById('map-canvas'),
		mapOptions);
	loadMarkers();
}

google.maps.event.addDomListener(window, 'load', initialize);
function myclick(i){
        google.maps.event.trigger(gmarkers[i], "click");
}
function loadMarkers(){
    //Cambio en debug
    // $.getJSON( "http://127.0.0.1:5000/markers")
    $.getJSON( "http://vps79999.ovh.net/markers")
        .done(function( data ) {
            ginfo = [];
           for (var i=0;i<data.length;i++){
            gmarkers[i] = new google.maps.Marker({
                position: new google.maps.LatLng(data[i].lat, data[i].longitud),
                map: map,
                title: data[i].title
            });
            ginfo[i] = new google.maps.InfoWindow({
              content: data[i].infoWindow
              });
            // save the info we need to use later for the side_bar
            google.maps.event.addListener(gmarkers[i], "click", function() {
                var i = gmarkers.indexOf(this);
                ginfo[i].open(map,gmarkers[i]);
            });
            
            // add a line to the side_bar html
            side_bar_html += '<li><a href="javascript:myclick(' + i + ')">'+data[i].side_bar_title+'<\/a><a href="/users/evento/'+data[i].cacheId+'"><img src="/images/twitter-icon.png"/><\a><\/li>';
            //>>>
           }

            document.getElementById("side_bar").innerHTML = side_bar_html;
        });
}
