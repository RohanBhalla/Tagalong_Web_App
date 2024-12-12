import Navbar from "../components/Navbar";
import EventCard from "./EventCard";
import EventCardReal from "../components/EventCard";
import { useLocation } from "react-router-dom";
import React, { useEffect, useState } from "react";
import UserCard from "./UserCard";
import UserCardReal from "../components/UserCard";
import UserCardBlocked from "../components/UserCardBlocked";

function isValidEmail(email) {
  const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return regex.test(email);
}

export default function Profile() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  var username = searchParams.get("user");
  const [profileData, setProfileData] = useState(null);
  const [username2, setUsername2] = useState(null);
  const [followSwitch, setFollowSwitch] = useState(false);
  const [buttonData, setButtonData] = useState(null);
  if (username == null) {
    username = "%00";
  }

  const [sdbrVis, setSdbrVis] = useState(true);

  const showSdbr = () => {
    setSdbrVis(true);
  };

  const hideSdbr = () => {
    setSdbrVis(false);
  };

  const [isOpen1, setIsOpen1] = useState(true);
  const [isOpen2, setIsOpen2] = useState(false);
  const [isOpen3, setIsOpen3] = useState(false);

  const [typeOpen, setTypeOpen] = useState("?view=following&type=friend");

  const handleButtonClick = (buttonId) => {
    if (buttonId === 1) {
      setIsOpen1(true);
      setIsOpen2(false);
      setIsOpen3(false);
      setTypeOpen("?view=following&type=friend");
    } else if (buttonId === 2) {
      setIsOpen1(false);
      setIsOpen2(true);
      setIsOpen3(false);
      setTypeOpen("?view=followers&type=friend");
    } else if (buttonId === 3) {
      setIsOpen1(false);
      setIsOpen2(false);
      setIsOpen3(true);
      setTypeOpen("?view=following&type=blocked");
    }
  };

  useEffect(() => {
    const importStyles = async () => {
      try {
        const module = await import("./styling/Profile.css");
        // You can access the imported styles here
      } catch (error) {
        console.error("Error loading CSS:", error);
      }
    };
    importStyles();

    const fetchProfileData = async () => {
      try {
        function getCookie(name) {
          const value = `; ${document.cookie}`;
          const parts = value.split(`; ${name}=`);
          if (parts.length === 2) return parts.pop().split(";").shift();
        }

        const authToken = getCookie("authToken");

        const response = await fetch(
          "http://localhost:8080/users/" + username,
          {
            method: "GET", // Method is optional if it's a simple GET request
            headers: {
              "Content-Type": "application/json",
              Authorization: authToken,
            },
          }
        );

        const data = await response.json();
        if (data.profile_data) {
          setProfileData(data.profile_data);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };
    const fetchProfileData2 = async () => {
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
          setUsername2(data.profile_data.username);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };
    const fetchRelationshipData = async () => {
      function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(";").shift();
      }

      const authToken = getCookie("authToken");
      try {
        const response = await fetch(
          "http://localhost:8080/relationships/" + username,
          {
            method: "GET", // Method is optional if it's a simple GET request
            headers: {
              "Content-Type": "application/json",
              Authorization: authToken,
            },
          }
        );
        const data = await response.json();
        console.log(data);
        if (data.error == null) {
          setFollowSwitch(true);
        } else if (data.error != null) {
          setFollowSwitch(false);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfileData();
    fetchProfileData2();
    if (username != null && username != "%00") {
      fetchRelationshipData();
    }
  }, [followSwitch]);
  const fetchRelationshipSelfData = async () => {
    function getCookie(name) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(";").shift();
    }

    const authToken = getCookie("authToken");
    try {
      const response = await fetch(
        "http://localhost:8080/relationships" + typeOpen,
        {
          method: "GET", // Method is optional if it's a simple GET request
          headers: {
            "Content-Type": "application/json",
            Authorization: authToken,
          },
        }
      );
      const data = await response.json();
      console.log(data);
      if (data.Relations) {
        setButtonData(data.Relations);
        console.log(buttonData);
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
    }
  };
  useEffect(() => {
    if (username == null || username == "%00") {
      fetchRelationshipSelfData();
    }
  }, [typeOpen]);
  const handleFollowClick = async () => {
    function getCookie(name) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(";").shift();
    }

    const authToken = getCookie("authToken");
    if (!followSwitch) {
      try {
        const response = await fetch("http://localhost:8080/relationships", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: authToken,
          },
          body: JSON.stringify({
            other: username,
            relation: "friend",
          }),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const jsonResponse = await response.json();
        console.log(jsonResponse);
        setFollowSwitch(!followSwitch);
      } catch (error) {
        console.error("Error posting event data:", error);
      }
    } else {
      try {
        const response = await fetch(
          `http://localhost:8080/relationships/` + username,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: authToken,
            },
          }
        );
        if (response.ok) {
          console.log("Success");
          setFollowSwitch(!followSwitch);
        }
      } catch (error) {
        console.log("error:", error);
      }
    }
  };

  const handleBlockClick = async () => {
    function getCookie(name) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(";").shift();
    }

    const authToken = getCookie("authToken");
    if (!followSwitch) {
      try {
        const response = await fetch("http://localhost:8080/relationships", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: authToken,
          },
          body: JSON.stringify({
            other: username,
            relation: "blocked",
          }),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const jsonResponse = await response.json();

        setFollowSwitch(false);
      } catch (error) {
        console.error("Error posting event data:", error);
      }
    } else {
      try {
        const response = await fetch(`http://localhost:8080/relationships/`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: authToken,
          },
          body: JSON.stringify({
            other: username,
            relation: "blocked",
          }),
        });
        if (response.ok) {
          setFollowSwitch(false);
        }
      } catch (error) {
        console.log("error:", error);
      }
    }
    window.location.reload();
  };

  return (
    <div>
      <div class="pge_box">
        <div class="pge_menu">
          <Navbar />
        </div>
        <div class="pge_cnt">
          <div className="pro_main">
            <div className="pro_top">
              <div class="prtp_img_box">
                {profileData && (
                  <img
                    src={`/images/${profileData.profilepic}`}
                    className="prtp_img"
                  />
                )}
              </div>

              <div class="prtp_data_box">
                <div class="prtp_data_top">
                  <p class="prtp_data_tp_txt">
                    {profileData ? profileData.username : ""}
                  </p>
                  {username == null ||
                    (username == "%00" && (
                      <a class="prtp_data_tp_lnk" href="/settings">
                        Edit Profile
                      </a>
                    ))}
                  {username != null &&
                    username != "%00" &&
                    followSwitch == false && (
                      <div
                        class="prtp_data_tp_lnk_blue"
                        onClick={handleFollowClick}
                      >
                        Follow
                      </div>
                    )}
                  {username != null &&
                    username != "%00" &&
                    followSwitch == true && (
                      <div class="prtp_data_tp_lnk" onClick={handleFollowClick}>
                        Following
                      </div>
                    )}
                  {username != null && username != "%00" && (
                    <div
                      class="prtp_data_tp_lnk_red"
                      onClick={handleBlockClick}
                    >
                      Block
                    </div>
                  )}
                </div>

                <div class="prtp_vtls" onClick={showSdbr}>
                  <div class="prtp_vtl">
                    <p class="prtp_vtl_txt">
                      <b>
                        {profileData ? profileData.hosted_events.length : ""}
                      </b>{" "}
                      events
                    </p>
                  </div>

                  <div class="prtp_vtl">
                    <p class="prtp_vtl_txt">
                      <b>{profileData ? profileData.followers_count : ""}</b>{" "}
                      followers
                    </p>
                  </div>

                  <div class="prtp_vtl">
                    <p class="prtp_vtl_txt">
                      <b>{profileData ? profileData.following_count : ""}</b>{" "}
                      following
                    </p>
                  </div>
                </div>

                <p class="prtp_nme">
                  {profileData
                    ? profileData.firstname + " " + profileData.lastname
                    : ""}
                </p>

                <p class="prtp_dscptn">
                  {profileData ? profileData.userdescription : ""}
                  <br></br>
                </p>
              </div>
            </div>

            <div class="pro_evnts">
              <div class="pro_evnt">
                {profileData
                  ? profileData.hosted_events
                      .slice() // create a copy to avoid mutating the original array
                      .sort(
                        (b, a) => new Date(a.datetime) - new Date(b.datetime)
                      ) // replace 'eventDate' with the actual property name that holds the date string
                      .map((event, index) => {
                        return (
                          <div key={event.id || index}>
                            <EventCardReal
                              event={{
                                ...event,
                                username: profileData.username,
                                profilepic: profileData.profilepic,
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
      </div>

      {sdbrVis && (username == null || username == "%00") && (
        <div class="pge_sdbr">
          <div class="pgsb_spce"></div>
          <div class="pgsb_cnt">
            <div class="pgsb_top">
              <p class="pgsb_tp_hdr">Friends Info</p>
              <span
                onClick={hideSdbr}
                class="material-symbols-rounded pgsb_tp_icn"
              >
                close_fullscreen
              </span>
            </div>

            <div class="pgsb_mnu">
              <a
                onClick={() => handleButtonClick(1)}
                className={
                  isOpen1 ? "pgsb_mnu_btn_actve pgsb_mnu_btn" : "pgsb_mnu_btn"
                }
              >
                Following
              </a>
              <a
                onClick={() => handleButtonClick(2)}
                className={
                  isOpen2 ? "pgsb_mnu_btn_actve pgsb_mnu_btn" : "pgsb_mnu_btn"
                }
              >
                Followers
              </a>
              <a
                onClick={() => handleButtonClick(3)}
                className={
                  isOpen3 ? "pgsb_mnu_btn_actve pgsb_mnu_btn" : "pgsb_mnu_btn"
                }
              >
                Blocked
              </a>
            </div>

            <div className={isOpen1 ? "openBox" : "closedBox"}>
              {buttonData &&
                buttonData.map((user, index) => {
                  return (
                    <div key={user.username || index}>
                      <UserCardReal
                        username={user.username}
                        profilepic={user.profilepic}
                        firstname={user.firstname}
                        lastname={user.lastname}
                      />
                    </div>
                  );
                })}
            </div>

            <div className={isOpen2 ? "openBox" : "closedBox"}>
              {" "}
              {buttonData &&
                buttonData.map((user, index) => {
                  return (
                    <div key={user.username || index}>
                      <UserCardReal
                        username={user.username}
                        profilepic={user.profilepic}
                        firstname={user.firstname}
                        lastname={user.lastname}
                      />
                    </div>
                  );
                })}
            </div>

            <div className={isOpen3 ? "openBox" : "closedBox"}>
              {buttonData &&
                buttonData.map((user, index) => {
                  return (
                    <div key={user.username || index}>
                      <UserCardBlocked
                        username={user.username}
                        profilepic={user.profilepic}
                        firstname={user.firstname}
                        lastname={user.lastname}
                        func={fetchRelationshipSelfData}
                      />
                    </div>
                  );
                })}
            </div>
          </div>

          <div class="pgsb_spce"></div>
        </div>
      )}
    </div>
  );
}
