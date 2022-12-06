import React, { useEffect, useReducer, useState } from "react";
import { initialState, reducer } from "../utility/Reducer";
import Axios from "axios";

import "./Main.css";
import Info from "../info/Info.js";
import Quote from "./Quote.js";
import Time from "./Time.js";
import Button from "./Button.js";
import Loading from "../../assets/loading.json";

function Main() {

  const [up, setUp] = useState(false);
  const [state, dispatch] = useReducer(reducer, initialState);

  // lottie loading json setting
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: Loading,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  useEffect(() => {

   
    const interval = setInterval(() => {
      if (state.time) {
        dispatch({
          type: "addSecond",
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [state.time]);

 
  useEffect(() => {
    getTime();
  }, []);

  const getTime = () => {
    Axios.get("https://worldtimeapi.org/api/ip/")
      .then((time) => {

        dispatch({
          type: "getTimeSuccess",
          payload: {
            time: time.data.datetime,
            abbreviation: time.data.abbreviation,
            dayOfWeek: time.data.day_of_week,
            dayOfYear: time.data.day_of_year,
            weekNum: time.data.week_number,
          },
        });

        Axios.get(
          "https://cors-anywhere.herokuapp.com/" +
            `https://freegeoip.app/json/${time.data.client_ip}`
        )
          .then((loc) => {
            // console.log(loc);
            dispatch({
              type: "getLocationSuccess",
              payload: {
                city: loc.data.city,
                country: loc.data.country_code,
                timeZone: loc.data.time_zone,
              },
            });
          })
          .catch((err) => {
            console.log("location api error", err);
          });
      })
      .catch((err) => {
        console.log("time api error", err);
      });
  };
  
  return (
    <div>
      {state.time ? (
        <div>
          <div
            className={`Main ${up ? "Main-part" : "Main-whole"} ${
              state.greeting === "GOOD EVENING" ? "Main-night" : "Main-day"
            }`}
          >
            {up ? null : <Quote />}

            <div className="Bottom-container">
              <Time
                time={state.time}
                greeting={state.greeting}
                abbreviation={state.abbreviation}
                city={state.city}
                country={state.country}
              />
              <Button up={up} setUp={setUp} />
            </div>
          </div>
          {up ? (
            <Info
              timeZone={state.timeZone}
              dayOfWeek={state.dayOfWeek}
              dayOfYear={state.dayOfYear}
              weekNum={state.weekNum}
            />
          ) : null}
        </div>
      ) : (
        <div style={{ height: "100vh", display: "flex", alignItems: "center" }}>
          <div options={defaultOptions} height="25vw" width="25vw" />
        </div>
      )}
    </div>
  );
}

export default Main;
