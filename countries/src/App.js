import { useState, useEffect } from 'react'
import axios from 'axios'

// Filter for searching countries
const Filter = ({ value, onChange }) => <div>Find countries: <input value={value} onChange={onChange} /></div>
// Show button
const Select = ({ value, handleSelect }) => <button onClick={() => handleSelect({ value })}>Show</button>
// Country information
const Country = ({ country }) => {
  return (
    <div>
      <h2>{country.name.common}</h2>
        <div>Capital: {country.capital[0]}</div>
        <div>Area: {country.area}</div>
        <h3>languages</h3>
        <ul>
          {Object.values(country.languages).map(lan => 
            <li key={lan}>{lan}</li>  
          )}
        </ul>
        <img src={country.flags.png} />
    </div>
  )
}
// Weather information
const Weather = ({ country }) => {
  const [weather, setWeather] = useState()
  const api_key = process.env.REACT_APP_API_KEY
  const locURL = (cap, key) => `http://api.openweathermap.org/geo/1.0/direct?q=${cap}&limit=1&appid=${key}`
  const weatherURL = (lat, lon, key) => `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}`
  const iconURL = (icon) => `http://openweathermap.org/img/wn/${icon}@2x.png`

  console.log(api_key)

  useEffect(() => {
    // First get capital location
    axios
      .get(locURL(country.capital[0], api_key))
      .then(response => {
        const lat = response.data[0].lat
        const lon = response.data[0].lon
        // Then get weather after first promise is fullfilled
        axios
          .get(weatherURL(lat, lon, api_key))
          .then(response => {
            setWeather(response.data)
          })
      })
  }, [])

  if (!weather) {
    return <div>Loading weather information...</div>
  } else {
    return (
      <div>
        <h3>Weather in {country.capital[0]}</h3>
        <div>Temperature: {(weather.main.temp - 273.15).toFixed(2)} Celsius</div>
        <img src={iconURL(weather.weather[0].icon)} />
        <div>Wind: {weather.wind.speed} m/s</div>
      </div>
    )
  }
}
// Object that renders correct country data depending on the amount of countries
const Countries = ({ activeCountries, handleSelect }) => {
  if (activeCountries.length === 0) {
    return <div>Search countries by typing name</div>
  } else if (activeCountries.length === 1) {
    const country = activeCountries[0]
    return(
      <div>
        <Country country={country} />
        <Weather country={country} />
      </div>
    )
  } else if (activeCountries.length < 11) {
    return (
      <div>
        {activeCountries.map(country =>
          <div key={country.name.common}>
            {country.name.common} <Select key={country.name.common} value={country} handleSelect={handleSelect} />
          </div>
        )}
      </div>
    )
  } else {
    return (
      <div>
        Too many matches, specify another filter
      </div>
    )
  }
}

const App = () => {
  // Hooks
  const [data, setData] = useState([])
  const [filter, setFilter] = useState('')
  const [activeCountries, setCountries] = useState([])

  // Event handlers
  const handleFilterChange = (event) => {
    setFilter(event.target.value.toLowerCase())
    setCountries(data.filter(countrie => countrie
      .name
      .common
      .toLowerCase()
      .includes(event.target.value)))
  }
  const handleSelect = ({ value }) => {
    setFilter(value.name.common.toLowerCase())
    setCountries(data.filter(countrie => countrie
      .name
      .common
      .toLowerCase()
      .includes(value.name.common.toLowerCase())))
  }

  // Get countries data from restcountries.com
  useEffect(() => {
    axios
      .get('https://restcountries.com/v3.1/all')
      .then(response => {
        const data = response.data
        setData(data)
      })
  }, [])

  // Returned web application
  return (
    <div>
      <Filter value={filter} onChange={handleFilterChange} />
      <Countries activeCountries={activeCountries} handleSelect={handleSelect} />
    </div>
  );
}

export default App;
