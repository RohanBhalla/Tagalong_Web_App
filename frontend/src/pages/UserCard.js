import * as React from "react";
import { styled } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";
import "./styling/UserCard.css";

export default function UserCard() {
  const handleUsrOpen = (event) => {
    if (!event.target.classList.contains('usr_blockd_box')) {
      event.preventDefault();
      //this is for the calls
    }
  };

  return (
    <a href="profile" class="usr_lnk" onClick={ handleUsrOpen }><div class="usr">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0" />
      <div class="usr_spce"></div>
      <div class="usr_cnt">
        <div class="usr_img_box">
            <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=2670&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" class="usr_img"/>
        </div>
        <div class="usr_img_data">
            <p class="usr_img_data_hdr">Jane Doe</p>
            <p class="usr_img_data_uname">@testpro</p>
        </div>
        <div class="usr_blockd_box">
          <span class="material-symbols-rounded usr_blockd_icn">block</span>
        </div>
      </div>
      <div class="usr_spce"></div>
    </div></a>
  );
}
