import Navbar from "../components/Navbar";
import React, { useState, useEffect } from "react";
import EventCardReal from "../components/EventCard";
import NotBox from "./NotBox";

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [profileData, setProfileData] = useState(null);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const importStyles = async () => {
      try {
        const module = await import("./styling/Notifications.css");
        // You can access the imported styles here
      } catch (error) {
        console.error("Error loading CSS:", error);
      }
    };

    importStyles();
  }, []);

  return (
    <div>
        <div class="pge_box">
        <div class="pge_menu">
          <Navbar />
        </div>
        <div class="pge_cnt">
          <div class="nots_main">
            <div className="nots_body">
                <p class="nots_hdr">
                    Notifications
                </p>

                <NotBox />
                <NotBox />
                <NotBox />
                <NotBox />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
