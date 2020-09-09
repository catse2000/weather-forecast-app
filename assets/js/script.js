//global variables
var searchFormEl = document.querySelector("#search-input-query");
var searchInputEl = document.querySelector("#search-input");
var forecastContainerEl = document.querySelector("#forecast-future-list");
var cityHistoryListEl = document.querySelector("#search-history-list");
var cities = [];

//called when application loads
var loadHistory = function(){
    //check if the geolocation API exists
    if (navigator.geolocation){
        // Request the current position
        navigator.geolocation.getCurrentPosition(getPosSuccess, getPosErr);
    }
    else{
        alert("GeoLocation does not work on this browser");
    }

    function getPosSuccess(pos){
        var geoLat = pos.coords.latitude.toFixed(5);
        var geoLng = pos.coords.longitude.toFixed(5);
        var geoAcc = pos.coords.accuracy.toFixed(1);
        var location = "https://nominatim.openstreetmap.org/reverse?lat=" + geoLat + "&lon=" + geoLng + "&zoom=10&format=json";
        
        fetch(location).then(function(response){
            if(response.ok){
                response.json().then(function(data){
                    getWeather(data.address.city);
                })
            }
            else{
                alert("Error: " + response.statusText);
            }
        })
        .catch(function(error){
            alert("Unable to retrieve Weather Data for your area at this time");
        })
    };

    function getPosErr(err){
        switch (err.code){
            case err.PERMISSION_DENIED:
                alert("User denied the request for Geolocation");
                break;
            case err.POSITION_UNAVAILABLE:
                alert("Location information is unavailable.");
                break;
            case err.TIMEOUT:
                alert("The request to get user location timed out.");
                break;
            default:
                alert("An unknown error occurred.");
        }
    }

    cities = JSON.parse(localStorage.getItem("cities")); // pull local storage and place in array

    if(cities === null){ //check if storage is empty
        cities = []; //if storage is empty, initialize array
        return false;
    }
    else{
        for (var i = 0; i < cities.length; i++) // call addCityHistory function if cities has values
        {
            addCityHistory(cities[i]);
        }
    }

    
};
    

// generates <li> elements and appends to <ul> element on index.html to show history of cities searched
var addCityHistory = function (city){
    var cityHistoryListItemEl = document.createElement("li");
    cityHistoryListItemEl.className = "list-group-item";
    cityHistoryListItemEl.id = "search-history-item";
    var cityHistoryLinkEl = document.createElement("a");
    cityHistoryLinkEl.setAttribute("href", "#");
    cityHistoryLinkEl.className = "history-link";
    cityHistoryLinkEl.textContent = city;
    cityHistoryLinkEl.addEventListener("click", eventHandler);
    cityHistoryListItemEl.appendChild(cityHistoryLinkEl);
    cityHistoryListEl.appendChild(cityHistoryListItemEl);
    

};

// populates today's weather based on city entered
var getWeather = function(city) {
    //format the weather link
    var apiUrlPresent = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial&appid=9e1fdaa540fdf17e456714b519cc5694";
    //generate url for future weather
    var apiUrlFuture = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&units=imperial&appid=9e1fdaa540fdf17e456714b519cc5694";

    //fetch data for present weather
    fetch(apiUrlPresent).then(function(response){
        if(response.ok){
            response.json().then(function(data){
                console.log(data);
                displayPresentWeather(data, city);
            });
        }
        else{
            alert("Error: " + response.statusText);
        }

    })
    .catch(function(error){ //if an error returns provide this alert
        alert("Unable to retrieve Weather Data for your area at this time");
    })

    //fetch data for future weather
    fetch(apiUrlFuture).then(function(response){
        if(response.ok){
            response.json().then(function(data){
                displayFutureWeather(data, city);
            })
        }
        else{
            alert("Error: " + response.statusText);
        }
    })
    .catch(function(error){
        alert("Unable to retrieve Weather Data for your area at this time");
    })

};

// function called when the "search" button is called
var searchHandler = function(event) {
    event.preventDefault();
    
    // get value from input element
    var cityName = searchInputEl.value.trim();

    //if cityname has a value, start getWeather function
    if(cityName) {
        getWeather(cityName);
        searchInputEl.value = "";
    }
    else{
        alert("Please enter a city");
    }


};

// function to take values provided through fetch and show them on screen
var displayPresentWeather = function(info, searchTerm){
    if (info.length === 0){
        alert("There is nothing to show");
    }

    // Create title for present weather using city that was entered, today's date, and icon from current weather
    var cityTitle = document.querySelector("#forecast-cityName"); //store value for element that will hold city name
    var rawDate = info.dt; //get today's date from current weather fetch
    var convertedDate = new Date(rawDate * 1000).toLocaleDateString("en-US"); //convert date to MM/DD/YYYY format
    var presentWeatherIcon = document.createElement("img"); //create element to store icon
    presentWeatherIcon.setAttribute("src", "https://api.openweathermap.org/img/w/" + info.weather[0].icon + ".png"); //set src based on icon acquired from fetch

    //display information in title
    cityTitle.textContent = searchTerm + " (" + convertedDate + ") ";
    cityTitle.appendChild(presentWeatherIcon);

    //store elements in variables that will display temp, humidity, and wind speed
    var presentTemp = document.querySelector("#forecast-present-temp");
    var presentHumidity = document.querySelector("#forecast-present-humidity");
    var presentWindSpeed = document.querySelector("#forecast-present-speed");
    
    //display information for temp, humidity and wind speed
    presentTemp.innerHTML = info.main.temp + " &#176;";
    presentHumidity.textContent = info.main.humidity + " %";
    presentWindSpeed.textContent = info.wind.speed + " MPH";

    // call function to get UV Index and display 
    getUVIndex(info); 

    //Push the searchTerm into the array
    cities.push(searchTerm);

    //Push the array into local storage
    storeHistory(cities);

    //Generate a <li> element under history with the textContent of searchTerm
    addCityHistory(searchTerm);
};

