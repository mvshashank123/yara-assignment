import { useEffect, useState } from "react";
import Plotly from "plotly.js-dist-min";
import axios from "axios";
import moment from "moment";
import { Label } from "reactstrap";
import Select from "react-select";
import "./App.css";

function App() {
  const [airQualityData, setAirQualityData] = useState([]);
  const [mapStyle, setMapStyle] = useState({
    label: "Open Street",
    value: "open-street-map",
  });

  const styleOptions = [
    { label: "Open Street", value: "open-street-map" },
    { label: "Carto Positron", value: "carto-positron" },
    { label: "Carto Darkmatter", value: "carto-darkmatter" },
    { label: "Stamen Terrain", value: "stamen-terrain" },
    { label: "Image Overlay", value: "image" },
    { label: "Stamen Toner", value: "stamen-toner" },
    { label: "Stamen Watercolor", value: "stamen-watercolor" },
  ];

  const getAirQualityData = async () => {
    let resData = await axios.get(
      "https://api.openaq.org/v2/measurements?date_from=2000-01-01T00%3A00%3A00%2B00%3A00&date_to=2022-07-04T01%3A37%3A00%2B00%3A00&limit=10000&page=1&offset=0&sort=desc&radius=1000&country_id=DE&order_by=datetime"
    );
    if (resData?.data?.results) {
      setAirQualityData(resData?.data?.results);
    }
  };

  const computeData = () => {
    let longitude = airQualityData?.map((item) => {
      return item.coordinates.longitude;
    });

    let latitude = airQualityData?.map((item) => {
      return item.coordinates.latitude;
    });

    let displayText = airQualityData?.map((item) => {
      return `${item.location}  ${item.value} ${
        item.unit
      }<br>Last updated on: ${moment(item?.date?.utc).format("DD-MM-YYYY")}`;
    });

    let data = [
      {
        type: "scattermapbox",
        text: displayText,
        lon: longitude,
        lat: latitude,
        marker: { color: "light-blue", size: 6 },
      },
    ];

    let layout =
      mapStyle.value === "image"
        ? {
            dragmode: "zoom",
            mapbox: {
              style: "white-bg",
              layers: [
                {
                  sourcetype: "raster",
                  source: [
                    "https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}",
                  ],
                  below: "traces",
                },
              ],
              center: { lat: 50, lon: 10 },
              zoom: 3,
            },
            margin: { r: 0, t: 0, b: 0, l: 0 },
          }
        : {
            dragmode: "zoom",
            mapbox: {
              style: mapStyle.value,
              center: { lat: 50, lon: 10 },
              zoom: 3,
            },
            margin: { r: 0, t: 0, b: 0, l: 0 },
          };

    Plotly.newPlot("myDiv", data, layout);
  };

  const handleStyleChange = (value) => {
    setMapStyle(value);
  };

  useEffect(() => {
    getAirQualityData();
  }, []);

  useEffect(() => {
    computeData();
  }, [airQualityData, mapStyle.value]);

  return (
    <div className="App">
      <div className="mb-4 mt-2">
        <h1 className="text-center">Air Quality across German Cities.</h1>
        <div className="my-dropdown">
          <Label>Select the Map Style</Label>
          <Select
            className="basic-single"
            classNamePrefix="select"
            defaultValue={mapStyle}
            onChange={handleStyleChange}
            placeholder="Select the map style"
            isSearchable={true}
            name="color"
            options={styleOptions}
          />
        </div>
      </div>
      <div>
        <div id="myDiv"></div>
      </div>
    </div>
  );
}

export default App;
