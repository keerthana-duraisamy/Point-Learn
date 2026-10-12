import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
// @ts-ignore
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Connection test
async function testConnection() {
  try {
    // Try to fetch a non-existent document from a test collection
    await getDocFromServer(doc(db, '_connection_test_', 'initial_boot'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Firestore Error: Could not reach backend. Please check your Firebase configuration.");
    }
    // Skip logging for other errors during initial test
  }
}
testConnection();
