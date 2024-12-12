import "./Navbar.css";
import { Link } from "react-router-dom";
import React, { useState, useRef, useEffect } from "react";
import { Helmet } from "react-helmet";
import WebManifest from "../favicon/site.webmanifest";
import FavImg1 from "../favicon/apple-touch-icon.png";
import FavImg2 from "../favicon/favicon-32x32.png";
import FavImg3 from "../favicon/favicon-16x16.png";
import NotBox from "../pages/NotBox";
import NotBoxReal from "./NotBox";
import tagalong_lgo from "./Tagalong.png";

export default function Navbar() {
  const [announcements, setAnnoucements] = useState(null);
  useEffect(() => {
    const fetchNotification = async () => {
      function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(";").shift();
      }

      const authToken = getCookie("authToken");
      try {
        const response = await fetch(
          "http://localhost:8080/announcements?searchType=user",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: authToken,
            },
          }
        );
        const data = await response.json();
        if (data.announcements) {
          setAnnoucements(data.announcements);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };
    fetchNotification();
  }, []);
  const [isSearchBoxVisible, setSearchBoxVisibility, setMenuVisibility] =
    useState(false);
  const [error, setError] = React.useState(null);

  const openSearchBar = () => {
    setSearchBoxVisibility(true);
  };
  const closeSearchBar = () => {
    setSearchBoxVisibility(false);
  };

  const [notBarVis, setNotBarVis] = useState(false);

  const showNotBar = () => {
    setNotBarVis(true);
  };

  const hideNotBar = () => {
    setNotBarVis(false);
  };
  const refreshAnnouncements = async () => {
    function getCookie(name) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(";").shift();
    }

    const authToken = getCookie("authToken");
    try {
      const response = await fetch(
        "http://localhost:8080/announcements?searchType=user",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: authToken,
          },
        }
      );
      const data = await response.json();
      if (data.announcements) {
        setAnnoucements(data.announcements);
      }
    } catch (error) {
      console.error("Error fetching announcements:", error);
    }
  };
  const handleOnLogOut = () => {
    const removeAllCookies = () => {
      const cookies = document.cookie.split(";");

      for (let cookie of cookies) {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie =
          name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
      }
    };

    // Remove all cookies
    removeAllCookies();
    window.location.href = `/`; // Modify this URL as needed
    //}
  };
  return (
    <div>
      <Helmet>
        <link rel="apple-touch-icon" sizes="180x180" href={FavImg1} />
        <link rel="icon" type="image/png" sizes="32x32" href={FavImg2} />
        <link rel="icon" type="image/png" sizes="16x16" href={FavImg3} />
        <link rel="manifest" href={WebManifest} />
      </Helmet>
      <script src="https://code.jquery.com/jquery-3.6.3.js"></script>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0"
      />
      <div className="nav_sdbr">
        <div className="nav_sdbr_spce"></div>
        <div className="nav_sdbr_cnt">
          <div className="nav_sdbr_top_box">
            <a href="\home">
              <img src={tagalong_lgo} class="nav_sdbr_lgo" />
            </a>
            <a onClick={showNotBar}>
              <span class="material-symbols-rounded nav_sdbr_not">
                notifications
              </span>
            </a>
          </div>

          <a className="nav_sdbr_lnk nav_sdbr_lnk_hme" href="/home">
            <div className="navbr_lnk_spce"></div>
            <div className="navbr_lnk_cnt">
              <div className="navbr_lnk_icn_box">
                <span
                  className="material-symbols-rounded navbr_lnk_icn"
                  id="navbr_lnk_icn"
                >
                  chair
                </span>
              </div>
              <div className="navbr_lnk_data_box">
                <p className="navbr_lnk_data">Home</p>
              </div>
            </div>
            <div className="navbr_lnk_spce"></div>
          </a>

          <a className="nav_sdbr_lnk nav_sdbr_lnk_explre" href="/explore">
            <div className="navbr_lnk_spce"></div>
            <div className="navbr_lnk_cnt">
              <div className="navbr_lnk_icn_box">
                <span
                  className="material-symbols-rounded navbr_lnk_icn"
                  id="navbr_lnk_icn"
                >
                  explore
                </span>
              </div>
              <div className="navbr_lnk_data_box">
                <p className="navbr_lnk_data">Explore</p>
              </div>
            </div>
            <div className="navbr_lnk_spce"></div>
          </a>

          <a className="nav_sdbr_lnk nav_sdbr_lnk_evnt" href="/create">
            <div className="navbr_lnk_spce"></div>
            <div className="navbr_lnk_cnt">
              <div className="navbr_lnk_icn_box">
                <span
                  className="material-symbols-rounded navbr_lnk_icn"
                  id="navbr_lnk_icn"
                >
                  add_box
                </span>
              </div>
              <div className="navbr_lnk_data_box">
                <p className="navbr_lnk_data">Create</p>
              </div>
            </div>
            <div className="navbr_lnk_spce"></div>
          </a>

          <a className="nav_sdbr_lnk nav_sdbr_lnk_clndr" href="/calendar">
            <div className="navbr_lnk_spce"></div>
            <div className="navbr_lnk_cnt">
              <div className="navbr_lnk_icn_box">
                <span
                  className="material-symbols-rounded navbr_lnk_icn"
                  id="navbr_lnk_icn"
                >
                  calendar_month
                </span>
              </div>
              <div className="navbr_lnk_data_box">
                <p className="navbr_lnk_data">Calendar</p>
              </div>
            </div>
            <div className="navbr_lnk_spce"></div>
          </a>

          <a className="nav_sdbr_lnk nav_sdbr_lnk_pro" href="/profile">
            <div className="navbr_lnk_spce"></div>
            <div className="navbr_lnk_cnt">
              <div className="navbr_lnk_icn_box">
                <span
                  className="material-symbols-rounded navbr_lnk_icn"
                  id="navbr_lnk_icn"
                >
                  face
                </span>
              </div>
              <div className="navbr_lnk_data_box">
                <p className="navbr_lnk_data">Profile</p>
              </div>
            </div>
            <div className="navbr_lnk_spce"></div>
          </a>

          <a className="nav_sdbr_lnk" onClick={handleOnLogOut}>
            <div className="navbr_lnk_spce"></div>
            <div className="navbr_lnk_cnt">
              <div className="navbr_lnk_icn_box">
                <span
                  className="material-symbols-rounded navbr_lnk_icn"
                  id="navbr_lnk_icn"
                >
                  logout
                </span>
              </div>
              <div className="navbr_lnk_data_box">
                <p className="navbr_lnk_data">Log out</p>
              </div>
            </div>
            <div className="navbr_lnk_spce"></div>
          </a>
        </div>
        <div className="nav_sdbr_spce"></div>
      </div>

      <div className="nav_btm">
        <div className="navBtmSpce"></div>
        <div className="navBtmCnt">
          <div className="navBtmBtnSpce">
            <a className="navBtmBtnSpce navBtmBtnSpceHme" href="/home">
              <span className="material-symbols-rounded navBtmBtnIcn">
                chair
              </span>
            </a>
          </div>
          <div className="navBtmBtn">
            <a className="navBtmBtnSpce navBtmBtnSpceExp" href="/explore">
              <span className="material-symbols-rounded navBtmBtnIcn">
                explore
              </span>
            </a>
          </div>
          <div className="navBtmBtn">
            <a className="navBtmBtnSpce navBtmBtnSpceEvnt" href="/create">
              <span className="material-symbols-rounded navBtmBtnIcn">
                add_box
              </span>
            </a>
          </div>
          <div className="navBtmBtn">
            <a className="navBtmBtnSpce navBtmBtnSpceCal" href="/calendar">
              <span className="material-symbols-rounded navBtmBtnIcn">
                calendar_month
              </span>
            </a>
          </div>
          <div className="navBtmBtn">
            <a className="navBtmBtnSpce navBtmBtnSpcePro" href="/profile">
              <span className="material-symbols-rounded navBtmBtnIcn">
                face
              </span>
            </a>
          </div>
        </div>
        <div className="navBtmSpce"></div>
      </div>

      <div
        className="searchBox"
        id="searchBox"
        style={{ display: isSearchBoxVisible ? "block" : "none" }}
      >
        <div className="schBx_spce"></div>
        <div className="schBx_cnt">
          <div className="schBx_top">
            <h1 className="schBx_hdr">Search</h1>
            <a className="schBx_clse_btn" onClick={closeSearchBar}>
              <span className="material-symbols-rounded schBx_clse_btn_icn">
                close
              </span>
            </a>
          </div>

          <input
            type="text"
            className="schBx_inpt"
            placeholder="Search members & events..."
            maxLength="120"
          />
        </div>
        <div className="schBx_spce"></div>
      </div>

      {notBarVis && (
        <div className="navNotBar">
          <div class="nvNtBr_spce"></div>
          <div class="nvNtBr_cnt">
            <div class="nvNtBr_top">
              <p class="nvNtBr_tp_hdr">Notifications</p>
              <a onClick={hideNotBar} class="nvNtBr_tp_cls">
                <span class="material-symbols-rounded nvNtBr_tp_cls_icn">
                  close_fullscreen
                </span>
              </a>
            </div>
            {announcements &&
              announcements.map((a, index) => {
                console.log(a);
                return (
                  <div key={a.announcementid || index}>
                    <NotBoxReal
                      acontent={a.acontent}
                      announcementid={a.announcementid}
                      eventid={a.eventid}
                      refreshAnnouncements={refreshAnnouncements}
                    />
                  </div>
                );
              })}
          </div>
          <div class="nvNtBr_spce"></div>
        </div>
      )}
    </div>
  );
}
