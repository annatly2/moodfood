$(document).ready(function(){

// UI Script
	//-----------------------------------------------------


$(document).ready(function(){
    $(".inner").addClass('animated fadeIn');
    });

$('.content').ready(function(){
	console.log('scroll')
	$(".wrapper").addClass('animated fadeLeft')
});


//Convert price from number into '$'
function priceRating(price) {
	if (price == 1) {
		return '$';
	}
	else if (price == 2) {
		return '$$';
	}
	else if (price == 3) {
		return '$$$';
	}
	else if (price == 4) {
		return '$$$$';
	}
}


// Utilities 
	//-----------------------------------------------

// Scroll to top of window on reload
window.onunload = function(){ window.scrollTo(0,0); }

// Typing automatically entered into 'mood-input'
$(document).bind('keydown',function(e){
        $('#mood-input').focus();
    
});

// Backend 
	//-----------------------------------------------

$(document).ready(function(){

    var fullAnswer;
    var mood;
    var foodCategory;
    var UserLatitude;
    var UserLongitude;


    //Function to get the user location
    function getLocation() {
        //Make sure the broswer supports the HTML 5 geolocation method.
        if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(setPosition);
        } else { 
            //We may also have to set a default UserLatitute and UserLongtitude here to 
            //make sure we don't error out if the the browser does not support geolocation.
            console.log("Geolocation is not supported by this browser.");
        }
    }

    //Sets User Latitude and Longitude
    function setPosition(position) {
        UserLatitude = position.coords.latitude
        UserLongitude = position.coords.longitude;
        
    }

    //Run the procedure to get the user's location.  
    //We need to to figure out what we are going to do if the user does not provide cordinates.
    //WE should probably set a default longitude and latitude.
    getLocation();

    
    $(document.body).on("click", "#add-mood", function() {
        event.preventDefault();
        setTimeout(goToByScroll, 1000);
        //Grab variable from mood-input and set to userInput
        var userInput = $("#mood-input").val().trim();

        //Clear mood-input
        $("#mood-input").val("");


        // Scroll down page
		 function goToByScroll(id){
		 $('html,body').animate({
		    scrollTop: $("#scroll").offset().top},
			'slow');
			};

		 // $(".scrolly").click(function(e) { 

		          // Call the scroll function
		        goToByScroll($(this).attr("id")); 
		        $(".content").addClass('animated fadeInLeft');
		    


        //Send a post to the indico API with userInput as the query text.
        $.post(
            'https://apiv2.indico.io/emotion',
            JSON.stringify({
                'api_key': "dd15f1435272ef7c533e411333a0e5bc",
                'data': userInput
            })
        //Make use of the returned data from indico API
        ).then(function(res) { 
            //Convert the response to JSON because it comes in as string.
            //response is now an object with values for anger, fear, joy, sadness
            //and surprise.  
            var response = JSON.parse(res);

            //This is unnecesary, but it helps for understanding the flow.
            var obj = response.results;

            //Using the reduce method, iterate through the response.results (aka obj) object
            //and return the key with the largest value.
            //We set mood to that key.
            mood = Object.keys(obj).reduce(function(a, b){ return obj[a] > obj[b] ? a : b })

            //We map our mood to the appropriate food category, and set the variable
            //foodCategory
            switch (mood) {
              case "anger":
                foodCategory = "Asian";
                break;
              case "fear":
                foodCategory = "Comfort Food";
                break;
              case "joy":
                foodCategory = "Mexican";
                break;
              case "sadness":
                foodCategory = "Vegan";
                break;
              case "surprise":
                foodCategory = "American";
            }

            console.log("Given that your mood is " + mood + " your food category will be " + foodCategory);
            console.log(UserLatitude);
            console.log(UserLongitude);
            
            //URL that we will use to search google for all restaurants that meet the following criteria:
            //Must be within 8000 meters, google max price of 2, and open now.  The results are ranked
            //by their prominense in google.
            var queryURL = "https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=" + UserLatitude + "," + UserLongitude + "&radius=8000&type=restaurant&keyword=" 
                + foodCategory + "&key=AIzaSyBVpclmUg26SON5iYqEAA51dlOHoZFTVrU&minprice=0&maxprice=2&opennow&rankby=prominence";

            $.ajax({
                url: queryURL, 
                method: "GET",
                dataType: "json"                 
            }).done(function(response) {
                //console.log(response);
                var name;
                var address; 
                var phone;
                var review;
                var price;
                var rating;
                var website;
                var mapsLink;

                var mapRefId;
                var mapLat;
                var mpalong;
                var streetviewURL;
                //We create a variable that tracks whether the answer has been selected or not.
                var answerSelected = false;
                var i = 0;

                //This do-while loop goes through our response array and will pick the first response
                //that is greater than 3.5.
                do {
                    //Set ratings variable to the rating of the restuarant from google
                    var rating = response.results[i].rating;
                    var placeId = response.results[i].place_id;
                    
                    //We set detailsURL as the URL we will submit to the Google Details API.
                    //This call will be to get extra details about our place of choice
                    var detailsURL = "https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/details/json?placeid=" + placeId + "&key=AIzaSyBVpclmUg26SON5iYqEAA51dlOHoZFTVrU";
                    

                    //If the location is 3.5 or above in rating,s then we select the location as our selectedAnswer
                    //We also set "answerSelected" to true. 
                    if (rating >= 3.5){
                        mapRefId = "https://www.google.com/maps/embed/v1/place?key=AIzaSyAn4jrYVjueQ31TgPibm7j0wKnbRNxtOFI&q=place_id:" + placeId;

                        $.ajax({
                            url: detailsURL, 
                            method: "GET",
                            dataType: "json"                 
                        })
                        .done(function(response) {
                            
                            name = response.result.name;
                            rating = response.result.rating;
                            price = response.result.price_level;
                            address = response.result.formatted_address;
                            phone = response.result.formatted_phone_number;
                            review = response.result.reviews[0].text;
                            website = response.result.website;
                            mapsLink = response.result.url;
                            mapLat = response.result.geometry.location.lat;
                            mpalong = response.result.geometry.location.lng;
                            streetviewURL = "https://www.google.com/maps/embed/v1/streetview?key=AIzaSyAn4jrYVjueQ31TgPibm7j0wKnbRNxtOFI&location=" 
                            + mapLat + "," + mpalong + "&heading=210&pitch=10&fov=90" 

                            //console.log(response);
                            console.log(name);
                            console.log(address);
                            console.log("Price Level: " + price);
                            console.log("Rating: " + rating);
                            console.log("Phone Number: " + phone);
                            console.log(review);
                            console.log(website);
                            var priceConvert = priceRating(price);
                            console.log(priceConvert);

                            $("#map-image").attr("src", mapRefId);
                            $("#street-view").attr("src", streetviewURL);
                            $("#restaurant-name").html(name + " <span class='label label-default' id='price'>" + priceConvert + "</span>");
                            $("#review").text(review);
                            $("#price").html(priceConvert);
                            $("#address-text").text(address);
                            $("#address-link").attr("href", mapsLink);
                            $("#map").attr("href", mapsLink);
                            $("#phone").attr("href", "tel: " + phone);
                            $("#number").text(phone)
                            $("#website").attr("href", website);

                        });
                        answerSelected = true;
                    }
                    i++;
                }while (answerSelected === false);
            });

        });
    });

});

});

