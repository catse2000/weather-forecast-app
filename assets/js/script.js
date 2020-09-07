var searchFormEl = document.querySelector("#search-input-query");
var searchInputEl = document.querySelector("#search-input");

var getWeather = function(city) {
    //format the weather link
    var apiUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=9e1fdaa540fdf17e456714b519cc5694";
    
    //make a request to the url
    fetch(apiUrl).then(function(response){
        if(response.ok){
            response.json().then(function(data){
                displayWeather(data, city);
            });
        }
        else{
            alert("Error: " + response.statusText);
        }

    })
    .catch(function(error){
        alert("Unable to retrieve Weather Data for your area at this time");
    })
};

var searchHandler = function(event) {
    event.preventDefault();
    
    // get value from input element
    var cityName = searchInputEl.value.trim();

    if(cityName) {
        getWeather(cityName);
        searchInputEl.value = "";
    }
    else{
        alert("Please enter a city");
    }
};

var displayWeather = function(info, searchTerm){
    if (info.length === 0){
        alert("There is nothing to show");
    }

    // Add city to h2 so user can see which city they searched
    var cityTitle = document.querySelector("#forecast-cityName");
    var todaysDate = moment().format("MM/DD/YYYY");
    var presentWeatherIcon = document.createElement("img");
    presentWeatherIcon.setAttribute("src", "https://api.openweathermap.org/img/w/" + info.weather[0].icon + ".png");

    cityTitle.textContent = searchTerm + " (" + todaysDate + ") ";
    cityTitle.appendChild(presentWeatherIcon);

    var presentTemp = document.querySelector("#forecast-present-temp");
    var presentHumidity = document.querySelector("#forecast-present-humidity");
    var presentWindSpeed = document.querySelector("#forecast-present-speed");
    var presentUVIndex = document.querySelector("#forecast-present-uv");
    console.log(info);
    

};

searchFormEl.addEventListener("submit", searchHandler);