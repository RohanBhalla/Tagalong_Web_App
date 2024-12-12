import "./App.css";
import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Index from "./pages/Index";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Explore from "./pages/Explore";
import Event from "./pages/Event";
import Calendar from "./pages/Calendar";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Settings from "./pages/Settings";
import EventForm from "./pages/EventForm";
import Notifications from "./pages/Notifications";
import EventFormEdit from "./pages/EditEvent";
import { Helmet } from "react-helmet";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route exact path="/" element={<Index />} />
          <Route exact path="/home" element={<Home />} />
          <Route exact path="/search" element={<Search />} />
          <Route exact path="/settings" element={<Settings />} />
          <Route exact path="/create" element={<EventForm />} />
          <Route exact path="/explore" element={<Explore />} />
          <Route exact path="/event" element={<Event />} />
          <Route exact path="/edit" element={<EventFormEdit />} />
          <Route exact path="/calendar" element={<Calendar />} />
          <Route exact path="/profile" element={<Profile />} />
          <Route exact path="/login" element={<Login />} />
          <Route exact path="/signup" element={<Signup />} />
          <Route exact path="/notifications" element={<Notifications />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
