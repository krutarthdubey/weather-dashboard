// ===== API =====
const apiKey="e1f97d62a1dabf190df3cefb08c2e186";

// ===== ELEMENTS =====
const searchBtn=document.getElementById("searchBtn");
const cityInput=document.getElementById("cityInput");
const message=document.getElementById("message");
const weatherCard=document.getElementById("weatherCard");
const cityName=document.getElementById("cityName");
const temperature=document.getElementById("temperature");
const description=document.getElementById("description");
const humidity=document.getElementById("humidity");
const windSpeed=document.getElementById("windSpeed");
const locationBtn=document.getElementById("locationBtn");
const forecastContainer=document.getElementById("forecastContainer");
const toggleTemp=document.getElementById("toggleTemp");
const weatherAlert=document.getElementById("weatherAlert");
const recentDropdown=document.getElementById("recentDropdown");

let currentWeatherData=null;
let forecastData=[];
let isCelsius=true;

// ===== SEARCH =====
searchBtn.onclick=()=>{
 const city=cityInput.value.trim();
 if(!city)return showMessage("Enter city");
 fetchWeather(city);
};

// ===== GEOLOCATION =====
locationBtn.onclick=()=>{
 navigator.geolocation.getCurrentPosition(pos=>{
  fetchWeatherByCoords(pos.coords.latitude,pos.coords.longitude);
 });
};

// ===== FETCH WEATHER =====
async function fetchWeather(city){

 showMessage("Loading...");

 const res=await fetch(
`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
 );

 const data=await res.json();

 if(data.cod!==200)return showMessage(data.message);

 displayWeather(data);
 fetchForecast(data.coord.lat,data.coord.lon);
 saveRecentCity(data.name);
}

// ===== COORD WEATHER =====
async function fetchWeatherByCoords(lat,lon){

 const res=await fetch(
`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
 );

 const data=await res.json();

 displayWeather(data);
 fetchForecast(lat,lon);
}

// ===== FORECAST =====
async function fetchForecast(lat,lon){

 const res=await fetch(
`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
 );

 const data=await res.json();

 displayForecast(data);
}

// ===== DISPLAY WEATHER =====
function displayWeather(data){

 currentWeatherData=data;

 weatherCard.classList.remove("hidden");
 message.classList.add("hidden");

 cityName.innerText=data.name;

 temperature.innerText=
`Temperature: ${convertTemp(data.main.temp)}`;

 humidity.innerText=`Humidity: ${data.main.humidity}%`;
 windSpeed.innerText=`Wind Speed: ${data.wind.speed} m/s`;
 description.innerText=data.weather[0].description;

 checkExtremeTemperature(data.main.temp);
 updateTheme(data.weather[0].main);
 updateWeatherAnimation(data.weather[0].main);

 document.getElementById("weatherIcon").src=
`https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;

 document.getElementById("weatherIcon").classList.remove("hidden");

}

// ===== DISPLAY FORECAST =====
function displayForecast(data){

 forecastData=data.list;
 forecastContainer.innerHTML="";

 const daily=data.list.filter(item=>item.dt_txt.includes("12:00:00"));

 daily.slice(0,5).forEach(day=>{

  const div=document.createElement("div");
  div.className="forecast-card";

  const date=new Date(day.dt_txt);
  const dayName=date.toLocaleDateString("en-US",{weekday:"short"});

  div.innerHTML=`
   <h3>${dayName}</h3>
   <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png"/>
   <p>${convertTemp(day.main.temp)}</p>
   <p>💧 ${day.main.humidity}%</p>
  `;

  forecastContainer.appendChild(div);
 });
}

// ===== TEMP CONVERSION =====
function convertTemp(temp){
 return isCelsius
 ? temp.toFixed(1)+"°C"
 : ((temp*9/5)+32).toFixed(1)+"°F";
}

// ===== TOGGLE =====
toggleTemp.onclick=()=>{
 isCelsius=!isCelsius;
 displayWeather(currentWeatherData);
 displayForecast({list:forecastData});
};

// ===== BACKGROUND THEME =====
function updateTheme(weather){

 const body=document.getElementById("appBody");

 body.className=
"min-h-screen transition-all duration-1000 ease-in-out bg-gradient-to-br animate-gradient";

 switch(weather.toLowerCase()){

 case"clear":
  body.classList.add("from-yellow-300","to-orange-400");
 break;

 case"clouds":
  body.classList.add("from-gray-400","to-gray-600");
 break;

 case"rain":
  body.classList.add("from-blue-500","to-indigo-800");
 break;

 case"snow":
  body.classList.add("from-blue-100","to-white");
 break;

 default:
  body.classList.add("from-blue-300","to-blue-600");
 }
}

// ===== ALERT =====
function checkExtremeTemperature(temp){
 if(temp>40){
  weatherAlert.innerText="⚠ Extreme Heat Warning";
  weatherAlert.classList.remove("hidden");
 }
 else if(temp<5){
  weatherAlert.innerText="⚠ Extreme Cold Warning";
  weatherAlert.classList.remove("hidden");
 }
 else{
  weatherAlert.classList.add("hidden");
 }
}

// ===== MESSAGE =====
function showMessage(msg){
 message.innerText=msg;
 message.classList.remove("hidden");
}

// ===== RECENT SEARCH =====
function saveRecentCity(city){

 let cities=JSON.parse(localStorage.getItem("recentCities"))||[];

 if(!cities.includes(city))cities.unshift(city);

 cities=cities.slice(0,5);

 localStorage.setItem("recentCities",JSON.stringify(cities));

 loadRecentCities();
}

function loadRecentCities(){

 const cities=JSON.parse(localStorage.getItem("recentCities"))||[];

 if(!cities.length)return;

 recentDropdown.innerHTML="";

 cities.forEach(city=>{
  const item=document.createElement("div");
  item.innerText=city;
  item.onclick=()=>fetchWeather(city);
  recentDropdown.appendChild(item);
 });

 recentDropdown.classList.remove("hidden");
}

loadRecentCities();

function applySystemTheme(){

    const prefersDark =
        window.matchMedia("(prefers-color-scheme: dark)").matches;

    const body=document.getElementById("appBody");

    if(prefersDark){
        body.classList.add("dark-mode");
    }
}

applySystemTheme();

function updateWeatherAnimation(weather){

const container =
document.getElementById("weatherAnimation");

container.innerHTML=""; // clear previous

// ===== RAIN =====
if(weather==="Rain"||weather==="Drizzle"){

for(let i=0;i<80;i++){

const drop=document.createElement("div");
drop.className="raindrop";

drop.style.left=Math.random()*100+"%";
drop.style.animationDuration=
(Math.random()*1+0.5)+"s";

container.appendChild(drop);
}
}

// ===== SNOW =====
else if(weather==="Snow"){

for(let i=0;i<40;i++){

const snow=document.createElement("div");
snow.className="snowflake";
snow.innerText="❄";

snow.style.left=Math.random()*100+"%";
snow.style.animationDuration=
(Math.random()*5+5)+"s";

container.appendChild(snow);
}
}

// ===== CLEAR =====
else if(weather==="Clear"){

const sun=document.createElement("div");
sun.className="sun-glow";
container.appendChild(sun);
}
}