// get UV Index from UV Index fetch
var getUVIndex = function (cityData){
    //acquire long and lat form current weather fetch
    var long = cityData.coord.lon;
    var lat = cityData.coord.lat;

    var url = "https://api.openweathermap.org/data/2.5/uvi?lat=" + lat + "&lon=" + long + "&appid=9e1fdaa540fdf17e456714b519cc5694&";

    //make a fetch request to the url
    fetch(url).then(function(response){
        if(response.ok){
            response.json().then(function(data){
                var uv = data.value;
                var presentUVIndex = document.querySelector("#forecast-present-uv");

                //determine what color UV Index is based on value
                if (uv < 5)
                {
                    presentUVIndex.className = "yellow";
                }
                else if (uv > 5 && uv <= 7)
                {
                    presentUVIndex.className = "orange";
                }
                else if (uv > 7 && uv <= 10)
                {
                    presentUVIndex.className = "red";
                }
                else if(uv > 10)
                {
                    presentUVIndex.className = "violet";
                }

                presentUVIndex.textContent = uv;
            });
        }
        else{
            alert("Error: " + response.statusText);
        }

    })
    .catch(function(error){
        alert("Unable to retrieve Weather Data for your area at this time");
    })

}

// Display 5-day forecast
var displayFutureWeather = function(info, searchTerm){
    if (info.length === 0){ //if info doesn't have information, show an alert with an error
        alert("There is nothing to show");
    }

    //clear previous children from forecastContainer before adding new children
    clearForecastContainer();

    var time = ''; //variable to store time from fetch request
    
    //for loop to create 5 day forecast
    for(var i = 0; i < info.list.length; i++){
        time = info.list[i].dt_txt.substring(10).trim();
        if (time === "12:00:00"){
            var rawDate = info.list[i].dt; //acquire dates from 5-day forecast fetch
            var convertedDate = new Date(rawDate * 1000).toLocaleDateString("en-US"); //convert date to MM/DD/YYYY format
            var icon = info.list[i].weather[0].icon; //acquire icons from 5-day forecast fetch
            var temp = info.list[i].main.temp; //acquire temps from 5-day forecast fetch
            var humidity = info.list[i].main.humidity; //acquire humidity from 5-day forecast fetch

            //create elements to house info from 5-day forecast fetch
            var forecastCardEl = document.createElement("div");
            forecastCardEl.className = "card col-12 col-md-5 col-xl m-2 p-0 forecast-future-card";
            
            var forecastCardHeaderEl = document.createElement("p");
            forecastCardHeaderEl.className = "card-header";
            forecastCardHeaderEl.textContent = convertedDate;
            
            var forecastCardBodyEl = document.createElement("div");
            forecastCardBodyEl.className = "card-body";
            
            var forecastIcon = document.createElement("img");
            forecastIcon.setAttribute("src", "https://api.openweathermap.org/img/w/" + icon + ".png")
            
            var forecastTempPEl = document.createElement("p");
            forecastTempPEl.innerHTML = "Temp: " + temp + " &#176;";
            var forecastTempSpanEl = document.createElement("span");
            forecastTempSpanEl.id = "forecast-future-temp";
            forecastTempPEl.appendChild(forecastTempSpanEl);
            
            var forecastHumPEl = document.createElement("p");
            forecastHumPEl.textContent = "Humidity: " + humidity + " %";
            var forecastHumiditySpanEl = document.createElement("span");
            forecastHumiditySpanEl.id = "forecast-future-humidity";
            forecastHumPEl.appendChild(forecastHumiditySpanEl);

            //append 5-day cards and information to page
            forecastCardBodyEl.appendChild(forecastIcon);
            forecastCardBodyEl.appendChild(forecastTempPEl);
            forecastCardBodyEl.appendChild(forecastHumPEl);
            forecastCardEl.appendChild(forecastCardHeaderEl);
            forecastCardEl.appendChild(forecastCardBodyEl);
            forecastContainerEl.appendChild(forecastCardEl);
        }
    }
}

//used to clear forecastContainer to add new elements
var clearForecastContainer = function(){
    while(forecastContainerEl.firstChild){
        forecastContainerEl.removeChild(forecastContainerEl.firstChild);
    };
}

//store cities searched in local storage
var storeHistory = function(cityList){
    localStorage.setItem("cities", JSON.stringify(cityList));
};

// gather city from input and push to getWeather() function
var eventHandler = function(){
    var city = event.target.textContent;
    //generate url for present weather
    getWeather(city);
};

//Event Listenrs
searchFormEl.addEventListener("submit", searchHandler);
window.addEventListener("load", loadHistory);