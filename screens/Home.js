import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  Button,
  FlatList,
  Image,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from "react-native";
import EmptyState from "../components/EmptyState";
import { Uploading } from "../components/Uploading";
import { Removed } from "../components/Removed";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useState, useEffect, useRef } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import {
  addDoc,
  collection,
  onSnapshot,
  deleteDoc,
  getDoc,
  doc,
  updateDoc,
  increment,
  getDocId,
  getDocs,
  storageFileId,
  fileUrl,
} from "firebase/firestore";

import { database, storage } from "../config/firebase";
import { Video } from "expo-av";
import imageCompression from "browser-image-compression";
import CryptoJS from "crypto-js";

export default function Home() {
  const [image, setImage] = useState("");
  const [video, setVideo] = useState("");
  const [progress, setProgress] = useState(0);
  const [files, setFiles] = useState([]);
  const [showRemovedMessage, setShowRemovedMessage] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(database, "files"),
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            setFiles((prevFiles) => {
              const newFiles = [...prevFiles, change.doc.data()];
              console.log(newFiles);
              return newFiles;
            });
          }
        });
      }
    );
    return () => unsubscribe();
  }, []);

  /////////////////////////////////////////
  const removeItem = async (item) => {
    try {
      // prevent null
      if (!item || !item.url) {
        console.error("Invalid item structure. Item:", item);
        throw new Error("Invalid item structure");
      }
      // Set the state to show the removed message
      setShowRemovedMessage(true);

      // Hide the message after 3 seconds
      setTimeout(() => {
        setShowRemovedMessage(false);
      }, 5000);

      console.log("Removing item:", item);

      // Get the document ID from the item (assuming Firestore auto-generates IDs)
      const dockId = await getDocId(item);

      if (dockId) {
        // deleted document from filse
        await deleteDoc(doc(database, "files", dockId));
        console.log("Document removed successfully:", dockId);

        // update the files state to remove the item
        setFiles((prevFiles) =>
          prevFiles.filter((file) => file.url !== item.url)
        );
      } else {
        console.error("Document ID not found in item:", item);
      }
    } catch (error) {
      console.error("Error removing file:", error.message);
    }
  };

  const getDocId = async (item) => {
    const querySnapshot = await getDocs(collection(database, "files"));
    const matchingDoc = querySnapshot.docs.find(
      (doc) => doc.data().url === item.url
    );
    return matchingDoc?.id;
  };

  const pickVideo = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.2,
      });

      if (!result.canceled) {
        console.log("Picked video:", result.assets[0].uri);

        // upload the video
        await uploadFile(result.assets[0].uri, "video");

        // Log the video URL before saving
        console.log("Video URL before saving:", result.assets[0].uri);

        // save the record
        await saveRecord("video", result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking video:", error.message);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.2,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      // upload the image
      await uploadFile(result.assets[0].uri, "image");
      await saveRecord("image", result.assets[0].uri);
    }
  };

  /////////////////////////////////////
  const uploadFile = async (uri, fileType) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      const storageRef = ref(storage, "Stuff/" + new Date().getTime());
      const uploadTask = uploadBytesResumable(storageRef, blob);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload is " + progress + "% done");

          if (progress < 100) {
            setProgress(progress.toFixed());
          } else {
            setProgress(100);
          }
        },
        (error) => {
          console.log(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          console.log("File available at", downloadURL);

          setImage("");
          setVideo("");

          // Po zakończeniu przesyłania pliku, zapisz jedynie odnośnik do pliku w Firestore
          saveRecord(fileType, downloadURL);
        }
      );
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const shortenUrl = (url) => {
    const hash = CryptoJS.SHA256(url);
    console.log("Hash:", hash);
    return hash.toString(CryptoJS.enc.Hex).substring(0, 10); // cut to 10
  };

  const saveRecord = async (
    fileType,
    url,
    docId = new Date().getTime(),
    createdAt = new Date().toISOString()
  ) => {
    try {
      console.log("Trying to save record...");
      if (!url) {
        throw new Error("URL is undefined");
      }
      const simplifiedFileType = fileType.toString();

     // const shortenedUrl = shortenUrl(url);
     // console.log("Shortened URL:", shortenedUrl);
      const docRef = await addDoc(collection(database, "files"), {
        fileType: simplifiedFileType,
        url,
        createdAt,

        docId,
      });
      console.log("document saved correctly", docRef.id);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <View style={{ flex: 1, marginTop: 2, width: "100%", height: "100%" }}>
      <SafeAreaView
        style={{ flex: 1, marginTop: StatusBar.currentHeight || 0 }}
      >
        <FlatList
          data={files}
          keyExtractor={(item) => item.url}
          renderItem={({ item }) => (
           
            <View style={{ flex: 1, margin: 0, padding: 30 }} >
              
              {item.fileType === "image" ? (
                <View style={{ position: "relative" }}
                
                >
                  
                  <Image
                    source={{ uri: item.url }}
                    style={{
                      width: "100%",
                      aspectRatio: 16 / 16,
                      borderRadius: 6,
                    }}
                   // onLoad={() => console.log("Image loaded:", item.url)}
                    
                   // onError={(error) => console.log("Error loading image:", item.url, error)}
                  />
                 
                  <Pressable
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      padding: 10,
                      zIndex: 1,
                    }}
                    onPress={() => removeItem(item)}
                  >
                    <Ionicons
                      name="remove-circle-outline"
                      size={24}
                      color="red"
                    />
                  </Pressable>
                </View>
              ) : (
                <View style={{ position: "relative" }}>
                  <Video
                    source={{ uri: item.url }}
                    videoStyle={{ borderWidth: 1, borderColor: "red" }}
                    rate={1.0}
                    volume={1.0}
                    isMuted={false}
                    resizeMode="cover"
                    style={{ width: "100%", height: 200, borderRadius: 6 }}
                    useNativeControls
                  />
                  <Pressable
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      padding: 10,
                      zIndex: 1,
                    }}
                    onPress={() => removeItem(item)}
                  >
                    <Ionicons
                      name="remove-circle-outline"
                      size={24}
                      color="red"
                    />
                  </Pressable>
                </View>
              )}
            </View>
          )}
          numColumns={1}
          contentContainerStyle={{ gap: 2 }}
        />
      </SafeAreaView>

      {image && progress < 100 && (
        <Uploading
          style={{
            width: "100%",
            height: "100%",
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.44)",
            justifyContent: "center",
            alignItems: "center",
          }}
          video={video}
          image={image}
          progress={progress}
        />
      )}
      {showRemovedMessage && (
        <Removed
          style={{
            width: "100%",
            height: "100%",
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.44)",
            justifyContent: "center",
            alignItems: "center",
          }}
        />
      )}

      <Pressable
        onPress={pickVideo}
        style={{
          position: "fixed",
          top: 250,
          right: 30,
          width: 44,
          height: 44,
          backgroundColor: "rgba(0, 0, 0, 0.44)",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 25,
        }}
      >
        <Ionicons name="videocam" size={24} color="#fff" />
      </Pressable>
      <Pressable
        onPress={pickImage}
        style={{
          position: "fixed",
          top: 190,
          right: 30,
          width: 44,
          height: 44,
          backgroundColor: "rgba(0, 0, 0, 0.44)",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 25,
        }}
      >
        <Ionicons name="image" size={24} color="#fff" />
      </Pressable>
    </View>
  );
}
