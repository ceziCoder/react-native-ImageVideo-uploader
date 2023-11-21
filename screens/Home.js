import { View, Text, TouchableOpacity, Button, FlatList, Image, SafeAreaView, StatusBar } from "react-native";
import EmptyState from "../components/EmptyState";
import { Uploading } from "../components/Uploading";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useState, useEffect } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { addDoc, collection, onSnapshot, deleteDoc ,getDocs, doc} from "firebase/firestore";
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
        
         setFiles((prevFiles) => [...prevFiles, change.doc.data()]);
        }
      });
    });
    return () => unsubscribe();
  }, []);


  const removeItem = async (item) => {
    try {
      if (!item || !item.url) {
        console.error('Invalid item structure. Item:', item);
        throw new Error('Invalid item structure');
      }
  
      // Log the item being removed
      console.log('Removing item:', item);
  
      // Get the document ID from the item (assuming Firestore auto-generates IDs)
      const docId = await getDocId(item);
  
      if (docId) {
        // deleted document from filse
        await deleteDoc(doc(database, 'files', docId));
        console.log('Document removed successfully:', docId);
  
        // update the files state to remove the item
        setFiles((prevFiles) => prevFiles.filter((file) => file.url !== item.url));
      } else {
        console.error('Document ID not found in item:', item);
      }
    } catch (error) {
      console.error('Error removing file:', error.message);
    }
  };

  const getDocId = async (item) => {
    const querySnapshot = await getDocs(collection(database, 'files'));
    const matchingDoc = querySnapshot.docs.find((doc) => doc.data().url === item.url);
    return matchingDoc?.id;
  };
 
  
  const pickVideo = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
      });
  
      if (!result.canceled) {
        console.log('Picked video:', result.assets[0].uri);
  
        // upload the video
        await uploadFile(result.assets[0].uri, "video");
  
        // Log the video URL before saving
        console.log('Video URL before saving:', result.assets[0].uri);
  
        // save the record
        await saveRecord("video", result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking video:', error.message);
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
      console.log("document saved correctly", docRef.id)

    
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
  renderItem={({ item }) => (
    <View style={{ flex: 1, margin: 3 }}>
      {item.fileType === 'image' ? (
        <View style={{ position: 'relative' }}>
          <Image
            source={{ uri: item.url }}
            style={{
              width: '100%',
              height: 200,
              borderRadius: 6,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 10,
              },
              shadowOpacity: 0.51,
              shadowRadius: 13.16,
            }}
          />
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              padding: 10,
              zIndex: 1,
            }}
            onPress={() => removeItem(item)}
          >
            <Ionicons name="remove-circle-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ position: 'relative' }}>
          <Video
            source={{ uri: item.url }}
            videoStyle={{ borderWidth: 1, borderColor: 'red' }}
            rate={1.0}
            volume={1.0}
            isMuted={false}
            resizeMode="cover"
            style={{ width: '100%', height: 200, borderRadius: 6 }}
            useNativeControls
          />
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              padding: 10,
              zIndex: 1,
            }}
            onPress={() => removeItem(item)}
          >
            <Ionicons name="remove-circle-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  )}
  numColumns={1}
  contentContainerStyle={{ gap: 1 }}
  
/>
        </SafeAreaView>
      {image && progress < 100 && (
        <Uploading style={{ width: "100%", height: "100%" }}   video={video} image={image} progress={progress} />
        )}

      <TouchableOpacity
        onPress={pickVideo}
        style={{
          position: "absolute",
          bottom: 150,
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
      </TouchableOpacity>
      <TouchableOpacity
        onPress={pickImage}
        style={{
          position: "absolute",
          bottom: 90,
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
      </TouchableOpacity>
    
    </View>
  );
}
