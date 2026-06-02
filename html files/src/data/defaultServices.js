export const defaultPestControl = [
  {
    title: "Termite Control",
    mediaType: "video",
    mediaUrl: "https://res.cloudinary.com/djkz6gshk/video/upload/v1770621619/termites_2_n8maou.mp4",
    description: "Complete colony elimination using advanced baiting zones.",
    order: 1
  },
  {
    title: "Cockroach Control",
    mediaType: "video",
    mediaUrl: "https://res.cloudinary.com/djkz6gshk/video/upload/v1770647713/cockroaches_lvwqfn.mp4",
    description: "Gel application and herbal spray treatments for kitchens.",
    order: 2
  },
  {
    title: "Bed Bugs Control",
    mediaType: "video",
    mediaUrl: "https://res.cloudinary.com/djkz6gshk/video/upload/v1770647501/bedbugs_eotebh.mp4",
    description: "Steam and chemical treatment to kill bugs and eggs instantly.",
    order: 3
  },
  {
    title: "Rat Control",
    mediaType: "video",
    mediaUrl: "https://res.cloudinary.com/djkz6gshk/video/upload/v1770647647/ratcontrol_nchnh8.mp4",
    description: "Rodent bait stations, glue pads, and entry point sealing.",
    order: 4
  },
  {
    title: "General Pests",
    mediaType: "video",
    mediaUrl: "https://res.cloudinary.com/djkz6gshk/video/upload/v1770647410/bats_zjuejy.mp4",
    description: "Specialized repellents for reptiles and creepy crawlies.",
    order: 5
  },
  {
    title: "Pre-Construction",
    mediaType: "video",
    mediaUrl: "https://res.cloudinary.com/djkz6gshk/video/upload/v1770647765/preconstruction_r9vrny.mp4",
    description: "Soil treatment done before the foundation is laid.",
    order: 6
  },
  {
    title: "Post-Construction",
    mediaType: "video",
    mediaUrl: "https://res.cloudinary.com/djkz6gshk/video/upload/v1770647810/postconstruction_guuxvt.mp4",
    description: "Drill-and-fill method to inject chemicals under floors.",
    order: 7
  },
  {
    title: "Piping System",
    mediaType: "video",
    mediaUrl: "https://res.cloudinary.com/djkz6gshk/video/upload/v1770648332/piping_jap0zo.mp4",
    description: "Installing a porous pipe network before flooring.",
    order: 8
  }
];

export const defaultWaterproofing = [
  {
    title: "Terrace Leakage",
    mediaType: "video",
    mediaUrl: "https://res.cloudinary.com/djkz6gshk/video/upload/v1770648056/waterproof_rbqxgl.mp4",
    description: "Advanced liquid rubber coating to seal roof cracks.",
    order: 1
  },
  {
    title: "Bathroom Waterproofing",
    mediaType: "video",
    mediaUrl: "https://res.cloudinary.com/djkz6gshk/video/upload/v1770648010/bathroom_n54xec.mp4",
    description: "Epoxy grouting for tiles and coating for sunken slabs.",
    order: 2
  },
  {
    title: "PU Grouting",
    mediaType: "video",
    mediaUrl: "https://res.cloudinary.com/djkz6gshk/video/upload/v1770648223/pugrouting_ouyjxj.mp4",
    description: "High-pressure injection to fill deep concrete cracks.",
    order: 3
  }
];

export const defaultHousekeeping = [
  {
    title: "House Deep Cleaning",
    mediaType: "video",
    mediaUrl: "https://res.cloudinary.com/djkz6gshk/video/upload/v1770648097/housekeeping_meiphp.mp4",
    description: "Full home dusting, vacuuming, mopping, and window cleaning.",
    order: 1
  },
  {
    title: "Water Tank Cleaning",
    mediaType: "before-after-videos",
    // We will store Before and After URLs separated by a comma or as separate fields.
    // In Firestore, storing mediaUrl as string or array is perfect.
    // Let's store them as a JSON string, or array. We can make mediaUrl an array of URLs for comparison, 
    // or store a JSON-like object or comma-separated URLs: "beforeUrl,afterUrl"
    mediaUrl: "https://res.cloudinary.com/djkz6gshk/video/upload/v1770648124/beforetank_f4x2ju.mp4,https://res.cloudinary.com/djkz6gshk/video/upload/v1770648045/aftertank_pjyew0.mp4",
    description: "Mechanized de-watering, sludge removal, and UV disinfection.",
    order: 2
  },
  {
    title: "Sump Cleaning",
    mediaType: "video",
    mediaUrl: "https://res.cloudinary.com/djkz6gshk/video/upload/v1770648163/underground_vljswu.mp4",
    description: "High-pressure cleaning for underground water storage.",
    order: 3
  }
];

export const defaultBathroomCleaning = [
  {
    title: "Wall & Floor Tile Scrubbing",
    mediaType: "image",
    mediaUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80",
    description: "Machine scrubbing to remove dirt, grime, and mold from tile joints.",
    order: 1
  },
  {
    title: "Sanitary Ware Sanitization",
    mediaType: "image",
    mediaUrl: "https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=600&q=80",
    description: "Deep disinfection of WC, washbasins, and bathtubs.",
    order: 2
  },
  {
    title: "Taps & Shower Polishing",
    mediaType: "image",
    mediaUrl: "https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=600&q=80",
    description: "Special chemical treatment to remove hard water scaling from chrome fittings.",
    order: 3
  },
  {
    title: "Mirror & Glass Cleaning",
    mediaType: "image",
    mediaUrl: "https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=600&q=80",
    description: "Streak-free cleaning for mirrors, shower cubicles, and windows.",
    order: 4
  }
];
