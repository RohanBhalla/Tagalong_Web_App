import Navbar from "../components/Navbar";
import React, { Component, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import copy from "clipboard-copy";

class CopyToClipboardLink extends Component {
  constructor(props) {
    super(props);
    this.state = {
      copied: false,
    };
  }

  copyToClipboard = async () => {
    try {
      await copy(this.props.textToCopy);
      this.setState({ copied: true });
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  render() {
    return (
      <div>
        {this.state.copied ? (
          <a class="evntPgeHdrLnkBtnCpd">Copied!</a>
        ) : (
          <a class="evntPgeHdrLnkBtn" onClick={this.copyToClipboard}>
            Copy Link
          </a>
        )}
      </div>
    );
  }
}

export default function Event() {
  const location = useLocation();
  // Function to parse query parameters
  const searchParams = new URLSearchParams(location.search);
  const eventId = searchParams.get("evnt_id");

  const [eventData, setEventData] = useState(null);
  const [participationData, setParticipationData] = useState(null);
  const [statusData, setStatusData] = useState(null);
  const [switchData, setSwitchData] = useState(false);
  const [profileData, setProfileData] = useState({});
  const [profileData2, setProfileData2] = useState(null);
  console.log(profileData2);
  useEffect(() => {
    const importStyles = async () => {
      try {
        const module = await import("./styling/Event.css");

        // You can access the imported styles here
      } catch (error) {
        console.error("Error loading CSS:", error);
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
          const datetimeStr = data.event_data.datetime; // Adjust according to your data structure
          const datetimeObj = new Date(datetimeStr);
          const formattedDate = datetimeObj.toLocaleDateString("en-US", {
            weekday: "long",
            month: "short",
            day: "numeric",
          });
          const formattedTime = datetimeObj
            .toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "numeric",
              hour12: true,
            })
            .toLowerCase();

          // Update your event data state
          setEventData({
            ...data.event_data,
            formattedDate,
            formattedTime,
          });
          console.log(data.event_data.host);
          fetchProfileData(data.event_data.host);
        }
      } catch (error) {
        console.error("Error fetching event data:", error);
      }
    };

    const fetchParticipationData = async () => {
      try {
        function getCookie(name) {
          const value = `; ${document.cookie}`;
          const parts = value.split(`; ${name}=`);
          if (parts.length === 2) return parts.pop().split(";").shift();
        }

        const authToken = getCookie("authToken");

        const response = await fetch(
          "http://localhost:8080/participation?event_id=" + eventId,
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
          setParticipationData(data.participants);
          console.log(data.participants);
        }
      } catch (error) {
        console.error("Error fetching participation data:", error);
      }
    };

    const fetchStatusData = async () => {
      try {
        function getCookie(name) {
          const value = `; ${document.cookie}`;
          const parts = value.split(`; ${name}=`);
          if (parts.length === 2) return parts.pop().split(";").shift();
        }

        const authToken = getCookie("authToken");

        const response = await fetch(
          "http://localhost:8080/participation/" + eventId,
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
        if (data.participation_status) {
          setStatusData(data.participation_status);
          console.log(20);
        } else {
          setStatusData(null);
        }
      } catch (error) {
        console.error("Error fetchings participation data:", error);
      }
    };

    //localhost:8080/participation?event_id=test
    fetchEventData();
    fetchParticipationData();
    fetchStatusData();
    importStyles();
  }, [switchData]);

  useEffect(() => {
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
          setProfileData2(data.profile_data);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };
    fetchProfileData2();
    if (participationData) {
      participationData.forEach((participant) => {
        fetchProfileData(participant.username); // Adjust based on your data structure
      });
    }
  }, [participationData]);
  const handleAttendClick = async () => {
    function getCookie(name) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(";").shift();
    }

    const authToken = getCookie("authToken");
    if (statusData == null) {
      try {
        // Example: Send a POST request to update the attendance status
        // Adjust the URL and request details as per your API
        const response = await fetch(`http://localhost:8080/participation`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: authToken,
          },
          body: JSON.stringify({ event_id: eventId }), // Adjust based on your API requirements
        });

        const data = await response.json();
        if (response.ok) {
          // Handle successful attendance update
          // e.g., Update your state to reflect the new status
          console.log("Success");
          setSwitchData(!switchData);
        } else {
          // Handle errors
          console.error("Error updating attendance status:", data.error);
        }
      } catch (error) {
        console.error("Network error:", error);
      }
    } else {
      try {
        const response = await fetch(
          `http://localhost:8080/participation/` + eventId,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: authToken,
            },
          }
        );

        if (response.ok) {
          // Handle successful attendance update
          console.log("Success");
          setSwitchData(!switchData);
          // Optionally, you can parse JSON here if the server sends a response
          // const data = await response.json();
        } else {
          console.error("Error updating attendance status");
          // Only parse JSON if the response includes it
          if (
            response.headers.get("content-type")?.includes("application/json")
          ) {
            const data = await response.json();
            console.error(data.error);
          }
        }
      } catch (error) {
        console.error("Network error:", error);
      }
    }
  };

  const fetchProfileData = async (username) => {
    try {
      function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(";").shift();
      }

      const authToken = getCookie("authToken");

      const response = await fetch("http://localhost:8080/users/" + username, {
        method: "GET", // Method is optional if it's a simple GET request
        headers: {
          "Content-Type": "application/json",
          Authorization: authToken,
        },
      });
      const data = await response.json();
      if (data.profile_data) {
        setProfileData((prevData) => ({
          ...prevData,
          [username]: data.profile_data,
        }));
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
    }
  };
  console.log(eventData);

  return (
    <div>
      <div class="pge_box">
        <div class="pge_menu">
          <Navbar />
        </div>
        <script
          src="https://kit.fontawesome.com/60d1149b30.js"
          crossorigin="anonymous"
        ></script>
        <div class="pge_cnt">
          <div class="evnt_box">
            <div class="evntPgeTop">
              <div class="evntPgeTopLft">
                {eventData && (
                  <>
                    <p class="evntPgeTopLftTxt">{eventData.formattedDate}</p>
                    <div class="evntPgeTopLftDvdr"></div>
                    <p class="evntPgeTopLftTxt">{eventData.formattedTime}</p>
                  </>
                )}
              </div>

              <div class="evntPgeTopRgt">
                <a
                  href="https://www.facebook.com/sharer/sharer.php?u=https://www.tagalong.com?evnt=5&quote=Check%20out%20this%20event!"
                  target="_blank"
                >
                  <i className="fa fa-facebook evntPgeTopRgtIcn"></i>
                </a>

                <a
                  href="https://twitter.com/intent/tweet?text=Check%20out%20this%20event!&url=https://www.tagalong.com?evnt=5"
                  target="_blank"
                >
                  <i className="fa fa-twitter evntPgeTopRgtIcn"></i>
                </a>

                <a
                  href="mailto:?subject=Check out this event!&body=Jane is hosting an event this Saturday at 5pm"
                  target="_blank"
                >
                  <i className="fa fa-envelope evntPgeTopRgtIcn evntPgeTopRgtIcnMail"></i>
                </a>
              </div>
            </div>

            <div class="evntPgeHdr">
              <div class="evntPgeHdrNmeBox">
                <p class="evntPgeHdrNmeBoxTxt">
                  {eventData && eventData.eventtitle}
                </p>
              </div>

              <p class="evntPgeHdrNmeLoc">Location here</p>

              <div class="evntPgeHdrLnkBox">
                <CopyToClipboardLink textToCopy="tagalong.com/event?evnt_id=5" />
              </div>
            </div>

            <div class="evnt_pge_ctrls">
              {eventData && !eventData.event_host ? (
                <a class="evnt_pge_ctrl_go" onClick={handleAttendClick}>
                  {statusData ? <>Attending</> : <>I'll Attend</>}
                </a>
              ) : (
                <a class="evnt_pge_ctrl_go" href={`/edit?evnt_id=${eventId}`}>
                  Edit Event
                </a>
              )}
            </div>

            <div class="evnt_pge_attnd_boxes">
              {eventData && (
                <img
                  class="evnt_pge_attnd_box evnt_pge_attnd_box_hst"
                  src={`/images/${eventData.profilepic}`}
                />
              )}
              {participationData &&
                participationData.map((participant) => (
                  <img
                    class="evnt_pge_attnd_box"
                    src={`/images/${participant.profilepic}`}
                  />
                ))}
            </div>

            <p class="evnt_pge_dscpnt">
              {eventData && eventData.eventdescription}
            </p>

            <p class="evnt_pge_attndnce">Who's Going...</p>
            {eventData && (
              <div class="evnt_pge_goer">
                <div class="evntpge_goer_img_box">
                  <img
                    class="evntpge_goer_img"
                    src={`/images/${eventData.profilepic}`}
                  />
                </div>
                <div class="evntpge_goer_data">
                  <a
                    href={
                      eventData &&
                      profileData2 &&
                      eventData.host != profileData2.username
                        ? `/profile?user=${eventData.host}`
                        : `/profile`
                    }
                    class="evntpge_goer_datatxt"
                  >
                    {eventData &&
                      eventData.host &&
                      profileData[eventData.host] && (
                        <>
                          {profileData[eventData.host].firstname}{" "}
                          {profileData[eventData.host].lastname}
                        </>
                      )}{" "}
                  </a>
                  <span className="evntpge_goer_datatxt_hst">
                    &nbsp;&nbsp;&nbsp;&nbsp;Host
                  </span>
                </div>
              </div>
            )}
            {participationData &&
              participationData.map((participant) => (
                <div class="evnt_pge_goer">
                  <div class="evntpge_goer_img_box">
                    <img
                      class="evntpge_goer_img"
                      src={`/images/${participant.profilepic}`}
                    />
                  </div>
                  <div class="evntpge_goer_data">
                    {profileData &&
                      participant.username != profileData.username}
                    <a
                      href={
                        profileData2 &&
                        participant.username != profileData2.username
                          ? `/profile?user=${participant.username}`
                          : `/profile`
                      }
                      class="evntpge_goer_datatxt"
                    >
                      {profileData[participant.username]
                        ? `${profileData[participant.username].firstname} ${
                            profileData[participant.username].lastname
                          }`
                        : "Loading..."}
                    </a>
                  </div>
                </div>
              ))}

            <div class="evntpge_btmspce"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
