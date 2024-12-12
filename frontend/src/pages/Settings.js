import Navbar from "../components/Navbar";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import SmartyStreetsSDK from "smartystreets-javascript-sdk";
import exampleImage from "../components/static/images/Berry_img.jpg";

function isValidEmail(email) {
  const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return regex.test(email);
}

export default function Search() {
  const locationInputRef = useRef(null);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [locationInput, setLocationInput] = useState("");
  const [profilePicturePreview, setProfilePicturePreview] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [profileData, setProfileData] = useState(null);
  const [profilePicture, setProfilePicture] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    // ... existing useEffect code

    // Set initial profile picture preview
    if (profilePicture) {
      setProfilePicturePreview(`/images/${profilePicture}`);
    }
  }, [profilePicture]);
  useEffect(() => {
    const importStyles = async () => {
      try {
        const module = await import("./styling/Settings.css");
        // You can access the imported styles here
      } catch (error) {
        console.error("Error loading CSS:", error);
      }
    };
    importStyles();

    // Adding SmartyStreet API
    const websiteKey = "184269683753434471";
    const credentials = new SmartyStreetsSDK.core.SharedCredentials(websiteKey);

    let clientBuilder = new SmartyStreetsSDK.core.ClientBuilder(
      credentials
    ).withLicenses(["us-autocomplete-pro-cloud"]);
    let client = clientBuilder.buildUsAutocompleteProClient();

    locationInputRef.current = client;

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
            //"Content-Type": "application/json",
            Authorization: authToken,
          },
        });
        const data = await response.json();
        if (data.profile_data) {
          setFirstName(data.profile_data.firstname);
          setLastName(data.profile_data.lastname);
          setEmail(data.profile_data.email);
          setDescription(data.profile_data.userdescription);
          setLocationInput(data.profile_data.useraddress);
          setProfilePicture(data.profile_data.profilepic);
          console.log(data.profile_data);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfileData();
  }, []);

  const fetchLocationSuggestions = async (input) => {
    if (!input) {
      setLocationSuggestions([]);
      return;
    }
    const client = locationInputRef.current;

    let lookup = new SmartyStreetsSDK.usAutocompletePro.Lookup(input);
    lookup.maxResults = 1;
    lookup.source = "all";

    try {
      const response = await client.send(lookup);
      setLocationSuggestions(response.result); // Adjust based on actual response structure
    } catch (error) {
      console.error("Error fetching location suggestions:", error);
    }
  };

  const handleLocationInputChange = (e) => {
    setLocationInput(e.target.value);
    fetchLocationSuggestions(e.target.value);
  };

  const handleLocationSelect = (suggestion) => {
    setLocationInput(
      suggestion.streetLine +
        " " +
        suggestion.city +
        ", " +
        suggestion.state +
        " " +
        suggestion.zipcode
    );
    setLocationSuggestions([]);
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    function getCookie(name) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(";").shift();
    }

    const authToken = getCookie("authToken");
    // Construct the PUT request payload
    const formData = new FormData();

    // Append form fields
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("userDescription", description);
    formData.append("userAddress", locationInput);
    if (selectedFile) {
      formData.append("image", selectedFile);
    }
    try {
      // Send the PUT request
      const response = await fetch("http://localhost:8080/users", {
        method: "PUT",
        headers: {
          Authorization: authToken,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        // Handle success
        console.log("Profile updated:", data);

        // Optionally navigate to another page or show a success message
      } else {
        // Handle errors
        console.error("Error updating profile:", data.error);
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file); // Set the selected file

      // Create a URL for the new file and update the preview
      const newProfilePicturePreview = URL.createObjectURL(file);
      setProfilePicturePreview(newProfilePicturePreview);
    }
  };

  return (
    <div>
      <div className="pge_box">
        <div className="pge_menu">
          <Navbar />
        </div>

        <div className="pge_cnt">
          <form className="pro_box" onSubmit={handleSubmit}>
            <div className="pro_top">
              <h1 className="pro_hdr">Edit Your Profile</h1>
              <button type="submit" className="pro_sve_btn">
                Save
              </button>
            </div>
            <p className="pro_shdr">
              Choose how you're displayed to the Tagalong community
            </p>

            <div className="pro_dtls">
              <p className="pro_dtls_hdr">Profile Image</p>
              <div className="pro_dtls_img">
                <div className="pro_img_box">
                  <img
                    src={profilePicturePreview || null}
                    className="pro_img"
                    alt="Profile"
                  />
                </div>
                <div className="pro_dtls_box">
                  <label htmlFor="imageUpload" className="pro_dtls_upld">
                    Upload New
                  </label>
                  <input
                    type="file"
                    id="imageUpload"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                  <a
                    className="pro_dtls_rmve"
                    onClick={() => {
                      setProfilePicture("default.jpg");
                    }}
                  >
                    Remove Image
                  </a>
                </div>
              </div>

              <p className="pro_dtls_hdr">First Name</p>
              <input
                type="text"
                className="pro_dtls_inpt"
                placeholder="ex: John Doe..."
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                maxLength="120"
              />
              <p className="pro_dtls_hdr">Last Name</p>
              <input
                type="text"
                className="pro_dtls_inpt"
                placeholder="ex: John Doe..."
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                maxLength="120"
              />

              <p className="pro_dtls_hdr">Address</p>
              <input
                id="autocomplete"
                type="text"
                className="pro_dtls_inpt"
                placeholder="ex: NY"
                value={locationInput}
                onChange={handleLocationInputChange}
                maxLength="120"
              />
              {locationSuggestions.length > 0 && (
                <ul className="location-suggestions-dropdown">
                  <li
                    onClick={() => handleLocationSelect(locationSuggestions[0])}
                  >
                    {locationSuggestions[0].streetLine}{" "}
                    {locationSuggestions[0].city}
                    {", "}
                    {locationSuggestions[0].state}{" "}
                    {locationSuggestions[0].zipcode}
                  </li>
                </ul>
              )}
              <p className="pro_dtls_hdr">Email</p>
              <input
                type="email"
                className="pro_dtls_inpt"
                placeholder="ex: ...doeman@gmail.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
                maxLength="120"
              />
              <p className="pro_dtls_hdr">Password</p>
              <input
                type="password"
                className="pro_dtls_inpt"
                placeholder="ex: password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                maxLength="120"
              />

              <p className="pro_dtls_hdr">Description</p>
              <textarea
                className="pro_dtls_txtara"
                placeholder="A bit about yourself..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
