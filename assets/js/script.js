var searchFormEl = document.querySelector("#search-input-query");
var searchInputEl = document.querySelector("#search-input");
var forecastContainerEl = document.querySelector("#forecast-future-list");
var cityHistoryListEl = document.querySelector("#search-history-list");
var cities = [];

var loadHistory = function(){
    var savedCities = localStorage.getItem("cities");

    if(savedCities === null){
        return false;
    }

    savedCities = JSON.parse(savedCities);

    for (var i = 0; i < savedCities.length; i++)
    {
        var cityHistoryListItemEl = document.createElement("li");
        cityHistoryListItemEl.className = "list-group-item";
        cityHistoryListItemEl.id = "search-history-item";
        var cityHistoryLinkEl = document.createElement("a");
        cityHistoryLinkEl.className = "history-link";
        cityHistoryLinkEl.textContent = savedCities[i];
        cityHistoryListItemEl.appendChild(cityHistoryLinkEl);
        console.log(cityHistoryListItemEl);
        cityHistoryListEl.appendChild(cityHistoryListItemEl);
    }


};

var getWeather = function(city) {
    //format the weather link
    var apiUrlPresent = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial&appid=9e1fdaa540fdf17e456714b519cc5694";
    var apiUrlFuture = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&units=imperial&appid=9e1fdaa540fdf17e456714b519cc5694";

    //make a request to the url
    fetch(apiUrlPresent).then(function(response){
        if(response.ok){
            response.json().then(function(data){
                displayPresentWeather(data, city);
            });
        }
        else{
            alert("Error: " + response.statusText);
        }

    })
    .catch(function(error){
        alert("Unable to retrieve Weather Data for your area at this time");
    })

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

    cityHistory(city);
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

var displayPresentWeather = function(info, searchTerm){
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
    
    presentTemp.innerHTML = info.main.temp + " &#176;";
    presentHumidity.textContent = info.main.humidity + " %";
    presentWindSpeed.textContent = info.wind.speed + " MPH";
    getUVIndex(info); 

};

var getUVIndex = function (cityData){
    var long = cityData.coord.lon;
    var lat = cityData.coord.lat;

    var url = "https://api.openweathermap.org/data/2.5/uvi?lat=" + lat + "&lon=" + long + "&appid=9e1fdaa540fdf17e456714b519cc5694&";

    //make a request to the url
    fetch(url).then(function(response){
        if(response.ok){
            response.json().then(function(data){
                var uv = data.value;
                var presentUVIndex = document.querySelector("#forecast-present-uv");

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

var displayFutureWeather = function(info, searchTerm){
    if (info.length === 0){
        alert("There is nothing to show");
    }

    clearForecastContainer();

    var array = {};
    var time = '';
    for(var i = 0; i < info.list.length; i++){
        time = info.list[i].dt_txt.substring(10).trim();
        if (time === "12:00:00"){
            var rawDate = info.list[i].dt;
            var convertedDate = new Date(rawDate * 1000).toLocaleDateString("en-US");
            var icon = info.list[i].weather[0].icon;
            var temp = info.list[i].main.temp;
            var humidity = info.list[i].main.humidity;

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

var cityHistory = function(searchTerm){
    cities.push(searchTerm);
    storeHistory(cities);
};

var storeHistory = function(cityList){
    localStorage.setItem("cities", JSON.stringify(cityList));
};

searchFormEl.addEventListener("submit", searchHandler);
window.addEventListener("load", loadHistory);