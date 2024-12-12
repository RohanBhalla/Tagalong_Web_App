import * as React from "react";
import { styled } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";
import "../pages/styling/UserCard.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function UserCard(props) {
  console.log(props, "Yo");
  const username = props.username;
  console.log(username);

  const redirectToProfilePage = (e) => {
    e.preventDefault();
    window.location.href = `/profile?user=${username}`;
  };

  return (
    <a href="profile" class="usr_lnk" onClick={redirectToProfilePage}>
      <div class="usr">
        <div class="usr_spce"></div>
        <div class="usr_cnt">
          <div class="usr_img_box">
            {<img src={`/images/${props.profilepic}`} class="usr_img" />}
          </div>
          <div class="usr_img_data">
            <p class="usr_img_data_hdr">
              {props.firstname + " " + props.lastname}
            </p>
            <p class="usr_img_data_uname">{"@" + props.username}</p>
          </div>
        </div>
        <div class="usr_spce"></div>
      </div>
    </a>
  );
}
