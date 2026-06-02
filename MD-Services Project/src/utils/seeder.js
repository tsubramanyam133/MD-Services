import { db } from "../firebase";
import { collection, getDocs, writeBatch, doc } from "firebase/firestore";
import {
  defaultPestControl,
  defaultWaterproofing,
  defaultHousekeeping,
  defaultBathroomCleaning
} from "../data/defaultServices";

export async function seedDatabase() {
  const collections = [
    { name: "pest-control", defaultData: defaultPestControl },
    { name: "waterproofing", defaultData: defaultWaterproofing },
    { name: "housekeeping", defaultData: defaultHousekeeping },
    { name: "bathroom-cleaning", defaultData: defaultBathroomCleaning }
  ];

  try {
    for (const col of collections) {
      const colRef = collection(db, col.name);
      const snapshot = await getDocs(colRef);
      
      // If collection is empty, seed it
      if (snapshot.empty) {
        console.log(`Seeding database collection: ${col.name}...`);
        const batch = writeBatch(db);
        
        col.defaultData.forEach((item) => {
          // generate a new doc ref with automatic ID
          const newDocRef = doc(colRef);
          batch.set(newDocRef, {
            ...item,
            createdAt: new Date().toISOString()
          });
        });
        
        await batch.commit();
        console.log(`Collection: ${col.name} seeded successfully!`);
      }
    }
  } catch (error) {
    console.error("Error seeding database: ", error);
  }
}
