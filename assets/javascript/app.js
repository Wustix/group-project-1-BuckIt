$(document).ready(function () {

    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyCw_O1EhM4QcSa5NAqzoBq-FmzQMfmuwSQ",
        authDomain: "improved-buckit.firebaseapp.com",
        databaseURL: "https://improved-buckit.firebaseio.com",
        projectId: "improved-buckit",
        storageBucket: "",
        messagingSenderId: "574061591928"
    };
    firebase.initializeApp(config);

    var dataBase = firebase.database();


    // 2. Adding Info
    $("#sub-btn-home").on("click", function (event) {

        // Grabs user input and assign to variables
        var startDate = $("#input-start").val().trim();
        var endDate = $("#input-end").val().trim();
        var originCityState = $("#input-origin").val().trim();
        var originCountry = $("#originCountryInput-1").val().trim();
        var destinationCityState = $("#input-dest").val().trim();
        var destinationCountry = $("#originCountryInput-2").val().trim();

        console.log(startDate);
        console.log(endDate);
        console.log(originCityState);
        console.log(originCountry);
        console.log(destinationCityState);
        console.log(destinationCountry);

        // push this to firebase

        dataBase.ref().push({
            startdate: startDate,
            enddate: endDate,
            origincitystate: originCityState,
            origincountry: originCountry,
            destinationcitystate: destinationCityState,
            destinationcountry: destinationCountry
        });


        // text-boxes
        $("#input-start").val("");
        $("#input-end").val("");
        $("#input-origin").val("");
        $("#originCountryInput-1").val("");
        $("#input-dest").val("");
        $("#originCountryInput-2").val("");

        // Prevents page from refreshing
        return false;


    });


    dataBase.ref().on("child_added", function (childSnapshot) {
        var searchLocation = childSnapshot.val().destinationCity;


        $("#sub-btn-act").on("click", function () {
            jQuery.ajaxPrefilter(function (options) {
                if (options.crossDomain && jQuery.support.cors) {
                    options.url = 'https://cors-anywhere.herokuapp.com/' + options.url;
                }
            });

            //Yelp API
            var searchTerm = $('#list-input').val().trim(); //may need to change the code of what the variable is equal to
            // var searchLocation = childSnapshot.val().destinationCity; //may need to change based on firebase
            $('#list-input').val("");

            retrieveYelpResults(searchTerm, searchLocation).then(handleYelpSearchResults);

            function retrieveYelpResults(searchTerm, searchLocation) {

                var qURL = `https://api.yelp.com/v3/businesses/search?term=${encodeURIComponent(searchTerm)}&location=${encodeURIComponent(searchLocation)}&limit=8`;

                var token = 'KJ_7-uskE47z1-8JIMTR6ASNgy3sh0yzqZWxjlPwTNF8NzO4h2DFrVGiIcl5lz2Jp38QGWQbfzT1fLpR_K0DeD9FgdugoL33W_AM9DfcGAOPmfI6HvtpNguty4s1W3Yx'
                return $.ajax({
                    url: qURL,
                    method: "GET",
                    beforeSend: function (xhr, settings) { xhr.setRequestHeader('Authorization', 'Bearer ' + token); }

                })
            }

            function handleYelpSearchResults(responseYelp) {
                console.log(JSON.stringify(responseYelp, null, 2))
                //JSON.parse and usual .notation

                var results = responseYelp.businesses;

                for (var i = 0; i < results.length; i++) {

                    if (results[i].rating >= 2) {
                        var result = results[i];
                        var companyName = result.name;
                        var userRatings = result.rating;
                        var userPhone = result.phone;
                        var userPrice = result.price;
                        var url = result.url;


                    }

                    var p = $(`
                        <div class="card">
                            <div id="map${i}" style="height: 400px; width: 900px" align= "center"></div>
                            <div class="card-body">
                                <h5 class="card-title" id="business-name">Business Name</h5>
                                <p class="card-text" id="company-name">
                                    <a href=${url}>${companyName}</a>
                                </p>
                            </div>
                            <ul class="list-group list-group-flush">
                                <li class="list-group-item">
                                    <h5 id="business-1">User Ratings</h5>
                                    <p id="user-ratings">${userRatings}</p>
                                </li>
                                <li class="list-group-item">
                                    <h5 id="business-2">Phone</h5>
                                    <p id="phone-num">${userPhone}</p>
                                </li>
                                <li class="list-group-item">
                                    <h5 id="business-4">Price</h5>
                                    <p id="price">${userPrice}</p>
                                </li>
                            </ul>
                            <div class="card-body">
                                <button type="submit" class="btn btn-primary" id="buckit-add-btn">Add to Bucket</button>
                            </div>
                        </div>`);

                    $(".card-magic").append(p);

                    var latitude = result.coordinates.latitude;
                    var longitude = result.coordinates.longitude;
                    var map = new google.maps.Map(document.getElementById(`map${i}`), {

                        center: { lat: latitude, lng: longitude },
                        zoom: 12
                    });
                    new google.maps.Marker({ position: { lat: latitude, lng: longitude }, map: map })

                }
            };

            $("#reset").on("click", function () {
                window.location.reload();
            });

        });

        $("#sub-btn-act-1").on("click", function () {
            event.preventDefault();
            var newInfo = $("#list-input-1").val().trim();
            console.log(newInfo);

            $("#list-input-1").val("");

            $("tbody").append('<tr><td><id="checkbox-list"><input type="checkbox" name="myCheckbox" id="check-list">' + newInfo + "</td>");

            $('#checkbox-list').change(function () {

                if (this.checked) {
                    $(this).closest('tr').find('td>span').css("text-decoration", "line-through");
                };

            })

        });

        //google maps api

        var cityDestination = "LA";
        var stateDestination = "CA";


        retrieveLocation(cityDestination, stateDestination).then(handleGoogleMapResult)

        //}) 
        //setting up function to retrieve the location for the ajax call
        function retrieveLocation(cityDestination, stateDestination) {
            var queryURL = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(cityDestination)},${encodeURIComponent(stateDestination)}&key=AIzaSyA0HQaRbr6NXHKenj20jrG3CoOFqBU5j5I`;
            //ajax call for google maps API
            return $.ajax({
                url: queryURL,
                method: "GET",
            })
        }
        //function to pass our ajax call response into handleGoogleMapsResult
        function handleGoogleMapResult(response) {
            console.log(JSON.stringify(response, null, 2))
        }


    });





});