document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Mobile Menu Toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        
        // Change icon from hamburger to 'X'
        const icon = hamburger.querySelector('i');
        if (navLinks.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });

    // Close menu when a link is clicked
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            hamburger.querySelector('i').classList.remove('fa-times');
            hamburger.querySelector('i').classList.add('fa-bars');
        });
    });

    // 2. Scroll Animation (Intersection Observer)
    const observerOptions = {
        threshold: 0.15 // Trigger when 15% of the element is visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => observer.observe(el));
});
// --- Hero Slider Logic ---
const slides = document.querySelectorAll('.slide');
let currentSlide = 0;
const slideInterval = 5000; // Switch every 5 seconds

function nextSlide() {
    // 1. Remove 'active' class from current slide
    slides[currentSlide].classList.remove('active');
    
    // 2. Calculate next slide index (loop back to 0 if at end)
    currentSlide = (currentSlide + 1) % slides.length;
    
    // 3. Add 'active' class to new slide
    slides[currentSlide].classList.add('active');
}

// Start the timer
setInterval(nextSlide, slideInterval);
/* --- Live Counter Animation --- */
const counters = document.querySelectorAll('.counter');
const speed = 200; // The lower the slower

const animateCounters = () => {
    counters.forEach(counter => {
        const updateCount = () => {
            const target = +counter.getAttribute('data-target');
            const count = +counter.innerText;
            
            // Lower inc to slow and higher to slow
            const inc = target / speed;

            if (count < target) {
                // Add inc to count and output in counter
                counter.innerText = Math.ceil(count + inc);
                // Call function every ms
                setTimeout(updateCount, 20);
            } else {
                counter.innerText = target;
            }
        };
        updateCount();
    });
};

// Trigger animation when section is in view
const statsSection = document.querySelector('.stats-grid');
let animated = false;

window.addEventListener('scroll', () => {
    if(!statsSection) return; // Safety check
    
    const sectionPos = statsSection.getBoundingClientRect().top;
    const screenPos = window.innerHeight / 1.2;

    if(sectionPos < screenPos && !animated) {
        animateCounters();
        animated = true; // Ensure it only runs once
    }
});
const video = document.getElementById('myVideo');
const pipBtn = document.getElementById('pipBtn');
const wrapper = document.querySelector('.video-wrapper');
let hideTimeout;

// 1. Logic to show button on Mobile Tap
function toggleControls() {
    // Add the class to show the button
    wrapper.classList.add('show-mobile-btn');
    pipBtn.classList.add('active');

    // Clear any existing timer so it doesn't disappear too fast
    clearTimeout(hideTimeout);

    // Hide it again after 3 seconds
    hideTimeout = setTimeout(() => {
        wrapper.classList.remove('show-mobile-btn');
        pipBtn.classList.remove('active');
    }, 3000);
}

// 2. Logic to Trigger Picture-in-Picture
pipBtn.addEventListener('click', async (e) => {
    e.stopPropagation(); // Prevent the click from triggering the toggleControls again
    
    try {
        if (document.pictureInPictureEnabled) {
            // Standard (Android/Chrome/Edge)
            if (video !== document.pictureInPictureElement) {
                await video.requestPictureInPicture();
            } else {
                await document.exitPictureInPicture();
            }
        } else if (video.webkitSupportsPresentationMode) {
            // iOS (iPhone Safari)
            video.webkitSetPresentationMode(video.webkitPresentationMode === "picture-in-picture" ? "inline" : "picture-in-picture");
        } else {
            alert("PiP not supported on this device");
        }
    } catch (error) {
        console.error("PiP Error:", error);
    }
});