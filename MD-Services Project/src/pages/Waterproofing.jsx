import React, { useState, useEffect, useRef } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { defaultWaterproofing } from "../data/defaultServices";

export default function Waterproofing() {
  const [items, setItems] = useState(defaultWaterproofing);
  const [loading] = useState(false); // Zero-latency initialization
  const [activeVideoId, setActiveVideoId] = useState(null);
  const videoRefs = useRef({});

  useEffect(() => {
    async function fetchData() {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Firestore fetch timeout")), 3000)
      );

      try {
        const q = query(collection(db, "waterproofing"), orderBy("order", "asc"));
        const snapshot = await Promise.race([getDocs(q), timeoutPromise]);
        
        if (!snapshot.empty) {
          const fetchedItems = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
          }));
          setItems(fetchedItems);
        }
      } catch (error) {
        console.warn("Firestore fetch failed, falling back to default local data:", error);
      }
    }
    fetchData();
  }, []);

  const handleMouseEnter = (itemId) => {
    const video = videoRefs.current[itemId];
    if (video) {
      Object.keys(videoRefs.current).forEach((key) => {
        if (key !== itemId && videoRefs.current[key]) {
          videoRefs.current[key].pause();
        }
      });
      video.muted = true;
      video.play().catch((err) => console.log("Hover play blocked:", err));
      setActiveVideoId(itemId);
    }
  };

  const handleMouseLeave = (itemId) => {
    const video = videoRefs.current[itemId];
    if (video) {
      video.pause();
      setActiveVideoId(null);
    }
  };

  const handleVideoClick = (itemId) => {
    const video = videoRefs.current[itemId];
    if (video) {
      if (video.requestFullscreen) {
        video.requestFullscreen();
      } else if (video.webkitRequestFullscreen) {
        video.webkitRequestFullscreen();
      }
      video.muted = false;
      video.controls = true;
      video.play().catch((err) => console.error("Play error:", err));
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      const fullscreenEl = document.fullscreenElement || document.webkitFullscreenElement;
      if (!fullscreenEl) {
        Object.keys(videoRefs.current).forEach((key) => {
          const video = videoRefs.current[key];
          if (video) {
            video.muted = true;
            video.controls = false;
            video.pause();
          }
        });
        setActiveVideoId(null);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, []);

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <header style={{ background: "var(--secondary-color)", color: "white", padding: "120px 0 60px", textAlign: "center" }}>
        <div className="container">
          <h1>Waterproofing Solutions</h1>
          <p>Expert leak protection for terraces, bathrooms, and walls.</p>
        </div>
      </header>

      <section className="section-padding">
        <div className="container">
          <div className="pest-grid-layout">
            {items.map((item, index) => (
              <div key={item.id || index} className="pest-single-card">
                <div className="card-header">
                  <h3>{`${index + 1}. ${item.title}`}</h3>
                </div>

                {item.mediaType === "video" ? (
                  <div 
                    className="video-wrapper"
                    onMouseEnter={() => handleMouseEnter(item.id || index)}
                    onMouseLeave={() => handleMouseLeave(item.id || index)}
                    onClick={() => handleVideoClick(item.id || index)}
                    style={{ cursor: "pointer", position: "relative" }}
                  >
                    <video
                      ref={(el) => (videoRefs.current[item.id || index] = el)}
                      preload="metadata"
                      muted
                      loop
                      playsInline
                      className="main-video"
                      src={item.mediaUrl}
                    />
                  </div>
                ) : (
                  <div className="media-display">
                    <img src={item.mediaUrl} alt={item.title} />
                  </div>
                )}

                <div className="card-desc">
                  <p>{item.description || "Expert waterproofing treatment."}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
