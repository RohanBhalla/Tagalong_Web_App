import Navbar from "../components/Navbar";
import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import SmartyStreetsSDK from "smartystreets-javascript-sdk";

function splitDateTime(timestamp) {
  const dateTime = new Date(timestamp);
  const date = dateTime.toISOString().split("T")[0];
  const time = dateTime.toTimeString().split(" ")[0].substring(0, 5);

  return { date, time };
}

export default function EventFormEdit() {
  const locationInputRef = useRef(null);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [locationInput, setLocationInput] = useState("");

  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventCapacity, setEventCapacity] = useState("");
  const [eventAnnouncement, setEventAnnouncement] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState([
    "Sports",
    "Gaming",
    "Social",
    "Food",
    "DIY and Crafts",
    "Educational",
    "Cultural",
    "Music and Entertainment",
    "Outdoor and Adventure",
    "Volunteering and Community Service",
    "Entrepreneurship and Business",
    "Technology and Science",
    "Wellness and Health",
    "Environmental and Sustainability",
    "Arts and Literature",
    "Fashion and Beauty",
    "Travel and Exploration",
    "Film and Media",
    "Comedy and Humor",
    "Dance and Performance",
    "Miscellaneous",
  ]);

  const [notSendBarVis, setNotSendBarVis] = useState(false);

  const showNotSendBar = () => {
    setNotSendBarVis(true);
  };

  const hideNotSendBar = () => {
    setNotSendBarVis(false);
  };

  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const eventId = searchParams.get("evnt_id");

  useEffect(() => {
    const importStyles = async () => {
      try {
        await import("./styling/EventForm.css");
        // Apply the imported styles if necessary
      } catch (error) {
        console.error("Error loading CSS:", error);
      }
    };
    importStyles();

    // Adding SmartyStreet API
    const buildSmartyStreets = () => {
      const websiteKey = "184269683753434471";
      const credentials = new SmartyStreetsSDK.core.SharedCredentials(
        websiteKey
      );

      let clientBuilder = new SmartyStreetsSDK.core.ClientBuilder(
        credentials
      ).withLicenses(["us-autocomplete-pro-cloud"]);
      let client = clientBuilder.buildUsAutocompleteProClient();

      locationInputRef.current = client;
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
          "http://localhost:8080/events/" + eventId,
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
          console.log(data.event_data);
          const datetime = splitDateTime(data.event_data.datetime);
          setEventTitle(data.event_data.eventtitle);
          setEventDescription(data.event_data.eventdescription);
          setEventCapacity(data.event_data.eventcapacity);
          setLocationInput(data.event_data.eventaddress);
          setEventDate(datetime.date);
          setEventTime(datetime.time);
          setSelectedCategory(data.event_data.category);
          console.log(
            eventTitle,
            eventDescription,
            eventCapacity,
            locationInput,
            eventDate,
            eventTime
          );
        }
      } catch (error) {
        console.error("Error fetching event data:", error);
      }
    };

    buildSmartyStreets();
    fetchEventData();
  }, []);

  //Autocomplete suggestions through SmartyStreets
  const fetchLocationSuggestions = async (input) => {
    if (!input) {
      setLocationSuggestions([]);
      return;
    }
    const client = locationInputRef.current;

    let lookup = new SmartyStreetsSDK.usAutocompletePro.Lookup(input);
    lookup.maxResults = 1;
    lookup.source = "all";

    try {
      const response = await client.send(lookup);
      setLocationSuggestions(response.result); // Adjust based on actual response structure
    } catch (error) {
      console.error("Error fetching location suggestions:", error);
    }
  };

  //
  const handleLocationInputChange = (e) => {
    setLocationInput(e.target.value);
    fetchLocationSuggestions(e.target.value);
  };

  //auto
  const handleLocationSelect = (suggestion) => {
    setLocationInput(
      suggestion.streetLine +
        " " +
        suggestion.city +
        ", " +
        suggestion.state +
        " " +
        suggestion.zipcode
    );
    setLocationSuggestions([]);
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(eventId);
    const eventDataSubmit = {
      eventTitle,
      eventDescription,
      dateTime: `${eventDate} ${eventTime}`,
      eventAddress: locationInput,
      eventCapacity,
      eventId: eventId,
      category: selectedCategory,
    };
    function getCookie(name) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(";").shift();
    }

    const authToken = getCookie("authToken");
    try {
      const response = await fetch("http://localhost:8080/events", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: authToken,
        },
        body: JSON.stringify(eventDataSubmit),
      });
      console.log(response);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const jsonResponse = await response.json();
      console.log(jsonResponse);
      window.location.href = `/explore`;
      // Handle the response as needed
    } catch (error) {
      console.error("Error posting event data:", error);
    }
  };

  const handleSubmitDelete = async () => {
    function getCookie(name) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(";").shift();
    }
    if (!eventId) {
      console.error("Event ID is null or undefined");
      return; // Stop the function if eventId is not valid
    }
    const authToken = getCookie("authToken");

    try {
      const response = await fetch(`http://localhost:8080/events/${eventId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: authToken,
        },
      });
      if (response.status === 204) {
        console.log("Event deleted successfully");
        window.location.href = `/explore`;
      } else if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      } else {
        const jsonResponse = await response.json();
        console.log(jsonResponse);
      }

      // Handle the response as needed
    } catch (error) {
      console.error("Error posting event data:", error);
      window.location.href = `/explore`;
    }
  };
  const handleSubmitAnnouncement = async () => {
    console.log("yes");
    function getCookie(name) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(";").shift();
    }

    const authToken = getCookie("authToken");
    try {
      const response = await fetch("http://localhost:8080/announcements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authToken,
        },
        body: JSON.stringify({
          eventId: eventId,
          aContent: eventAnnouncement,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const jsonResponse = await response.json();
      console.log(jsonResponse);
      setEventAnnouncement("");
      // Handle the response as needed
    } catch (error) {
      console.error("Error posting event data:", error);
    }
  };

  return (
    <div>
      <div className="pge_box">
        <div className="pge_menu">
          <Navbar />
        </div>
        <div className="pge_cnt">
          <div className="pro_box">
            <form>
              <div className="pro_top">
                <h1 className="pro_hdr">Edit Your Event</h1>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="pro_sve_btn_green"
                >
                  Finish
                </button>
                <button
                  type="button"
                  onClick={handleSubmitDelete}
                  className="pro_sve_btn_red ml-3"
                >
                  Delete
                </button>
              </div>

              <div className="pro_dtls" onClick={showNotSendBar}>
                <div class="pro_dtls_nots">
                  <div class="prdtl_nots_spce"></div>
                  <div class="prdtl_nots_cnt">
                    <span class="material-symbols-rounded prdtl_nots_icn">
                      perm_phone_msg
                    </span>
                    <p class="prdtl_nots_txt">Notify Attendees</p>
                  </div>
                  <div class="prdtl_nots_spce"></div>
                </div>

                <p className="pro_dtls_hdr">Event Name</p>
                <input
                  type="text"
                  className="pro_dtls_inpt"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="ex: SpiderMan..."
                  maxLength="120"
                />

                <p className="pro_dtls_hdr">Location</p>
                <input
                  id="autocomplete"
                  type="text"
                  className="pro_dtls_inpt"
                  placeholder="ex: NY"
                  value={locationInput}
                  onChange={handleLocationInputChange}
                  maxLength="120"
                />
                {locationSuggestions.length > 0 && (
                  <ul className="location-suggestions-dropdown">
                    <li
                      onClick={() =>
                        handleLocationSelect(locationSuggestions[0])
                      }
                    >
                      {locationSuggestions[0].streetLine}{" "}
                      {locationSuggestions[0].city}
                      {", "}
                      {locationSuggestions[0].state}{" "}
                      {locationSuggestions[0].zipcode}
                    </li>
                  </ul>
                )}

                <p className="pro_dtls_hdr">Date of Event</p>
                <input
                  type="date"
                  className="pro_dtls_inpt"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                />

                <p className="pro_dtls_hdr">Time of Event</p>
                <input
                  type="time"
                  className="pro_dtls_inpt"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                />

                <p className="pro_dtls_hdr">Max Capacity</p>
                <input
                  type="number"
                  className="pro_dtls_inpt"
                  value={eventCapacity}
                  onChange={(e) => setEventCapacity(e.target.value)}
                  placeholder="ex: 50"
                />
                <p class="pro_dtls_hdr">Category</p>
                <select
                  className="pro_dtls_slct"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>

                <p className="pro_dtls_hdr">Description</p>
                <textarea
                  className="pro_dtls_txtara"
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  placeholder="About Your Event..."
                ></textarea>
              </div>
            </form>
          </div>
        </div>
      </div>

      {notSendBarVis && (
        <div class="evntNotSdbr">
          <div class="evNtSb_spce"></div>
          <div class="evNtSb_cnt">
            <div class="evNtSb_top">
              <p class="evNtSb_top_hdr">Notify Attendees</p>
              <a class="evNtSb_top_cls" onClick={hideNotSendBar}>
                <span class="material-symbols-rounded evNtSb_top_cls_icn">
                  close_fullscreen
                </span>
              </a>
            </div>

            <p class="evNtSb_inpt_hdr">What would you like members to know?</p>
            <textarea
              rows="6"
              class="evNtSb_txtara"
              value={eventAnnouncement}
              onChange={(e) => setEventAnnouncement(e.target.value)}
            ></textarea>
            <button class="evNtSb_btn" onClick={handleSubmitAnnouncement}>
              Send
            </button>
          </div>
          <div class="evNtSb_spce"></div>
        </div>
      )}
    </div>
  );
}
