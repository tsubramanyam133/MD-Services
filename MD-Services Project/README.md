# MD-Services

A modern, high-performance, and responsive on-demand home care and cleaning services web platform. MD-Services features an interactive customer portal and a comprehensive administrative CRM dashboard to manage service configurations, content, and media uploads dynamically.

🚀 **Live Site**: [https://md-services-care.vercel.app](https://md-services-care.vercel.app)

---

## 🛠️ Technology Stack

MD-Services is built utilizing a modern, serverless cloud architecture:

*   **Frontend Library**: React 19 & React Router DOM (v7)
*   **Build System & Tooling**: Vite 8 & ESLint
*   **Database & Storage**: Firebase Cloud Firestore & Firebase Storage
*   **Security & Identity**: Firebase Authentication
*   **Media Hosting API**: Cloudinary REST Upload API (unsigned uploads for media delivery)
*   **Icons**: Lucide React & FontAwesome v6
*   **Hosting & CI/CD**: Vercel (SPA rewrite rules enabled)

---

## 🌟 Key Features

### 1. Interactive Customer Landing Pages
*   **Fluid Carousels**: Dynamic autoplaying hero sliders highlighting service quality.
*   **Animated Counter Widgets**: Custom IntersectionObserver-backed statistic counters for client trust indicators.
*   **Responsive Services Grid**: Seamless desktop and mobile grid layout redirecting users to dedicated service sub-pages:
    *   Pest Control
    *   Waterproofing Specialist
    *   Professional Housekeeping
    *   Bathroom Sanitization & Cleaning
*   **Direct Action CTA**: One-click booking pathways via WhatsApp, direct call, or Instagram.

### 2. Administrative CRM Dashboard
*   **Secure Authentication**: Role-based access control leveraging Firebase Auth to protect the CRUD workspace.
*   **Live Database Management (CRUD)**: Create, read, update, and delete service offerings in real-time. Changes propagate to client-facing pages instantly.
*   **Dynamic Media Upload Pipeline**: Supports multiple layout types:
    *   Single Image (JPEG/PNG)
    *   Single Video (looping, autoplaying MP4/WebM)
    *   Before/After Video Comparison frames
*   **Smart Network & CORS Fallback**: 
    *   Integrates Cloudinary upload streams with real-time progress indicators.
    *   Implements a local client-side HTML5 canvas-based image compression fallback (under 100KB target size) to ensure system usability even under strict Firebase Storage CORS constraints or network disruptions.

---

## 📂 Project Structure

```text
├── vercel.json                 # Vercel Single Page App rewrite routes
├── vite.config.js              # Vite bundler options (base directory set to root)
├── src/
│   ├── main.jsx                # Application root mounting file
│   ├── App.jsx                 # Routing configuration (React Router DOM)
│   ├── firebase.js             # Firebase SDK client initialization & Cloudinary endpoints
│   ├── index.css               # Main design tokens & global CSS styles
│   ├── admin.css               # Layout styling for the CRM panel
│   ├── components/             # Reusable UI modules (Navbar, Footer, Counter)
│   ├── data/                   # Default offline seeder data structures
│   ├── utils/                  # Firestore database seeder utilities
│   └── pages/                  # Page modules
│       ├── Home.jsx            # Customer-facing homepage
│       ├── Admin.jsx           # CRM control panel
│       ├── PestControl.jsx     # Pest services view
│       ├── Waterproofing.jsx   # Waterproofing solutions view
│       ├── Housekeeping.jsx    # Cleaning services view
│       └── BathroomCleaning.jsx# Sanitization services view
```

---

## ⚙️ Local Development Setup

To run this project locally, follow these steps:

### Prerequisites
*   Node.js v20.x or higher
*   NPM v10.x or higher

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/tsubramanyam133/MD-Services.git
cd MD-Services
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory and populate it with your Firebase and Cloudinary credentials:

```ini
# Firebase Web App Credentials
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
VITE_FIREBASE_PROJECT_ID=your_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id_here

# Cloudinary Credentials (Required for Admin dashboard video uploads)
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_upload_preset
```

### 3. Spin up Dev Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🚀 Deployment to Vercel

The application is deployed using the Vercel CLI.

1.  **Build Validation**: Run `npm run build` locally to verify that the bundling finishes with no errors.
2.  **Deploy**: Run the following command in the project directory:
    ```bash
    npx vercel --prod --yes
    ```
    This automatically builds and pushes the changes, routing static assets directly and forwarding deep page URLs to the index document.
