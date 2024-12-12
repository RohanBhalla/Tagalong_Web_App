import Navbar from "../components/Navbar";
import React, { useEffect, useRef, useState } from "react";
import SmartyStreetsSDK from "smartystreets-javascript-sdk";

export default function EventForm() {
  const locationInputRef = useRef(null);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [locationInput, setLocationInput] = useState("");

  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventCapacity, setEventCapacity] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Sports");

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
    const websiteKey = "184269683753434471";
    const credentials = new SmartyStreetsSDK.core.SharedCredentials(websiteKey);

    let clientBuilder = new SmartyStreetsSDK.core.ClientBuilder(
      credentials
    ).withLicenses(["us-autocomplete-pro-cloud"]);
    let client = clientBuilder.buildUsAutocompleteProClient();

    locationInputRef.current = client;
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

    const eventData = {
      eventTitle,
      eventDescription,
      dateTime: `${eventDate} ${eventTime}`,
      eventAddress: locationInput,
      eventCapacity,
      category: selectedCategory,
    };
    function getCookie(name) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(";").shift();
    }

    const authToken = getCookie("authToken");
    console.log(authToken);
    try {
      const response = await fetch("http://localhost:8080/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authToken,
        },
        body: JSON.stringify(eventData),
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

  return (
    <div>
      <div className="pge_box">
        <div className="pge_menu">
          <Navbar />
        </div>
        <div className="pge_cnt">
          <div className="pro_box">
            <form onSubmit={handleSubmit}>
              <div className="pro_top">
                <h1 className="pro_hdr">Create Your Event</h1>
                <button type="submit" className="pro_sve_btn">
                  Create
                </button>
              </div>

              <div className="pro_dtls">
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
    </div>
  );
}
