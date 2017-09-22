$(document).ready(function(){

    var fullAnswer;
    
    $(document.body).on("click", "#add-mood", function() {

        
        //Prevent clicking on the page from being submitted to a "server"
        event.preventDefault();

        //Grab the value from the form and set it to our variable called category
        var category = $("#mood-input").val().trim();
        
        //This is our URL for calling the google search API.  This API call is used to find all restuarants
        //that are with 10 miles from class, have a min and max price, and is open now.
        //We also rank the results based on prominence
        var queryURL = "https://cors.io/?https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=32.8392423,-117.1918068&radius=16000&type=restaurant&keyword=" +
          category + "&key=AIzaSyBVpclmUg26SON5iYqEAA51dlOHoZFTVrU&minprice=0&maxprice=3&opennow&rankby=prominence";
        
        //This is the initial ajax call to the google places search.
        $.ajax({
                url: queryURL, 
                method: "GET",
                dataType: "json"                 
                })
            //Here we get the response from Google searches
            .done(function(response) {
           
                //We create a variable for selectedAnswer that will store our resturant of choice.
                var selectedAnswer;
                //Creates variables to hold the address, phone, review (first one listed), website
                var address; 
                var phone;
                var review;
                var website;
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
                    var detailsURL = "https://cors.io/?https://maps.googleapis.com/maps/api/place/details/json?placeid=" + placeId + "&key=AIzaSyBVpclmUg26SON5iYqEAA51dlOHoZFTVrU";

                    //If the location is 3.5 or above in rating,s then we select the location as our selectedAnswer
                    //We also set "answerSelected" to true. 
                    if (rating >= 3.0){
                            
                            selectedAnswer = response.results[i].name;
                                                      
                            $.ajax({
                                url: detailsURL, 
                                method: "GET",
                                dataType: "json"                 
                            })
                            //Log the details of our selected answer.
                            .done(function(response) {
                                    fullAnswer = response;
                                    address = response.result.formatted_address;
                                    phone = response.result.formatted_phone_number;
                                    review = response.result.reviews[0].text;
                                    website = response.result.website;
                                    console.log(fullAnswer);
                                    console.log(response.result.name);
                                    console.log(response.result.rating);
                                    console.log(response.result.formatted_address);
                                    console.log(phone)
                                    console.log(review);
                                    console.log(website);
                                //updates title in HTML
                                $(".food-title").html(selectedAnswer);
                                //updates rating picture in HTML
                                if (3.0 <= rating >= 3.9){
                                    $("#food-stars").attr("src", "assets/images/3stars.png");
                                } else if (4.0 <= rating >= 4.9){
                                    $("#food-stars").attr("src", "assets/images/4stars.png");
                                } else if (rating >= 5.0) {
                                    $("#food-stars").attr("src", "assets/images/5stars.png");
                                } else {
                                    $("#food-stars").attr("src", "assets/images/4stars.png");
                                }
                                //updates address in HTML
                                $("#food-address").html(address);
                                //updates phone number in HTML
                                $("#food-phone-number").html(phone);
                                //updates food text in HTML with a review
                                $("#food-text").html(review);
                                //updates the website in HTML
                                $("#food-website").attr("href",website);

                             });
                            answerSelected = true;
                        }
                    i++;
                }
                //Stops the loop once we have an answer selected.
                while (answerSelected === false);


            })           
         }); 
         
         

    });
