import Navbar from "../components/Navbar";
import React, { useState, useEffect } from "react";
import EventCardReal from "../components/EventCard";
import EventCard from "./EventCard";

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [profileData, setProfileData] = useState(null);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const importStyles = async () => {
      try {
        const module = await import("./styling/Calendar.css");
        // You can access the imported styles here
      } catch (error) {
        console.error("Error loading CSS:", error);
      }
    };
    const fetchProfileData = async () => {
      try {
        function getCookie(name) {
          const value = `; ${document.cookie}`;
          const parts = value.split(`; ${name}=`);
          if (parts.length === 2) return parts.pop().split(";").shift();
        }

        const authToken = getCookie("authToken");

        const response = await fetch("http://localhost:8080/users/%00", {
          method: "GET", // Method is optional if it's a simple GET request
          headers: {
            "Content-Type": "application/json",
            Authorization: authToken,
          },
        });
        const data = await response.json();
        if (data.profile_data) {
          setProfileData(data.profile_data);
          setEvents([...data.profile_data.joined_events]);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfileData();
    importStyles();
  }, []);
  console.log(events);
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const dateOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  };

  const formattedDate = currentDate.toLocaleDateString("en-US", dateOptions);

  return (
    <div>
      <div class="pge_box">
        <div class="pge_menu">
          <Navbar />
        </div>
        <div class="pge_cnt">
          <div class="cal_main">
            <p class="cal_main_hdr">Your Upcoming Events</p>

            <p class="cal_main_dte">
              Today is <b>{formattedDate}</b>
            </p>

            {events
              ? events
                  .filter((event) => new Date(event.datetime) >= currentDate)
                  .slice()
                  .sort((b, a) => new Date(b.datetime) - new Date(a.datetime))
                  .map((event, index) => {
                    return (
                      <div key={event.id || index}>
                        <EventCardReal
                          event={{
                            ...event,
                            username: profileData.username,
                          }}
                        />
                      </div>
                    );
                  })
              : ""}
          </div>
        </div>
      </div>
    </div>
  );
}
