import * as React from "react";
import { styled } from "@mui/material/styles";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Collapse from "@mui/material/Collapse";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { red } from "@mui/material/colors";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShareIcon from "@mui/icons-material/Share";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import "../pages/styling/EventCard.css";
import { useEffect, useState } from "react";
var dateNum = "1";
function formatDate(dateString) {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Convert dateString to a Date object
  const date = new Date(dateString);

  // Get day, date, month, and time components
  const day = days[date.getDay()];
  const month = months[date.getMonth()];
  dateNum = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();

  // Formatting the hour for 12-hour format and determining AM/PM
  const hourFormatted = hour % 12 || 12;
  const amPm = hour < 12 ? "am" : "pm";

  // Adding ordinal suffix to date
  let ordinalSuffix;
  if (dateNum === 1 || dateNum === 21 || dateNum === 31) {
    ordinalSuffix = "st";
  } else if (dateNum === 2 || dateNum === 22) {
    ordinalSuffix = "nd";
  } else if (dateNum === 3 || dateNum === 23) {
    ordinalSuffix = "rd";
  } else {
    ordinalSuffix = "th";
  }

  // Constructing the formatted date string
  return `${day}, ${month} ${dateNum}${ordinalSuffix} @ ${hourFormatted}:${
    minute < 10 ? "0" : ""
  }${minute}${amPm}`;
}

export default function RecipeReviewCard(props) {
  const event = props.event;

  const formattedDate = formatDate(event.datetime);
  const [participation, setParticipation] = useState(4);

  useEffect(() => {
    const fetchParticipation = async () => {
      try {
        function getCookie(name) {
          const value = `; ${document.cookie}`;
          const parts = value.split(`; ${name}=`);
          if (parts.length === 2) return parts.pop().split(";").shift();
        }

        const authToken = getCookie("authToken");
        const response = await fetch(
          "http://localhost:8080/participation?event_id=" + event.eventid,
          {
            method: "GET", // Method is optional if it's a simple GET request
            headers: {
              "Content-Type": "application/json",
              Authorization: authToken,
            },
          }
        );
        const data = await response.json();
        if (data.participants) {
          setParticipation(data.participants.length);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchParticipation();
  }, []);
  console.log(event);
  const redirectToEventPage = () => {
    //if (event.username == event.host) {
    //window.location.href = `/edit?evnt_id=${event.eventid}`; // Modify this URL as needed
    //} else {
    window.location.href = `/event?evnt_id=${event.eventid}`; // Modify this URL as needed
    //}
  };

  return (
    <>
      <div class="evnt" onClick={redirectToEventPage}>
        <div class="evnt_spce"></div>
        <div class="evnt_cnt">
          <div class="evnt_top">
            <div class="evnt_symbl">
              <div class="evnt_symbl_top"></div>
              <div class="evnt_symbl_cnt">
                <p class="evnt_symbl_cnt_txt">{dateNum}</p>
              </div>
            </div>

            <div className="evnt_hst">
              <img
                src={`/images/${event.host_profilepic || event.profilepic}`}
                className="evnt_hst_img"
              />
              <p class="evnt_hst_nme">
                {event.host_username || event.host} is hosting
              </p>
            </div>
          </div>

          <h2 class="evnt_nme">{event.eventtitle}</h2>

          <h2 class="evnt_dtls">{formattedDate}</h2>

          <div class="evnt_vtls_box">
            <h2 class="evnt_vtls">
              {participation} going&nbsp;&nbsp;&nbsp;{event.eventcapacity}{" "}
              capacity
            </h2>
            <h2 class="evnt_vtls_2">•</h2>
            <h2 class="evnt_vtls_2">{event.category}</h2>
            {event.attendingfriends && (
              <div>
                <h2 class="evnt_vtls_2">•</h2>
                <h2 class="evnt_vtls_2">
                  Who is Going:{" "}
                  {event.attendingfriends.map((name, index) => name).join(", ")}
                </h2>
              </div>
            )}
          </div>
        </div>
        <div class="evnt_spce"></div>
      </div>
    </>
  );
}
