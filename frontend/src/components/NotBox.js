import * as React from "react";
import { useState, useRef, useEffect } from "react";
import "../pages/styling/NotBox.css";

export default function NotBox(props) {
  const [eventData, setEventData] = useState(null);
  useEffect(() => {
    const fetchEventData = async () => {
      try {
        function getCookie(name) {
          const value = `; ${document.cookie}`;
          const parts = value.split(`; ${name}=`);
          if (parts.length === 2) return parts.pop().split(";").shift();
        }

        const authToken = getCookie("authToken");

        const response = await fetch(
          "http://localhost:8080/events/" + props.eventid,
          {
            method: "GET", // Method is optional if it's a simple GET request
            headers: {
              "Content-Type": "application/json",
              Authorization: authToken,
            },
          }
        );
        const data = await response.json();
        if (data.event_data) {
          setEventData(data.event_data);
        }
      } catch (error) {
        console.error("Error fetching event data:", error);
      }
    };
    fetchEventData();
  }, []);
  const handleClose = async () => {
    try {
      function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(";").shift();
      }

      const authToken = getCookie("authToken");

      const response = await fetch("http://localhost:8080/announcements", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: authToken,
        },
        body: JSON.stringify({
          announcementId: props.announcementid,
        }),
      });
      console.log(response);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const jsonResponse = await response.json();
      console.log(jsonResponse);
    } catch (error) {
      console.error("Error fetching event data:", error);
    }
    try {
      function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(";").shift();
      }

      const authToken = getCookie("authToken");

      const response = await fetch("http://localhost:8080/announcements/true", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: authToken,
        },
        body: JSON.stringify({
          announcementId: props.announcementid,
        }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const jsonResponse = await response.json();
      props.refreshAnnouncements();
    } catch (error) {
      console.error("Error fetching event data:", error);
    }
  };
  return (
    <div class="not">
      <div class="notspce"></div>
      <div class="notcnt">
        <p class="notcnt_hdr">
          {props.eventid != null && eventData != null
            ? "Announcement from " +
              eventData.host +
              " in " +
              eventData.eventtitle +
              ": "
            : ""}
          {props.acontent}{" "}
        </p>
        <div class="notcnt_btm_box">
          <a class="notcnt_btm_btn">
            <span class="material-symbols-rounded notcnt_btm_btn_icn">
              new_releases
            </span>
            <p class="notcnt_btm_btn_txt" onClick={handleClose}>
              Close
            </p>
          </a>
          {props.eventid != null && eventData != null && (
            <a
              class="notcnt_btm_btn notcnt_btm_btn2"
              href={`event?evnt_id=${props.eventid}`}
            >
              <span class="material-symbols-rounded notcnt_btm_btn_icn">
                event_available
              </span>
              <p class="notcnt_btm_btn_txt">View Event</p>
            </a>
          )}
        </div>
      </div>
      <div class="notspce"></div>
    </div>
  );
}
