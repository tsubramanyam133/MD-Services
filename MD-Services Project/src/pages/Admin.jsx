import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut 
} from "firebase/auth";
import { 
  collection, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  updateDoc,
  doc, 
  query, 
  orderBy 
} from "firebase/firestore";
import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL,
  deleteObject
} from "firebase/storage";
import { 
  LogOut, 
  Plus, 
  Trash2, 
  Pencil,
  FileText, 
  FolderOpen, 
  X, 
  Bug, 
  Droplet, 
  Brush, 
  Bath,
  Database,
  Eye
} from "lucide-react";
import { auth, db, storage, cloudinaryConfig } from "../firebase";
import { seedDatabase } from "../utils/seeder";
import "../admin.css";

// Helper to compress and convert images to Base64 (failsafe fallback for Storage CORS/rules issues)
const compressAndEncodeImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to highly-compressed JPEG (under 100KB typically)
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

// Helper to upload a file directly to Cloudinary using unsigned upload
const uploadToCloudinary = (file, setProgress) => {
  return new Promise((resolve, reject) => {
    if (!cloudinaryConfig.cloudName || !cloudinaryConfig.uploadPreset) {
      reject(new Error("Cloudinary is not configured. Please fill cloudName and uploadPreset in src/firebase.js, or use the 'Enter Direct URL' option."));
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", cloudinaryConfig.uploadPreset);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/upload`, true);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const percentComplete = Math.round((e.loaded / e.total) * 100);
        setProgress(percentComplete);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200 || xhr.status === 201) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response.secure_url);
        } catch (err) {
          reject(new Error("Failed to parse Cloudinary response: " + err.message));
        }
      } else {
        reject(new Error(`Cloudinary upload failed: status ${xhr.status}. ${xhr.responseText}`));
      }
    };

    xhr.onerror = () => {
      reject(new Error("Cloudinary network error occurred. Please check your internet connection."));
    };

    xhr.send(formData);
  });
};

