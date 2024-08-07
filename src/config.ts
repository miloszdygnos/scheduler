import { initializeApp } from "firebase/app";
import { getFirestore, collection } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD91wAnC_HoWaDYsKx-FcWDxnN76jjVFA4",
  authDomain: "well-task.firebaseapp.com",
  projectId: "well-task",
  storageBucket: "well-task.appspot.com",
  messagingSenderId: "22067750105",
  appId: "1:22067750105:web:c3215c0b67ada9a7d9cac8",
};

// Initialize Firebase
initializeApp(firebaseConfig);
const db = getFirestore();
const myCollection = collection(db, "TasksData");

export { db, myCollection };
