/*My Data stored in another file called FavouritePlaces.js
where array of my places called Places*/

var infowindow , map , markers = [] , photos = [] , FSquareURL;
var foursquare_client_id = "FYIX0IT2IZSHGSE4QZWSGKSYWJF3RRP55JRYC4B3DK4GW3PC";
var foursquare_client_secret = "RLNLC0ZSUJJ53EL2LR23RODBGBSBCDULQAGW11O1LKSY0G4Z";
var flickrApi = "a5fd9c95d8045faf2298ac049b576ed6";


// create formatted Information window with available Data about the place
function setInfoWindowContents(data)
{
    var innerHTML = "<div id='infowindow'>";
    if(data.title)
    {
        innerHTML += "<h2 id='info'>"+data.title+"</h2>";
    }
        if(data.desc)
    {
        innerHTML += "<h3 id='info'> Place Description:</h3>"+
        data.desc ;
    }
        if(data.address)
    {
        innerHTML += "<h3 id='info'> Formatted Address:</h3>"+
        data.address ;
    }
    
        if(data.phone)
    {
        innerHTML += "<h3 id='info'> Phone Number:</h3>"+
        data.phone;
    }
    
        if(data.photos)
    {
        innerHTML += "<h3 id='info'>Photo from Location:</h3>"+
        "<a target='_blank' href='"+data.photos[0]+
        "'><img src='"+data.photos[0] + 
        "'></a>";
    }
    innerHTML+="</div";

    return innerHTML;
}


// edit the marker to have custom image
function newCustomeMarker(marker)
{
                 var customIcon = new google.maps.MarkerImage(
                "https://lh4.ggpht.com/Tr5sntMif9qOPrKV_UVl7K8A_V3xQDgA7Sw_"+
                "qweLUFlg76d_vGFA7q1xIKZ6IcmeGqg=w300-rw",
                new google.maps.Size(50, 50),
                new google.maps.Point(0,0),
                new google.maps.Point(0, 0),
                new google.maps.Size(50, 50));
                marker.setIcon(customIcon);

                return marker;
}

// stop the marker from animation 
function stopMarkerAnimation(marker)
{
    marker.setAnimation(null);
}


// add bounce animartin for the marker  for 10 seconds
function bounce(marker,state) 
{
    // if the marker is already has animation , reset it to null
    if (marker.getAnimation() !== null) 
    {
        marker.setAnimation(null);
    } 
    // if it has not  an animation 
    else 
    {
        // set its animation to bounce for 10 seconds and stop
        marker.setAnimation(google.maps.Animation.BOUNCE);
        
        if(state === '')
        setTimeout(
            function(){
                marker.setAnimation(null);
                      } , 1000 ); // end of anonymous function
    }

}

// to get place details use foursquare api 
var foursquareAjax = function(obj)
{
FSquareURL = 'https://api.foursquare.com/v2/venues/search?ll='+ 
obj.location.lat + ',' + obj.location.lng +'&client_id=' + 
foursquare_client_id + '&client_secret=' + foursquare_client_secret + 
'&v=20160118' + '&query=' + obj.title;	
$.ajax({
url:FSquareURL,
dataType:'json',
async: true
}).done(function(data){
    var answer = data.response.venues[0];
    var index = Places.indexOf(obj);
    if(answer.url)
    	Places[index].url= answer.url;

    if(answer.id)
    	Places[index].id= answer.id;

    if(answer.contact.phone)
    	Places[index].phone= answer.contact.phone;
    if(answer.contact.facebookUsername)
    	Places[index].facebook= answer.contact.facebookUsername;

    if(answer.location.formattedAddress[0])
    	Places[index].address= answer.location.formattedAddress[0];
    if(answer.location.formattedAddress[1])
    	Places[index].address+= "  "+answer.location.formattedAddress[1];
    if(answer.location.formattedAddress[2])
    	Places[index].address+= "  "+answer.location.formattedAddress[2];
    if(answer.location.formattedAddress[3])
    	Places[index].address+= "  "+answer.location.formattedAddress[3];
    if(answer.location.formattedAddress[4])
    	Places[index].address+= "  "+answer.location.formattedAddress[4];
}).fail(function() {
    alert("Error with the Foursquare API call. Please"+
        " refresh the page and try again.");
});

}; // end of foursquareAjax definition


// Iterate  places to get information from foursquare api 
for (var i = 0; i < Places.length; i++) {
    foursquareAjax(Places[i]);
}

// to get place photo , use flickrAjax api
var flickrAjax = function(obj) {
        $.ajax({
            url: 'https://api.flickr.com/services/rest/?method=flickr' +
            '.photos.search&format=json&nojsoncallback=1&api_key='+ flickrApi +
            '&per_page=3&extras=url_s&text=' + obj.title,
            dataType: 'json',
            async: true
        }).done(function(data) {
            var index = Places.indexOf(obj);
            data.photos.photo.forEach(function(obj) {
               Places[index].photos.push(obj.url_s);
            });
        }).fail(function() {
            alert('error loading photos');
        });
};


