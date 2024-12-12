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
import "./styling/EventCard.css";

const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
  marginLeft: "auto",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
}));

export default function RecipeReviewCard() {
  const [expanded, setExpanded] = React.useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <div class="evnt">
      <div class="evnt_spce"></div>
      <div class="evnt_cnt">
        <div class="evnt_top">
          <div class="evnt_symbl">
            <div class="evnt_symbl_top"></div>
            <div class="evnt_symbl_cnt">
              <p class="evnt_symbl_cnt_txt">31</p>
            </div>
          </div>

          <div className="evnt_hst">

            <div class="evnt_hst_img"></div>
            <p class="evnt_hst_nme">Jane is hosting</p>
          </div>
        </div>

        <h2 class="evnt_nme">Go see the new Spiderman Movie with me</h2>

        <h2 class="evnt_dtls">Saturday, October 31st @ 5:00pm</h2>

        <div class="evnt_vtls_box">
          <h2 class="evnt_vtls">3 going&nbsp;&nbsp;&nbsp;20 capacity</h2>
          <h2 class="evnt_vtls_2">•</h2>
          <h2 class="evnt_vtls_2">Food & Drink</h2>
        </div>

        <div class="evnt_gng">
          <p class="evnt_gng_txt"><span class="evnt_gng_txt_main">Who's Going: </span></p>
        </div>
      </div>
      <div class="evnt_spce"></div>
    </div>
  );
}
