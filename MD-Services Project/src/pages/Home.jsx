import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

// Import local assets
import logoImg from "../assets/images/logo.jpeg";
import firstImg from "../assets/images/first.jpg";
import housekeepingImg from "../assets/images/housekeeping.jpeg";
import waterproofingImg from "../assets/images/waterproofing.jpeg";
import waterproofImg from "../assets/images/waterproof.jpeg";
import bathroomImg from "../assets/images/bathroom.jpg";
import pestCarouselImg from "../assets/images/pest_carousel.png";

// Sub-component for animated counter
function Counter({ target, duration = 2000 }) {
  const [count, setCount] = useState(0);
  const elementRef = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          let startTimestamp = null;
          const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            setCount(Math.floor(progress * target));
            if (progress < 1) {
              window.requestAnimationFrame(step);
            } else {
              setCount(target);
            }
          };
          window.requestAnimationFrame(step);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [target, duration]);

  return <h2 ref={elementRef} className="counter">{count}</h2>;
}

export default function Home() {
  // Hero Slides (4 slides total, including the new Pest Services slide with custom photo)
  const slides = [
    {
      image: firstImg,
      kicker: "WELCOME TO",
      title: "MD Services",
      subtitle: "16+ Years of Trust, Shaping Safe & Clean Homes"
    },
    {
      image: pestCarouselImg,
      kicker: "EXPERT SERVICES",
      title: "Pest Services",
      subtitle: "Eco-friendly, certified treatments for a pest-free home environment"
    },
    {
      image: housekeepingImg,
      kicker: "OUR SERVICE EXCELLENCE",
      title: "Professional Housekeeping",
      subtitle: "Deep cleaning services for a spotless, sanitary environment"
    },
    {
      image: waterproofingImg,
      kicker: "ADVANCED TECH SOLUTIONS",
      title: "Waterproofing Specialist",
      subtitle: "Expert leak protection for terraces, bathrooms, and walls"
    }
  ];
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    const slideInterval = setInterval(() => {
      nextSlide();
    }, 4000); // Automatically change every 4 seconds
    return () => clearInterval(slideInterval);
  }, [currentSlide]); // Reset timer on manual slide change

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section id="home" className="hero-slider-section">
        <div className="slider-container">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`slide slide-${index} ${index === currentSlide ? "active" : ""}`}
              style={{ backgroundImage: `url(${slide.image})` }}
            ></div>
          ))}
        </div>
        <div className="hero-overlay"></div>
        
        {/* Navigation Arrows */}
        <button className="carousel-arrow prev" onClick={prevSlide} aria-label="Previous Slide">
          <i className="fas fa-chevron-left"></i>
        </button>
        <button className="carousel-arrow next" onClick={nextSlide} aria-label="Next Slide">
          <i className="fas fa-chevron-right"></i>
        </button>

        {/* Hero Content */}
        <div className="hero-content">
          <span className="hero-kicker fade-in-up">{slides[currentSlide].kicker}</span>
          <h1 className="fade-in-up">{slides[currentSlide].title}</h1>
          <p className="fade-in-up delay-1">{slides[currentSlide].subtitle}</p>
          <div className="hero-buttons fade-in-up delay-2">
            <button onClick={() => scrollToSection("services")} className="explore-btn">
              Explore Services
            </button>
            <button onClick={() => scrollToSection("contact")} className="learn-more-btn">
              Contact Us
            </button>
          </div>
          
          {/* Dash Indicators (Now inside hero-content to prevent overlay collision) */}
          <div className="carousel-indicators-inner fade-in-up delay-2">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`indicator-dash ${index === currentSlide ? "active" : ""}`}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              ></button>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about section-padding">
        <div className="container">
          <div className="section-header">
            <h2>Why Choose MD Services?</h2>
            <div className="line"></div>
            <p>More than just a service provider — we are your home's guardians.</p>
          </div>

          <div className="about-content">
            <div className="about-image">
              <img src={logoImg} alt="Pest Control Expert" />
              <div className="experience-badge">
                <span className="years">16+</span>
                <span className="text">Years of<br />Experience</span>
              </div>
            </div>

            <div className="about-text">
              <h3>Comprehensive Home Care Experts</h3>
              <p>
                At PestMD, we combine advanced technology with eco-conscious methods.
                Whether it's eliminating termites, waterproofing your terrace, or deep cleaning
                your home, we deliver hospital-grade hygiene standards.
              </p>

              <ul className="features-list">
                <li>
                  <i className="fas fa-check-circle"></i>
                  <strong>Certified Experts:</strong> Trained professionals for every service.
                </li>
                <li>
                  <i className="fas fa-check-circle"></i>
                  <strong>Eco-Friendly:</strong> 100% Pet & Child safe chemicals.
                </li>
                <li>
                  <i className="fas fa-check-circle"></i>
                  <strong>Warranty Backed:</strong> We stand by our quality.
                </li>
              </ul>

              <div className="stats-grid">
                <div className="stat-item">
                  <div style={{ display: 'inline-flex', alignItems: 'baseline' }}>
                    <Counter target={5000} />
                    <span>+</span>
                  </div>
                  <p>Projects Done</p>
                </div>
                <div className="stat-item">
                  <div style={{ display: 'inline-flex', alignItems: 'baseline' }}>
                    <Counter target={150} />
                    <span>+</span>
                  </div>
                  <p>Expert Team</p>
                </div>
                <div className="stat-item">
                  <div style={{ display: 'inline-flex', alignItems: 'baseline' }}>
                    <Counter target={4000} />
                    <span>+</span>
                  </div>
                  <p>Happy Clients</p>
                </div>
              </div>

              <button
                onClick={() => scrollToSection("contact")}
                className="cta-btn"
                style={{ marginTop: "20px", border: "none", cursor: "pointer" }}
              >
                Get A Free Inspection
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="services section-padding">
        <div className="container">
          <div className="section-header">
            <h2>Our Professional Services</h2>
            <div className="line"></div>
            <p>Select a service to view details, videos.</p>
          </div>

          <div className="services-grid-main">
            <Link to="/pest-control" className="service-main-card">
              <div className="card-image">
                <img src={firstImg} alt="Pest Control" />
                <div className="overlay">
                  <i className="fas fa-arrow-right"></i>
                </div>
              </div>
              <div className="card-content">
                <i className="fas fa-bug icon"></i>
                <h3>Pest Control</h3>
                <p>Termites, Cockroaches, Bed Bugs, Rats & More.</p>
                <span className="link-text">View Treatments & Videos</span>
              </div>
            </Link>

            <Link to="/waterproofing" className="service-main-card">
              <div className="card-image">
                <img src={waterproofImg} alt="Waterproofing" />
                <div className="overlay">
                  <i className="fas fa-arrow-right"></i>
                </div>
              </div>
              <div className="card-content">
                <i className="fas fa-fill-drip icon"></i>
                <h3>Waterproofing</h3>
                <p>Terrace Leakage, PU Grouting & Bathroom Sealing.</p>
                <span className="link-text">View Solutions</span>
              </div>
            </Link>

            <Link to="/housekeeping" className="service-main-card">
              <div className="card-image">
                <img src={housekeepingImg} alt="Housekeeping" />
                <div className="overlay">
                  <i className="fas fa-arrow-right"></i>
                </div>
              </div>
              <div className="card-content">
                <i className="fas fa-broom icon"></i>
                <h3>House Keeping</h3>
                <p>Deep Cleaning, Water Tank & Sump Cleaning.</p>
                <span className="link-text">View Services</span>
              </div>
            </Link>

            <Link to="/bathroom-cleaning" className="service-main-card">
              <div className="card-image">
                <img src={bathroomImg} alt="Bathroom Cleaning" />
                <div className="overlay">
                  <i className="fas fa-arrow-right"></i>
                </div>
              </div>
              <div className="card-content">
                <i className="fas fa-bath icon"></i>
                <h3>Bathroom Cleaning</h3>
                <p>Tile Scrubbing, Stain Removal & Sanitization.</p>
                <span className="link-text">View Details</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact section-padding">
        <div className="container">
          <div className="section-header">
            <h2>Contact Us</h2>
            <div className="line"></div>
            <p>Reach out to us instantly for bookings.</p>
          </div>

          <div className="contact-icons-container">
            <a href="tel:+919959955574" className="contact-item phone">
              <div className="icon-circle">
                <i className="fas fa-phone-alt"></i>
              </div>
              <span>Call Now</span>
            </a>

            <a
              href="https://wa.me/918179712911?text=Hi,MD%20Services"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-item whatsapp"
            >
              <div className="icon-circle">
                <i className="fab fa-whatsapp"></i>
              </div>
              <span>WhatsApp</span>
            </a>

            <a
              href="https://instagram.com/munieswarp"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-item instagram"
            >
              <div className="icon-circle">
                <i className="fab fa-instagram"></i>
              </div>
              <span>Instagram</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
