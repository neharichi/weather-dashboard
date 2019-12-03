// This is our API key
var APIKey = "6912191e5e234892da8634646e776c9d"; //remove later

function getCityWeather(searchCity) {
   
   window.alert(searchCity);
    if (searchCity==""){    
        window.alert("Please specify city in search box");
        return;
      }    



    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + searchCity + ",USA&appid=" + APIKey;

    // Here we run our AJAX call to the OpenWeatherMap API
    $.ajax({
        url: queryURL,
        method: "GET",
        error: function (xhr, ajaxOptions, thrownError) {
            //var err=$("<span>"+xhr.status+"-"+thrownError+"</span>");
            if (xhr.status === 404) {
                window.alert("could not find weather data for city: "+ searchCity);
        return;
            }
        }
    })
        // We store all of the retrieved data inside of an object called "response"
        .then(function (response) {

            // // Log the queryURL
           console.log(queryURL);

            // // Log the resulting object
          // console.log(response);
            var iconcode = response.weather[0].icon;
            var iconurl = "https://openweathermap.org/img/wn/" + iconcode + "@2x.png";
            var date = new Date(response.dt * 1000).toLocaleDateString();

            var tempK = response.main.temp;
            var tempF = (((tempK - 273.5) * 1.80) + 32).toFixed(2);
            var ws = response.wind.speed;
            var wsmp = (ws * 2.237).toFixed(1);          

            var responseObj = {
                currentCity: response.name + " (" + date + ")",
                temperature: tempF + "",
                humidity: response.main.humidity + "%",
                windSpeed: wsmp + " MPH",
                uvIndex: GetUVIndex(response.coord.lon, response.coord.lat)
            };

            $("#currentCity").text(responseObj.currentCity).append("<img src=" + iconurl + ">");
            $("#temprature").text(responseObj.temperature);
            $("#humidity").text(responseObj.humidity);
            $("#windspeed").text(responseObj.windSpeed);
            forecast(response.id);

            if(response.cod==200){
                sCity=JSON.parse(localStorage.getItem("cname"));
               // console.log(sCity);
                if (sCity==null){
                    sCity=[];
                    sCity.push(response.name.toUpperCase());
                    localStorage.setItem("cname",JSON.stringify(sCity)); 
                    addToList(response.name);
                  
                 }
                 else{
                    if(find(response.name)>0){
                      sCity.push(response.name.toUpperCase());
                      localStorage.setItem("cname",JSON.stringify(sCity)); 
                      addToList(response.name);
                    }  
                 }
              }


        });
}

function GetUVIndex(ln, lt) {
    var qURL = "https://api.openweathermap.org/data/2.5/uvi?appid=" + APIKey + "&lat=" + lt + "&lon=" + ln;
    $.ajax({
        url: qURL,
        method: "GET"
    }).then(function (response) {
        $("#uvindex").text(response.value);

        
    });
}


// Displays 5 day forecast.
function forecast(cid) {
    $("#5DayForcast").empty();
    var dayover = false;

    var qURL = "https://api.openweathermap.org/data/2.5/forecast?id=" + cid + "&appid=" + APIKey;

    $.ajax({
        url: qURL,
        method: "GET"
    }).then(function (response) {

        for (i = 0; i < 5; i++) {
            var date = new Date((response.list[((i + 1) * 8) - 1].dt) * 1000).toLocaleDateString();
            var iconcode = response.list[((i + 1) * 8) - 1].weather[0].icon;
            var iconurl = "https://openweathermap.org/img/wn/" + iconcode + ".png";
            var tempK = response.list[((i + 1) * 8) - 1].main.temp;
            var tempF = (((tempK - 273.5) * 1.80) + 32).toFixed(2); 
            var humidity = response.list[((i + 1) * 8) - 1].main.humidity;

            var forcastDiv = $("<div class='col-sm-2 bg-primary forecast mr-4 mt-2 p-2 rounded'>");
            forcastDiv.append(" <p><span class='fheading' id='fDate" + i + "'>" + date + "</span></p>");
            forcastDiv.append("<p id='fImg'" + i + "><img src=" + iconurl + "></p>");
            forcastDiv.append("<p>Temp: <span id='fTemp'" + i + ">" + tempF + " &#8457" + "</span></p>");
            forcastDiv.append("<p>Humidity: <span id='fHumidity'+i>" + humidity + "%" + "</span></p>");
            forcastDiv.append("</div>");
            $("#5DayForcast").prepend(forcastDiv);
        }
    });
}

function loadCities(){
    $("ul").empty();
    var sCity=JSON.parse(localStorage.getItem("cname"));
    //console.log(sCity);
    if (sCity!==null){
     sCity=JSON.parse(localStorage.getItem("cname"));
     for(var i=0;i<sCity.length;i++){
       addToList(sCity[i]);
     }
     city=sCity[i-1];
     getCityWeather(city);
    }
  } 
  //Deletes the search history from page and the local storage.
  function deleteHistory(event){
    event.preventDefault();
    sCity=[];
    localStorage.removeItem("cname");
    document.location.reload();
  }

  function addToList(c){
    var lEl= $("<li><a href='#' onclick=\"return getCityWeather('" + c + "');\" target='_blank'>"+c.charAt(0).toUpperCase() + c.slice(1)+"</a></li>");   
    $(lEl).attr("class","list-group-item");
    $(lEl).attr("data-value",c.toUpperCase());
    $("ul").append(lEl); 
   }

   function invokePastSearch(event){
     var elEL=event.target;
     if (event.target.matches("li")){
        city=elEL.textContent.trim();
        getCityWeather(city);
     }
   }
   
  $(document).on("click",invokePastSearch);
  $(window).on("load",loadCities);
  $("#delete").on("click",deleteHistory);
  //$(positionButton).on("click",showPosition);