// Iterate  places to get photos from  flickrAjax api
for (var i = 0; i < Places.length; i++) {
    flickrAjax(Places[i]);
}


// initializing the map and  load  its data

function initMap() 
{
    map = new google.maps.Map(document.getElementById('map'),
    {
      center: Places[0].location,
	  styles: styles,
      zoom: 8,
    }); // end of map creation 

    infowindow = new google.maps.InfoWindow();

    // Iterate over all places to create marker for each each location
    Places.forEach(function(place)
    {

	// create Marker object and set marker data for every place  
        var marker = new google.maps.Marker(
        {
                position: place.location,
                map: map,
                animation: google.maps.Animation.DROP,
                title: place.title,
                id: place.id,
            });

         // listen to click event and when happen fire the following anonymous
        // function which will  show information window about the place
        marker.addListener('click', function()
        {
            // change the marker to a new custom one
            var customeMarker = newCustomeMarker(this);
            // add bounce animation to the marker for 10 seconds
            bounce(customeMarker,'');
            // Changes the center of the map to the marker position
            map.panTo(customeMarker.position);
            
            // get the equivelant data for that marker position 
            // by filtering Places and if place.title = marker.title 
            // return its data 
            var data = Places.filter(function(item, index) 
                { return item.title == customeMarker.title; });
            // is there is no photo for that place , grap photos from flickr api
            if (data[0].photos === []) 
            {
                flickrAjax(data);
            }


			// set the marker peoperety on info window so it is not created again 
			infowindow.marker = marker;

			// start parse the data from the data already stored by default or by
    		// foursquare or flickr apito determine what we see before
   			 var innerHTML = setInfoWindowContents(data[0]);

			infowindow.setContent(innerHTML);
			infowindow.open(map,customeMarker);

			// make sure that the marker peoperety is cleared if the infowindow is closed
			infowindow.addListener('closeclick',function(){
    	    stopMarkerAnimation(customeMarker);
			infowindow.marker = null; });
     
		}); // end of add listener 

 		// saveing marker in globle varible to call inside the modelview
    	 markers.push(marker);

    }); // end of foreach
        
} //end initMap


// enabling the functionality of separatiuon concerns by using knockoutjs MVVM 
function viewModal() {
    var self = this;

    // boservable element for entered input for filter
    self.filteredElement = ko.observable('');
    // observable array for locations 
    self.locations = ko.observable(Places);

    // show information window for the selected location and change 
    // the center of the map to this element using panTo

    self.showInfoWindow = function(item)
     {
        self.filteredElement(item.title);

        // search markers array to get the equivelant marker for this item
         	markers.forEach(function(marker){
            if (marker.title != item.title)
            {
                marker.setMap(null);
            }
            else
             {

                var customeMarker = newCustomeMarker(marker);
                customeMarker.setMap(map);
                map.panTo(customeMarker.position);
                bounce(customeMarker,'forever');
                var innerHTML= setInfoWindowContents(item);
                infowindow.setContent(innerHTML);
                infowindow.open(map, customeMarker);
                
                // make sure that the marker peoperety is cleared if the infowindow is closed
                infowindow.addListener('closeclick',function()
                {
                stopMarkerAnimation(customeMarker);
                infowindow.marker = null;
                });

            }

         	});

    };

    self.ListFilter = function() {

        // using filter from undersore lib to make array of object that have the keword
        var FilteringPlaces = _.filter(Places, function(obj)
        {
            if (obj.title.toLowerCase().indexOf(
                self.filteredElement().toLowerCase()) > -1) 
            {
                return obj;
            }
        });
        
        // now filtering markers that match the keword
        var FilteringMarkers = _.filter(markers, function(obj)
        {
            if (obj.title.toLowerCase().indexOf(
                self.filteredElement().toLowerCase()) > -1)
            {
                return obj;
            }
        
        });

        // close info window when filter applied
        infowindow.close();

        // removing all marker
        markers.forEach(function(marker) {
            marker.setMap(null);
        });

        // set markers that match the keword on the map
        for(var i=0 ; i < FilteringMarkers.length ; i++)
        {
            FilteringMarkers[i].setMap(map);
            FilteringMarkers[i].setAnimation(google.maps.Animation.DROP);
        }

        // apply the filter on the view list
        self.locations(FilteringPlaces);
       
        
        if (self.locations().length === 0)
        {
            markers.forEach(function(marker) {marker.setMap(map);});
        }
    };

	}
	// handle error of google map loading
	function error() {
    alert("there is something wrong , please try again ");

	}

	// binding with View Model 
	ko.applyBindings(new viewModal());