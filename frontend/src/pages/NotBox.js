import * as React from "react";
import { styled } from "@mui/material/styles";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Collapse from "@mui/material/Collapse";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { red } from "@mui/material/colors";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShareIcon from "@mui/icons-material/Share";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import "./styling/NotBox.css";

export default function RecipeReviewCard() {

  return (
    <div class="not">
        <div class="notspce"></div>
        <div class="notcnt">
            <p class="notcnt_hdr">This is the text for the notification. </p>
            <div class="notcnt_btm_box">
                <a class="notcnt_btm_btn">
                    <span class="material-symbols-rounded notcnt_btm_btn_icn">new_releases</span>
                    <p class="notcnt_btm_btn_txt">Close</p>
                </a>
                <a class="notcnt_btm_btn notcnt_btm_btn2" href="/event?evnt={ }">
                    <span class="material-symbols-rounded notcnt_btm_btn_icn">event_available</span>
                    <p class="notcnt_btm_btn_txt">View Event</p>
                </a>
            </div>
        </div>
        <div class="notspce"></div>
    </div>
  );
}
