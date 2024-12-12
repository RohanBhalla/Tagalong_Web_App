import * as React from "react";
import { styled } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";
import "../pages/styling/UserCard.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function UserCardBlocked(props) {
  const profileData = props;
  const username = props.username;
  const handleClickUnblocked = async () => {
    function getCookie(name) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(";").shift();
    }

    const authToken = getCookie("authToken");
    try {
      const response = await fetch(
        `http://localhost:8080/relationships/` + profileData.username,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: authToken,
          },
        }
      );
      if (response.ok) {
        console.log("success");
        props.func();
      }
    } catch (error) {
      console.log("error:", error);
    }
  };

  const navigate = useNavigate(); // Add this if you're using React Router

  const redirectToProfilePage = (e) => {
    e.preventDefault(); // Prevent default anchor behavior
    // Use React Router's navigate function
    window.location.href = `/profile?user=${username}`;
    // If not using React Router, uncomment the next line:
    // window.location.href = `/profile?user=${username}`;
  };

  return (
    <div href="profile" class="usr_lnk">
      <div class="usr">
        <div class="usr_spce"></div>
        <div class="usr_cnt">
          <div class="usr_img_box">
            {profileData && (
              <img src={`/images/${profileData.profilepic}`} class="usr_img" />
            )}
          </div>
          <div class="usr_img_data">
            <p class="usr_img_data_hdr">
              {profileData &&
                profileData.firstname + " " + profileData.lastname}
            </p>
            <p class="usr_img_data_uname">
              {profileData && "@" + profileData.username}
            </p>
          </div>
          {
            <div class="usr_blockd_box">
              <span
                class="material-symbols-rounded usr_blockd_icn"
                onClick={handleClickUnblocked}
              >
                block
              </span>
            </div>
          }
        </div>
        <div class="usr_spce"></div>
      </div>
    </div>
  );
}
