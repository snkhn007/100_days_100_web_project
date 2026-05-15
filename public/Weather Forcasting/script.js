const getWeather = (city) => {
    cityName.innerHTML = city;

    fetch(`https://wttr.in/${city}?format=j1`)
        .then((response) => response.json())
        .then((response) => {
            console.log(response);

            temp.innerHTML =
                response.current_condition[0].temp_C;

            temp2.innerHTML =
                response.current_condition[0].temp_C;

            feels_like.innerHTML =
                response.current_condition[0].FeelsLikeC;

            humidity.innerHTML =
                response.current_condition[0].humidity;

            humidity2.innerHTML =
                response.current_condition[0].humidity;

            wind_speed.innerHTML =
                response.current_condition[0].windspeedKmph;

            wind_speed2.innerHTML =
                response.current_condition[0].windspeedKmph;

            wind_degrees.innerHTML =
                response.current_condition[0].winddirDegree;

            sunrise.innerHTML =
                response.weather[0].astronomy[0].sunrise;

            sunset.innerHTML =
                response.weather[0].astronomy[0].sunset;

            min_temp.innerHTML = "N/A";
            max_temp.innerHTML = "N/A";
        })

        .catch((err) => console.error(err));
};

submit.addEventListener("click", (e) => {
    e.preventDefault();
    getWeather(city.value);
});
