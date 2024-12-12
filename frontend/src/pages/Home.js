import Navbar from "../components/Navbar";
import React, { useEffect, useState } from "react";
import EventCard from "./EventCard";
import EventCardReal from "../components/EventCard";

export default function Home() {
  const [searchResults, setSearchResults] = useState([]);
  const [profileData, setProfileData] = useState(null);
  useEffect(() => {
    const importStyles = async () => {
      try {
        const module = await import("./styling/Home.css");
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
          console.log(data.profile_data);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };
    const fetchEventData = async () => {
      try {
        function getCookie(name) {
          const value = `; ${document.cookie}`;
          const parts = value.split(`; ${name}=`);
          if (parts.length === 2) return parts.pop().split(";").shift();
        }

        const authToken = getCookie("authToken");

        const response = await fetch(
          "http://localhost:8080/events?search=host&search_type=friend",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: authToken,
            },
          }
        );
        const data = await response.json();
        console.log(data);
        if (data.events) {
          setSearchResults(data.events);
        }
      } catch (error) {
        console.error("Network error:", error);
      }
    };
    fetchProfileData();
    fetchEventData();
    importStyles();
  }, []);
  return (
    <div>
      <div class="pge_box">
        <div class="pge_menu">
          <Navbar />
        </div>
        <div class="pge_cnt">
          <div class="hme_main">
            <p class="hme_main_hdr">
              Welcome back, {profileData && profileData.firstname}
            </p>
            {searchResults &&
              searchResults
                .slice()
                .sort((b, a) => new Date(a.datetime) - new Date(b.datetime))
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
                })}
          </div>
        </div>
      </div>
    </div>
  );
}
