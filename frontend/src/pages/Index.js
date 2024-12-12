import Navbar from "../components/Navbar";
import "./styling/Index.css";
import nathan_img from "../components/static/images/Nathan_img.jpg";
import berry_img from "../components/static/images/Berry_img.jpg";
import rohan_img from "../components/static/images/Rohan_img.jpg";
import jeff_img from "../components/static/images/Jeff_img.jpg";

export default function Tagalong() {
  return (
     <div>
      <div class="hme_hdr">
        <div class="hmhdr_spce"></div>
        <div class="hmhdr_cnt">
          <div class="hmhdr_lft">
            <p class="hmhdr_txt">Tag<span class="hmhdr_txt_grn">along.</span></p>
          </div>
          <div class="hmhdr_rgt">
            <a class="hmhdr_lnk" href="#features">Features</a>
            <a class="hmhdr_lnk" href="#mission">Mission</a>
            <a class="hmhdr_lnk" href="#team">Team</a>
            <a class="hmhdr_lnk" href="#faqs">FAQs</a>
            <a class="hmhdr_jn_lnk" href="signup">Join Us</a>
          </div>
        </div>
        <div class="hmhdr_spce"></div>
      </div>
      
      {/* Top */}
      <div class="indx_intro">
        <div class="indx_intro_spcng"></div>
        <div class="indx_intro_inr">
          <h1 class="indx_intro_hdr">We Reinvented Events,<br></br>And Put Friends at The ❤️</h1>
          <h4 class="indx_intro_shdr">Instead of focusing on the type of event, focus instead on the community for the event</h4>

          <div class="indx_intro_img" ></div>
        </div>
      </div>

      {/* Features */}
      <div class="indx_ftrs" id="features">
        <p class="ftrs_hdr">Our Features</p>

        <div class="indx_ftr_lst">
          {/* Events */}
          <div class="indx_ftr">
            <div class="indx_ftr_spce"></div>
            <div class="indx_ftr_cnt">
              <p class="indx_ftr_icn">🗓️</p>
              <p class="indx_ftr_hdr">Meet Events</p>
              <p class="indx_ftr_dtls">Think more like tweets... quick ways to share what you’re doing and bring others along for the ride</p>
            </div>
            <div class="indx_ftr_spce"></div>
          </div>

          {/* Friendships */}
          <div class="indx_ftr">
            <div class="indx_ftr_spce"></div>
            <div class="indx_ftr_cnt">
              <p class="indx_ftr_icn">🫂</p>
              <p class="indx_ftr_hdr">Utilize Friendship</p>
              <p class="indx_ftr_dtls">Find people you know on the platform, make friends with them, and see different events they're going to and hosting</p>
            </div>
            <div class="indx_ftr_spce"></div>
          </div>

          {/* Announcements */}
          <div class="indx_ftr">
            <div class="indx_ftr_spce"></div>
            <div class="indx_ftr_cnt">
              <p class="indx_ftr_icn">🔔</p>
              <p class="indx_ftr_hdr">Get Notified</p>
              <p class="indx_ftr_dtls">We'll let you know before any events are happening. That way you can go to what you want and not worry about forgetting</p>
            </div>
            <div class="indx_ftr_spce"></div>
          </div>

          {/* Community */}
          <div class="indx_ftr">
            <div class="indx_ftr_spce"></div>
            <div class="indx_ftr_cnt">
              <p class="indx_ftr_icn">🤝</p>
              <p class="indx_ftr_hdr">Explore Community</p>
              <p class="indx_ftr_dtls">With enough friends and easy event creation, community thrives on Tagalong by enabling you to go explore with those you know</p>
            </div>
            <div class="indx_ftr_spce"></div>
          </div>
        </div>

      </div>

      {/* Mission */}
      <div class="indx_msn" id="mission">
        <div class="idx_msn_spce"></div>
        <div class="idx_msn_cnt">
          <h1 class="idx_msn_hdr">Our Mission</h1>
          <p class="idx_msn_txt">Despite living in the digital age in the biggest city in the US (the big 🍏), loneliness is a pandemic recognized by the US surgeon general. We’ve seen personally that the factor most likely to cause you to go to an event is not the subject, but who you know that’s going. Therefore, we made a platform dedicated to that purpose. With Tagalong, find your friends, see events they’re going to, and Tagalong with them. </p>
        </div>
        <div class="idx_msn_spce"></div>
      </div>

      {/* Team */}
      <div class="mbrs" id="team">
        <p class="tms_hdr">Meet Our Team</p>
        <p class="tms_shdr">See who is leading Tagalong's future</p>
        <div class="tms_mbrs">
          <div class="tms_mbr">
            {/* Image */}
            <img src={ rohan_img } class="tms_mbr_img" />
            {/* Name */} 
            <p class="tms_mbr_nme">Rohan Bhalla</p>
            {/* Favorite Event */}
            <p class="tms_mbr_snme">
              Backend, Database
            </p>
            <p class="tms_mbr_tglng_hdr">I Tagalong To...</p>
            <o class="tms_mbr_tglng_dtls">Bond Movies, Other Movies, Food Outings, and Exploring NY</o>
          </div>
          
          <div class="tms_mbr">
            {/* Image */}
            <img src={ jeff_img } class="tms_mbr_img" />
            {/* Name */} 
            <p class="tms_mbr_nme">Jeff Liu</p>
            {/* Favorite Event */}
            <p class="tms_mbr_snme">
              Frontend
            </p>
            <p class="tms_mbr_tglng_hdr">I Tagalong To...</p>
            <o class="tms_mbr_tglng_dtls">Coding Events, Hackathons, and Waterpolo</o>
          </div>
          <div class="tms_mbr">
            {/* Image */}
            <img src={ berry_img } class="tms_mbr_img" />
            {/* Name */} 
            <p class="tms_mbr_nme">Berry Liu</p>
            {/* Favorite Event */}
            <p class="tms_mbr_snme">
              Backend
            </p>
            <p class="tms_mbr_tglng_hdr">I Tagalong...</p>
            <o class="tms_mbr_tglng_dtls">Gaming, Basketball, and Other Sports Events</o>
          </div>
          <div class="tms_mbr">
            {/* Image */}
            <img src={ nathan_img } class="tms_mbr_img" />
            {/* Name */} 
            <p class="tms_mbr_nme">Nathan Smith</p>
            {/* Favorite Event */}
            <p class="tms_mbr_snme">
              Frontend, Sendgrid
            </p>
            <p class="tms_mbr_tglng_hdr">I Tagalong To...</p>
            <o class="tms_mbr_tglng_dtls">Orchestra, Opera, Racing, Movies, & Church</o>
          </div>
        </div>
      </div>
      
      {/* Faqs */}
      <div class="faqs" id="faqs">
        <p class="faq_hdr">Frequently Asked Questions</p>
        <p class="faq_shdr">Looking for something else? <a href="mailto:nms9607@nyu.edu" class="faq_shdr_lnk">Email Us</a></p>

        <div class="faq_qstn">
          <p class="fqstn_hdr">Can I Have Private Profiles?</p>
          <p class="fqstn_shdr">Considering that we believe events should be often and low-barrier of entry, we've worked to make the event creation process as simple as possible. By simple adding details like the name, location, and otherwise, we'll be able to send this throughout your friend groups and let others know about it.</p>
        </div>

        <div class="faq_qstn">
          <p class="fqstn_hdr">How Can I Create An Event?</p>
          <p class="fqstn_shdr">While a big focus of our Tagalong mission is to keep your data secure, we are currently operating a public only beta of the site. This allows us to easily focus on the community and connections. In the future, we plan on adding more restrictive policies for public profiles, requiring approval for friendships, and more privacy options.</p>
        </div>

        <div class="faq_qstn">
          <p class="fqstn_hdr">Can I Notify Those Attending My Events?</p>
          <p class="fqstn_shdr">Absolutely, we know that you won't be glued to your Tagalong account, so notifications are embedded into our system. When you want to send a message to your group, you can easily send a message and we'll email all of those that have chosen to come to your event. Let us take care of this for you. </p>
        </div>
      </div>

      <div class="indx_btm"></div>
    </div>
  );
}