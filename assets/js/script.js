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
    console.log(info);
    console.log(searchTerm);
};

searchFormEl.addEventListener("submit", searchHandler);