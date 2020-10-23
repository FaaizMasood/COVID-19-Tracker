import React, { useState, useEffect } from "react";
import "./App.css";
import {
  MenuItem,
  FormControl,
  Select,
  Card,
  CardContent,
} from "@material-ui/core";
import InfoBox from "./InfoBox.js";
import Map from "./Map.js";
import Table from "./Table.js";
import { sortData, prettyPrintStat } from "./util.js";
import LineComponent from "./LineComponent.js";
import "leaflet/dist/leaflet.css";

function App() {
  // State is a variable in react
  const [countries, setCountries] = useState([]);
  // remember which option we selected
  const [country, setCountry] = useState("worldwide");
  //
  const [countryInfo, setCountryInfo] = useState({});
  //
  const [tableData, setTableData] = useState([]);
  //
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapZoom, setMapZoom] = useState(3);
  //
  const [mapCountries, setMapCountries] = useState([]);
  //
  const [casesType, setCasesType] = useState("cases");

  // useEffect is a very powerfull piece of code (hook in react) that runs based on a given condition
  useEffect(() => {
    // will learn when the components loads , this runs only once if the [] is empty , if [] has a variable , it loads when that variable changes
    // we needs to run async function -> send a request, wait for it, do something with it
    const getCountriesData = async () => {
      await fetch("https://disease.sh/v3/covid-19/countries")
        .then((response) => response.json())
        .then((data) => {
          const countries = data.map((country) => ({
            name: country.country, // United States, United Kingdom
            value: country.countryInfo.iso2, // UK,USA,FR
          }));
          const sortedData = sortData(data);
          setTableData(sortedData);
          setMapCountries(data);
          setCountries(countries);
        });
    };
    getCountriesData();
  }, []);
  // // //
  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
      .then((response) => response.json())
      .then((data) => {
        setCountryInfo(data);
      });
  }, []);
  // // //
  const onCountryChange = async (event) => {
    const countryCode = event.target.value; // go and grab the value he clicked
    //console.log("yoooo", countryCode)
    //setCountry(countryCode);
    // when select the country , get its data, pull the information for that country
    const url =
      countryCode === "worldwide"
        ? "https://disease.sh/v3/covid-19/all"
        : `https://disease.sh/v3/covid-19/countries/${countryCode}`;

    // now we need to call this
    await fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setCountry(countryCode);
        setCountryInfo(data);
        console.log(data.countryInfo.lat);
        setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
        setMapZoom(4);
      });
  };
  // // //
  return (
    <div className="app">
      <div className="app__left">
        {/* Header */}
        <div className="app__header">
          <h1> Covid 19 Tracker By Faaiz Masood</h1>
          <FormControl className="app__dropdown">
            <Select
              variant="outlined"
              value={country}
              onChange={onCountryChange}
            >
              {/* Title + slelect drop down, loop through all the countries and show them , we do this by state*/}
              <MenuItem value="worldwide">Global</MenuItem>
              {
                //JSX
                countries.map((country) => (
                  <MenuItem value={country.value}>{country.name}</MenuItem>
                ))
              }
            </Select>
          </FormControl>
        </div>
        <div className="app__stats">
          {/* info-box  title = corona virus cases */}
          <InfoBox
            isRed
            active={casesType === "cases"}
            onClick={(e) => setCasesType("cases")}
            title="Coronavirus cases"
            cases={prettyPrintStat(countryInfo.todayCases)}
            total={prettyPrintStat(countryInfo.cases)}
          />
          {/* info-box title = corona virus recovery */}
          <InfoBox
            active={casesType === "recovered"}
            onClick={(e) => setCasesType("recovered")}
            title="Recovered"
            cases={prettyPrintStat(countryInfo.todayRecovered)}
            total={prettyPrintStat(countryInfo.recovered)}
          />
          {/* info-box title = corona virus deaths*/}
          <InfoBox
            isRed
            active={casesType === "deaths"}
            onClick={(e) => setCasesType("deaths")}
            title="Deaths"
            cases={prettyPrintStat(countryInfo.todayDeaths)}
            total={prettyPrintStat(countryInfo.deaths)}
          />
        </div>{" "}
        {/* Map */}
        <Map
          casesType={casesType}
          countries={mapCountries}
          center={mapCenter}
          zoom={mapZoom}
        />
      </div>
      <div className="app__right">
        <Card>
          <CardContent>
            {/* Table */}
            <h3>Live cases by country </h3>
            <Table countries={tableData}></Table>
            {/* Graph */}
            <h3 className="app__graphTitle">Global new {casesType}</h3>
            <LineComponent
              className="app__graph"
              casesType={casesType}
            ></LineComponent>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default App;