export default function Admin() {
  const navigate = useNavigate();
  
  // Auth State
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  // CRM State
  const [activeCategory, setActiveCategory] = useState("pest-control");
  const [items, setItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mediaType, setMediaType] = useState("image");
  const [mediaSource, setMediaSource] = useState("file"); // "file" or "url"
  const [file1, setFile1] = useState(null); // image or video or before-video
  const [file2, setFile2] = useState(null); // after-video (for before-after compare)
  const [inputUrl1, setInputUrl1] = useState(""); // URL for image/video/before-video
  const [inputUrl2, setInputUrl2] = useState(""); // URL for after-video
  const [uploadProgress1, setUploadProgress1] = useState(0);
  const [uploadProgress2, setUploadProgress2] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [formError, setFormError] = useState("");
  const [editingItem, setEditingItem] = useState(null);

  // Clear state and open for Add Mode
  const openAddModal = () => {
    setEditingItem(null);
    setTitle("");
    setDescription("");
    setMediaType("image");
    setMediaSource("file");
    setFile1(null);
    setFile2(null);
    setInputUrl1("");
    setInputUrl2("");
    setUploadProgress1(0);
    setUploadProgress2(0);
    setFormError("");
    setIsModalOpen(true);
  };

  // Populate state and open for Edit Mode
  const handleEditClick = (item) => {
    setEditingItem(item);
    setTitle(item.title);
    setDescription(item.description || "");
    setMediaType(item.mediaType);
    
    if (item.mediaUrl) {
      setMediaSource("url");
      if (item.mediaType === "before-after-videos") {
        const urls = item.mediaUrl.split(",");
        setInputUrl1(urls[0] || "");
        setInputUrl2(urls[1] || "");
      } else {
        setInputUrl1(item.mediaUrl);
        setInputUrl2("");
      }
    } else {
      setMediaSource("file");
      setInputUrl1("");
      setInputUrl2("");
    }
    
    setFile1(null);
    setFile2(null);
    setUploadProgress1(0);
    setUploadProgress2(0);
    setFormError("");
    setIsModalOpen(true);
  };

  // Track auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      
      if (currentUser) {
        // Automatically seed database in the background (non-blocking)
        seedDatabase().catch((err) => console.warn("Background seeding failed:", err));
        fetchCategoryItems(activeCategory);
      }
    });
    return unsubscribe;
  }, [activeCategory]);

  // Fetch items for the active category
  const fetchCategoryItems = async (category) => {
    setItemsLoading(true);
    
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Firestore fetch timed out")), 5000)
    );

    try {
      const q = query(collection(db, category), orderBy("order", "asc"));
      const snapshot = await Promise.race([getDocs(q), timeoutPromise]);
      const fetchedItems = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setItems(fetchedItems);
    } catch (error) {
      console.error("Error fetching items: ", error);
      // If Firestore fails, load fallback data to keep Admin panel functional
      let fallbacks = [];
      if (category === "pest-control") {
        const { defaultPestControl } = await import("../data/defaultServices");
        fallbacks = defaultPestControl;
      } else if (category === "waterproofing") {
        const { defaultWaterproofing } = await import("../data/defaultServices");
        fallbacks = defaultWaterproofing;
      } else if (category === "housekeeping") {
        const { defaultHousekeeping } = await import("../data/defaultServices");
        fallbacks = defaultHousekeeping;
      } else if (category === "bathroom-cleaning") {
        const { defaultBathroomCleaning } = await import("../data/defaultServices");
        fallbacks = defaultBathroomCleaning;
      }
      setItems(fallbacks.map((item, idx) => ({ id: `fallback-${idx}`, ...item })));
    } finally {
      setItemsLoading(false);
    }
  };

  // Switch category tab
  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    fetchCategoryItems(category);
  };

  // Auth: Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setAuthError(error.message.replace("Firebase: ", ""));
    }
  };



  // Auth: Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setItems([]);
    } catch (error) {
      console.error("Logout Error: ", error);
    }
  };

  // CRM: Delete Item
  const handleDeleteItem = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this service item?")) return;
    try {
      const itemToDelete = items.find(item => item.id === itemId);
      
      // Delete document from Firestore
      await deleteDoc(doc(db, activeCategory, itemId));
      
      // If the item has an uploaded file in Firebase Storage, delete it too
      if (itemToDelete && itemToDelete.mediaUrl) {
        if (itemToDelete.mediaType === "before-after-videos") {
          const urls = itemToDelete.mediaUrl.split(",");
          for (const url of urls) {
            if (url && url.includes("firebasestorage.googleapis.com")) {
              const fileRef = ref(storage, url);
              await deleteObject(fileRef).catch(err => console.warn("Failed to clean up before/after file in Storage:", err));
            }
          }
        } else if (itemToDelete.mediaUrl.includes("firebasestorage.googleapis.com")) {
          const fileRef = ref(storage, itemToDelete.mediaUrl);
          await deleteObject(fileRef).catch(err => console.warn("Failed to clean up file in Storage:", err));
        }
      }
      
      setItems(items.filter((item) => item.id !== itemId));
    } catch (error) {
      alert("Error deleting item: " + error.message);
    }
  };

  // Upload progress helper
  const uploadFile = (file, path, setProgress) => {
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, path);
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(Math.round(progress));
        },
        (error) => {
          reject(error);
        },
        async () => {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadUrl);
        }
      );
    });
  };

  // CRM: Add Item Submit
  const handleAddItem = async (e) => {
    e.preventDefault();
    setFormError("");
    
    if (!title) {
      setFormError("Title is required.");
      return;
    }

    if (mediaSource === "file") {
      // Only require file if we are NOT editing, or if a file is uploaded
      const isNewFileNeeded = !editingItem;
      if (isNewFileNeeded) {
        if (mediaType !== "before-after-videos" && !file1) {
          setFormError("Please select a file to upload.");
          return;
        }

        if (mediaType === "before-after-videos" && (!file1 || !file2)) {
          setFormError("Please select both 'Before' and 'After' videos.");
          return;
        }
      }
    } else {
      if (mediaType !== "before-after-videos" && !inputUrl1) {
        setFormError("Please enter the media URL.");
        return;
      }

      if (mediaType === "before-after-videos" && (!inputUrl1 || !inputUrl2)) {
        setFormError("Please enter both 'Before' and 'After' video URLs.");
        return;
      }
    }

    setIsUploading(true);
    
    try {
      let finalMediaUrl = "";
      
      if (mediaSource === "url") {
        if (mediaType === "before-after-videos") {
          finalMediaUrl = `${inputUrl1.trim()},${inputUrl2.trim()}`;
        } else {
          finalMediaUrl = inputUrl1.trim();
        }
      } else {
        // Upload files
        const isCloudinaryActive = !!(cloudinaryConfig.cloudName && cloudinaryConfig.uploadPreset);

        if (mediaType === "before-after-videos") {
          if (editingItem && !file1 && !file2) {
            // Keep existing files if nothing new was selected
            finalMediaUrl = editingItem.mediaUrl;
          } else {
            let urlBefore = editingItem ? (editingItem.mediaUrl?.split(",")[0] || "") : "";
            let urlAfter = editingItem ? (editingItem.mediaUrl?.split(",")[1] || "") : "";
            
            if (file1) {
              if (isCloudinaryActive) {
                urlBefore = await uploadToCloudinary(file1, setUploadProgress1);
              } else {
                const pathBefore = `uploads/${activeCategory}/${Date.now()}_before_${file1.name}`;
                urlBefore = await uploadFile(file1, pathBefore, setUploadProgress1);
              }
            }
            if (file2) {
              if (isCloudinaryActive) {
                urlAfter = await uploadToCloudinary(file2, setUploadProgress2);
              } else {
                const pathAfter = `uploads/${activeCategory}/${Date.now()}_after_${file2.name}`;
                urlAfter = await uploadFile(file2, pathAfter, setUploadProgress2);
              }
            }
            finalMediaUrl = `${urlBefore},${urlAfter}`;
          }
        } else {
          // Single Image or Single Video
          if (editingItem && !file1) {
            // Keep existing file if nothing new was selected
            finalMediaUrl = editingItem.mediaUrl;
          } else {
            if (isCloudinaryActive) {
              try {
                finalMediaUrl = await uploadToCloudinary(file1, setUploadProgress1);
              } catch (cloudinaryError) {
                if (mediaType === "image") {
                  console.warn("Cloudinary upload failed, falling back to local base64 compression:", cloudinaryError);
                  setUploadProgress1(50);
                  finalMediaUrl = await compressAndEncodeImage(file1);
                  setUploadProgress1(100);
                } else {
                  throw cloudinaryError;
                }
              }
            } else {
              try {
                const pathSingle = `uploads/${activeCategory}/${Date.now()}_${file1.name}`;
                finalMediaUrl = await uploadFile(file1, pathSingle, setUploadProgress1);
              } catch (storageError) {
                if (mediaType === "image") {
                  console.warn("Storage upload failed, falling back to local base64 compression:", storageError);
                  setUploadProgress1(50);
                  finalMediaUrl = await compressAndEncodeImage(file1);
                  setUploadProgress1(100);
                } else {
                  throw storageError;
                }
              }
            }
          }
        }
      }

      // Save to Firestore with a timeout to prevent hanging
      const firestorePromise = editingItem
        ? updateDoc(doc(db, activeCategory, editingItem.id), {
            title,
            description,
            mediaType,
            mediaUrl: finalMediaUrl,
            updatedAt: new Date().toISOString()
          })
        : addDoc(collection(db, activeCategory), {
            title,
            description,
            mediaType,
            mediaUrl: finalMediaUrl,
            order: items.length + 1,
            createdAt: new Date().toISOString()
          });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Firestore database write timed out (8 seconds limit reached).")), 8000)
      );

      await Promise.race([firestorePromise, timeoutPromise]);

      // Reset form
      setTitle("");
      setDescription("");
      setFile1(null);
      setFile2(null);
      setInputUrl1("");
      setInputUrl2("");
      setUploadProgress1(0);
      setUploadProgress2(0);
      setEditingItem(null);
      setIsModalOpen(false);
      
      // Refresh list
      fetchCategoryItems(activeCategory);
    } catch (error) {
      console.error("Save/Upload Error:", error);
      let errMsg = error.message;
      if (errMsg.includes("CORS") || errMsg.includes("preflight") || errMsg.includes("net::ERR_FAILED")) {
        errMsg = "Network/CORS block. Ensure Firebase Storage or Cloudinary settings are configured correctly.";
      }
      setFormError("Upload / Save failed: " + errMsg);
    } finally {
      setIsUploading(false);
    }
  };

  if (authLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <h2>Verifying Admin session...</h2>
      </div>
    );
  }

  // Not Logged In -> Show Authentication Panel
  if (!user) {
    return (
      <div className="login-overlay">
        <div className="login-card">
          <h2>MD Services CRM</h2>
          <p>Sign in with your admin credentials to manage content.</p>

          {authError && <div className="error-msg">{authError}</div>}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                className="form-input" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@pestmd.com"
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input 
                type="password" 
                className="form-input" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            
            <button type="submit" className="login-btn">
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Logged In -> Show CRM Workspace
  return (
    <div className="admin-container">
      {/* Sidebar Navigation */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <h2>MD Services CRM</h2>
        </div>
        <ul className="sidebar-menu">
          <li 
            className={`sidebar-item ${activeCategory === "pest-control" ? "active" : ""}`}
            onClick={() => handleCategoryChange("pest-control")}
          >
            <Bug size={18} />
            <span>Pest Control</span>
          </li>
          <li 
            className={`sidebar-item ${activeCategory === "waterproofing" ? "active" : ""}`}
            onClick={() => handleCategoryChange("waterproofing")}
          >
            <Droplet size={18} />
            <span>Waterproofing</span>
          </li>
          <li 
            className={`sidebar-item ${activeCategory === "housekeeping" ? "active" : ""}`}
            onClick={() => handleCategoryChange("housekeeping")}
          >
            <Brush size={18} />
            <span>House Keeping</span>
          </li>
          <li 
            className={`sidebar-item ${activeCategory === "bathroom-cleaning" ? "active" : ""}`}
            onClick={() => handleCategoryChange("bathroom-cleaning")}
          >
            <Bath size={18} />
            <span>Bathroom Cleaning</span>
          </li>
        </ul>
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={16} style={{ marginRight: "8px" }} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-content">
        <header className="admin-header">
          <h4>Content Management Dashboard</h4>
          <button 
            className="exit-btn" 
            title="Go to Live Site"
            onClick={() => navigate("/")}
          >
            <Eye size={20} />
          </button>
        </header>

        <div className="admin-body">
          <div className="body-header">
            <h2>
              {activeCategory === "pest-control" && "Pest Control Management"}
              {activeCategory === "waterproofing" && "Waterproofing Management"}
              {activeCategory === "housekeeping" && "Housekeeping Management"}
              {activeCategory === "bathroom-cleaning" && "Bathroom Cleaning Management"}
            </h2>
            <button className="add-service-btn" onClick={openAddModal}>
              <Plus size={16} />
              Add Service
            </button>
          </div>

          <div className="card-table-container">
            {itemsLoading ? (
              <div style={{ textAlign: "center", padding: "40px" }}>Loading list...</div>
            ) : items.length === 0 ? (
              <div className="empty-state">
                <FileText size={64} />
                <p>No service items yet. Click "Add Service" to create one.</p>
              </div>
            ) : (
              <div className="service-items-list">
                {items.map((item) => (
                  <div key={item.id} className="service-item-row">
                    <div className="item-preview">
                      {item.mediaType === "video" ? (
                        <video src={item.mediaUrl} muted />
                      ) : item.mediaType === "before-after-videos" ? (
                        <video src={item.mediaUrl?.split(",")[0]} muted />
                      ) : (
                        <img src={item.mediaUrl} alt={item.title} />
                      )}
                    </div>
                    <div className="item-info">
                      <h4>{item.title}</h4>
                      <p>{item.description || "(No description provided)"}</p>
                    </div>
                    <div className="item-actions" style={{ display: "flex", gap: "8px" }}>
                      <button 
                        className="edit-action-btn"
                        onClick={() => handleEditClick(item)}
                        title="Edit Service"
                        type="button"
                      >
                        <Pencil size={18} />
                      </button>
                      <button 
                        className="delete-action-btn"
                        onClick={() => handleDeleteItem(item.id)}
                        title="Delete Service"
                        type="button"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add Service Modal */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <header className="modal-header">
              <h3>{editingItem ? "Edit Service Card" : "Add New Service Card"}</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </header>

            <form onSubmit={handleAddItem}>
              <div className="modal-body">
                {formError && <div className="error-msg">{formError}</div>}

                <div className="form-group">
                  <label>Service Title/Header *</label>
                  <input 
                    type="text" 
                    className="form-input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Bed Bugs Control"
                    required
                    disabled={isUploading}
                  />
                </div>

                <div className="form-group">
                  <label>Description (Optional)</label>
                  <textarea 
                    className="form-input"
                    rows="3"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe treatments or highlights..."
                    disabled={isUploading}
                  />
                </div>

                <div className="form-group">
                  <label>Media Layout Type</label>
                  <select 
                    className="form-input"
                    value={mediaType}
                    onChange={(e) => {
                      setMediaType(e.target.value);
                      setFile1(null);
                      setFile2(null);
                      setInputUrl1("");
                      setInputUrl2("");
                    }}
                    disabled={isUploading}
                  >
                    <option value="image">Single Image</option>
                    <option value="video">Single Video (looping, responsive)</option>
                    <option value="before-after-videos">Before / After Videos comparison</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Media Source</label>
                  <div style={{ display: "flex", gap: "20px", marginTop: "6px", marginBottom: "4px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "14px" }}>
                      <input 
                        type="radio" 
                        name="mediaSource" 
                        value="file" 
                        checked={mediaSource === "file"} 
                        onChange={() => { setMediaSource("file"); setFormError(""); }}
                        disabled={isUploading}
                      />
                      Upload File
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "14px" }}>
                      <input 
                        type="radio" 
                        name="mediaSource" 
                        value="url" 
                        checked={mediaSource === "url"} 
                        onChange={() => { setMediaSource("url"); setFormError(""); }}
                        disabled={isUploading}
                      />
                      Enter Direct URL (e.g. Cloudinary, Imgur)
                    </label>
                  </div>
                </div>

                {/* Media Inputs */}
                {mediaSource === "file" ? (
                  <>
                    {/* Cloudinary Integration warning for video uploads */}
                    {(mediaType === "video" || mediaType === "before-after-videos") && !cloudinaryConfig.cloudName && (
                      <div className="cloudinary-info-alert" style={{ background: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.3)", padding: "10px", borderRadius: "6px", fontSize: "12px", color: "#3b82f6", marginBottom: "12px" }}>
                        <strong>Note:</strong> To upload video files, please configure Cloudinary in <code>src/firebase.js</code>, or choose "Enter Direct URL" to paste a video link.
                      </div>
                    )}

                    {mediaType === "before-after-videos" ? (
                      <>
                        <div className="form-group">
                          <label>Before Video *</label>
                          <input 
                            type="file" 
                            accept="video/*"
                            onChange={(e) => setFile1(e.target.files[0])}
                            required
                            disabled={isUploading}
                          />
                          {isUploading && uploadProgress1 > 0 && (
                            <div className="upload-progress-container">
                              <div className="progress-label">
                                <span>Uploading Before Video</span>
                                <span>{uploadProgress1}%</span>
                              </div>
                              <div className="progress-bar-bg">
                                <div className="progress-bar-fill" style={{ width: `${uploadProgress1}%` }}></div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="form-group">
                          <label>After Video *</label>
                          <input 
                            type="file" 
                            accept="video/*"
                            onChange={(e) => setFile2(e.target.files[0])}
                            required
                            disabled={isUploading}
                          />
                          {isUploading && uploadProgress2 > 0 && (
                            <div className="upload-progress-container">
                              <div className="progress-label">
                                <span>Uploading After Video</span>
                                <span>{uploadProgress2}%</span>
                              </div>
                              <div className="progress-bar-bg">
                                <div className="progress-bar-fill" style={{ width: `${uploadProgress2}%` }}></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="form-group">
                        <label>{mediaType === "video" ? "Video File *" : "Image File *"}</label>
                        <input 
                          type="file" 
                          accept={mediaType === "video" ? "video/*" : "image/*"}
                          onChange={(e) => setFile1(e.target.files[0])}
                          required
                          disabled={isUploading}
                        />
                        {isUploading && uploadProgress1 > 0 && (
                          <div className="upload-progress-container">
                            <div className="progress-label">
                              <span>Uploading File</span>
                              <span>{uploadProgress1}%</span>
                            </div>
                            <div className="progress-bar-bg">
                              <div className="progress-bar-fill" style={{ width: `${uploadProgress1}%` }}></div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {mediaType === "before-after-videos" ? (
                      <>
                        <div className="form-group">
                          <label>Before Video URL *</label>
                          <input 
                            type="url"
                            className="form-input"
                            value={inputUrl1}
                            onChange={(e) => setInputUrl1(e.target.value)}
                            placeholder="e.g. https://res.cloudinary.com/demo/video/upload/before.mp4"
                            required
                            disabled={isUploading}
                          />
                        </div>
                        <div className="form-group">
                          <label>After Video URL *</label>
                          <input 
                            type="url"
                            className="form-input"
                            value={inputUrl2}
                            onChange={(e) => setInputUrl2(e.target.value)}
                            placeholder="e.g. https://res.cloudinary.com/demo/video/upload/after.mp4"
                            required
                            disabled={isUploading}
                          />
                        </div>
                      </>
                    ) : (
                      <div className="form-group">
                        <label>{mediaType === "video" ? "Direct Video URL *" : "Direct Image URL *"}</label>
                        <input 
                          type="url"
                          className="form-input"
                          value={inputUrl1}
                          onChange={(e) => setInputUrl1(e.target.value)}
                          placeholder={mediaType === "video" ? "e.g. https://res.cloudinary.com/demo/video/upload/sample.mp4" : "e.g. https://res.cloudinary.com/demo/image/upload/sample.jpg"}
                          required
                          disabled={isUploading}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>

              <footer className="modal-footer">
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => setIsModalOpen(false)}
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary" 
                  disabled={isUploading}
                >
                  {isUploading ? "Saving Data..." : (editingItem ? "Save Changes" : "Add Card")}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
