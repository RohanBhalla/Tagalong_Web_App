import Navbar from "../components/Navbar";
import React, { useEffect } from 'react';


export default function Search() {
  useEffect(() => {
    const importStyles = async () => {
      try {
        const module = await import('./styling/Search.css');
        // You can access the imported styles here
      } catch (error) {
        console.error('Error loading CSS:', error);
      }
    };
    importStyles();
  }, []);
  return (
     <div>
      <div class="pge_box">
        <div class="pge_menu">
          <Navbar />
        </div>
        <div class="pge_cnt">
          This is the search page
        </div>
      </div>

    </div>
  );
}
