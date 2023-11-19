import { View, Text, TouchableOpacity, Button, FlatList, Image, SafeAreaView, StatusBar } from "react-native";
import EmptyState from "../components/EmptyState";
import { Uploading } from "../components/Uploading";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useState, useEffect } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { addDoc, collection, onSnapshot } from "firebase/firestore";
import { database, storage } from "../config/firebase";
import { Video } from "expo-av";




export default function Home() {
  const [image, setImage] = useState("");
  const [video, setVideo] = useState("");
  const [progress, setProgress] = useState(0);
  const [files, setFiles] = useState([]);


  useEffect(() => {
    const unsubscribe = onSnapshot(collection(database, "files"), (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          console.log("New file", change.doc.data());
         // console.log("All files", snapshot.docs.map(doc => doc.data()))
          setFiles((prevFiles) => [...prevFiles, change.doc.data()]);
        }
      });
    });
    return () => unsubscribe();
  }, []);



  const pickVideo = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });
    if (!result.canceled) {
      setVideo(result.assets[0].uri);
      // upload the video
      await uploadFile(result.assets[0].uri, "video");
      await saveRecord("video", result.assets[0].uri);
    }
  };

 

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      // upload the image
      await uploadFile(result.assets[0].uri, "image");
      await saveRecord("image", result.assets[0].uri);
    }
  };

  const uploadFile = async (uri, fileType) => {
    const response = await fetch(uri);
    const blob = await response.blob();

    const storageRef = ref(storage, "Stuff/" + new Date().getTime());
    const uploadTask = uploadBytesResumable(storageRef, blob);

    // listen for changes to upload task
    uploadTask.on("state_changed", (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      console.log("Upload is " + progress + "% done");

      if (progress < 100) {
        setProgress(progress.toFixed());
      } else {
        // seting progress 100% after
        setProgress(100);
      }
    }),
      (error) => {
        console.log(error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
          console.log("File available at", downloadURL);
       
          setImage("");
          setVideo("");
        });
      }
  };

  const saveRecord = async (fileType, url, createdAt = new Date().toISOString()) => {
    try {
      console.log("Trying to save record...");
      if (!url) {
        throw new Error("URL is undefined");
      }
      const simplifiedFileType = fileType.toString();
      const docRef = await addDoc(collection(database, "files"), {
        fileType: simplifiedFileType,
        url,
        createdAt,
      });
      console.log("document saved correctly", docRef.id);
    } catch (e) {
      console.log(e);
    }
  };


  return (
    <View style={{ flex: 1, marginTop:2 }}>
      
      <SafeAreaView style={{flex:1,  marginTop: StatusBar.currentHeight || 0,}}>
      
          <FlatList
        data={files}
        keyExtractor={(item) => item.url}
        renderItem={({ item }) => {
          if (item.fileType === "image") {
            return (
              <Image
                source={{ uri: item.url }}
                style={{ width: "34%", height: 100, margin:10 }}
              />
            );
          } else {
            return (
              <Video
                source={{
                  uri: item.url,
                }}
                // videoStyle={{ borderWidth: 1, borderColor: "red" }}
                rate={1.0}
                volume={1.0}
                isMuted={false}
                resizeMode="cover"
                shouldPlay
                // isLooping
                style={{ width: "34%", height: 100 , margin:10}}
                useNativeControls
              />
            );
          }
        }}
        numColumns={2}
        contentContainerStyle={{ gap: 3 }}
        columnWrapperStyle={{ gap: 3 }}
        />
        </SafeAreaView>
      {image && progress < 100 && (
        <Uploading style={{ position: "absolute", top: 0, left: 0, }} video={video} image={image} />
        )}
      
      <TouchableOpacity
        onPress={pickVideo}
        style={{
          position: "absolute",
          bottom: 150,
          right: 30,
          width: 44,
          height: 44,
          backgroundColor: "rgba(123, 31, 162, 0.14)",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 25,
        }}
      >
        <Ionicons name="videocam" size={24} color="#7B1FA2" />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={pickImage}
        style={{
          position: "absolute",
          bottom: 90,
          right: 30,
          width: 44,
          height: 44,
          backgroundColor: "rgba(123, 31, 162, 0.14)",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 25,
        }}
      >
        <Ionicons name="image" size={24} color="#7B1FA2" />
      </TouchableOpacity>
     
    </View>
  );
}
