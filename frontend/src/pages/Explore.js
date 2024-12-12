import Navbar from "../components/Navbar";
import React, { useEffect, useState } from "react";
import UserCard from "./UserCard";
import EventCardReal from "../components/EventCard";
import UserCardReal from "../components/UserCard";

export default function Explore() {
  const [isOpen1, setIsOpen1] = useState(true);
  const [isOpen2, setIsOpen2] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("Any");
  const [distance, setDistance] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [available, setAvailable] = useState(false);
  const [categories, setCategories] = useState([
    "Any",
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
        const module = await import("./styling/Explore.css");
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

    fetchProfileData();
    importStyles();
    handleSearch();
  }, [isOpen1]);

  // Function to handle search
  const handleSearch = async () => {
    function getCookie(name) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(";").shift();
    }
    const authToken = getCookie("authToken");
    if (isOpen1) {
      try {
        const response = await fetch(
          "http://localhost:8080/events?search=" +
            searchQuery +
            "&search_type=event",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: authToken,
            },
          }
        );
        const data = await response.json();
        if (data.events) {
          setSearchResults(data.events);
          console.log(searchResults);
        }
      } catch (error) {
        console.error("Network error:", error);
      }
    } else if (isOpen2) {
      try {
        const response = await fetch(
          "http://localhost:8080/users?search=" + searchQuery,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: authToken,
            },
          }
        );
        const data = await response.json();

        if (data.users) {
          setSearchResults(data.users);
        }
      } catch (error) {
        console.error("Network error:", error);
      }
    }
  };
  console.log(searchResults);
  const handleButtonClick = (buttonId) => {
    if (buttonId === 1) {
      setSearchResults([]);
      setSearchQuery("");
      setIsOpen1(true);
      setIsOpen2(false);
    } else if (buttonId === 2) {
      setSearchResults([]);
      setSearchQuery("");
      setIsOpen1(false);
      setIsOpen2(true);
    }
  };

  const handleFilterClick = async () => {
    function getCookie(name) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(";").shift();
    }
    console.log(available);
    const authToken = getCookie("authToken");
    var s = "";
    if (startDate) {
      s += "&start_date=" + startDate;
    }
    if (endDate) {
      s += "&end_date=" + endDate;
    }
    if (available) {
      s += "&exclude_full=" + available;
    }
    if (selectedCategory != "Any") {
      s += "&category=" + selectedCategory;
    }
    if (distance) {
      s += "&distance=" + distance;
    }
    try {
      const response = await fetch(
        "http://localhost:8080/events?search=" +
          searchQuery +
          "&search_type=event" +
          s,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: authToken,
          },
        }
      );
      const data = await response.json();
      if (data.events) {
        setSearchResults(data.events);
        console.log(searchResults);
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  };

  return (
    <div>
      <div className="pge_box">
        <div className="pge_menu">
          <Navbar />
        </div>
        <div className="pge_cnt">
          <div class="exp_pge">
            <h1 className="exp_hdr">Let's Find You Something To Do...</h1>
            <p class="exp_shdr">
              Easily find other members on the platform or events that spark
              your interest, and tag along to the event with just the press of a
              button
            </p>

            <div class="exp_srch">
              <div class="exp_sch_spce"></div>
              <div class="exp_sch_cnt">
                <div class="exp_sch_icn_box">
                  <span class="material-symbols-rounded exp_sch_icn">
                    search
                  </span>
                </div>
                <div class="exp_sch_inpt_box">
                  <input
                    type="text"
                    className="exp_sch_inpt"
                    placeholder="Enter a query here..."
                    maxLength="120"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    required
                  />
                </div>
                <div class="exp_sch_btn_box">
                  <button
                    type="submit"
                    class="exp_sch_btn"
                    onClick={handleSearch}
                  >
                    Search
                  </button>
                </div>
              </div>
              <div class="exp_sch_spce"></div>
            </div>

            <div class="exp_mnu">
              <a
                onClick={() => handleButtonClick(1)}
                className={
                  isOpen1 ? "exp_mnu_lnk_actve exp_mnu_lnk" : "exp_mnu_lnk"
                }
              >
                Events
              </a>
              <a
                onClick={() => handleButtonClick(2)}
                className={
                  isOpen2 ? "exp_mnu_lnk exp_mnu_lnk_actve" : "exp_mnu_lnk"
                }
              >
                Users
              </a>
            </div>

            <div className={isOpen1 ? "openBox" : "closedBox"}>
              <div className="fltr">
                <div class="fltr_spce"></div>
                <div class="fltr_cnt">
                  <p class="fltr_hdr">Filter further...</p>
                  <div class="fltr_3boxes">
                    <div class="fltr_3box">
                      <p class="fltr_3box_hdr">Start Date</p>
                      <input
                        type="date"
                        class="fltr_3box_inpt"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                    <div class="fltr_3box">
                      <p class="fltr_3box_hdr">End Date</p>
                      <input
                        type="date"
                        class="fltr_3box_inpt"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                    <div class="fltr_3box">
                      <input
                        type="checkbox"
                        class="fltr_3box_chck"
                        value={available}
                        onChange={(e) => setAvailable(!available)}
                      />
                      <p class="fltr_3box_chk_txt">Is Available?</p>
                    </div>
                  </div>
                  <div class="fltr_box">
                    <div class="fltr_inpt_boxes">
                      <div class="fltr_inpt_box">
                        <input
                          type="number"
                          class="fltr_inpt"
                          placeholder="Distance In Miles..."
                          maxlength="120"
                          value={distance}
                          onChange={(e) => setDistance(e.target.value)}
                        />
                      </div>
                      <div class="fltr_inpt_box">
                        <select
                          className="fltr_inpt"
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                          {categories.map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div class="fltr_btn_box">
                      <a class="fltr_btn" onClick={handleFilterClick}>
                        Filter
                      </a>
                    </div>
                  </div>
                </div>
                <div class="fltr_spce"></div>
              </div>

              <div class="evnt_lst">
                {isOpen1 &&
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

            <div className={isOpen2 ? "openBox" : "closedBox"}>
              <div className="exp_usr_lst">
                {isOpen2 &&
                  searchResults
                    .filter((a) => a.username != profileData.username)
                    .slice()
                    .sort((b, a) => a.username > b.username)
                    .map((user, index) => {
                      return (
                        <>
                          {console.log(user, "hello")}
                          <div key={user.username || index}>
                            <UserCardReal
                              username={user.username}
                              profilepic={user.profilepic}
                              firstname={user.firstname}
                              lastname={user.lastname}
                            />
                          </div>
                        </>
                      );
                    })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
