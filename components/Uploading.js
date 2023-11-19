import { Image, Text, StyleSheet, View, TouchableOpacity } from "react-native";
import React, { useState, useEffect } from "react";
import Spinner from "react-native-loading-spinner-overlay";

import { Video } from "expo-av";
import { BlurView } from "expo-blur";

export function Uploading({ image, video, progress }) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Image
        source={require("../assets/l_s.gif")}
        style={{
          width: 250,
          height: 150,
          overflow: "hidden",
          backgroundColor: "#fff",
          overflow: "hidden",
          borderRadius: 20,
        }}
      />
      <Text style={{color:'#7B1FA2', margin:2, fontWeight: 'bold'}}>{`${progress}%`}</Text>
      
      
      {image && (
        <Image
          source={{ uri: image }}
          style={{
            width: 100,
            height: 100,
            resizeMode: "contain",
            borderRadius: 6,
          }}
        />
      )}
      {video && (
        <Video
          source={{
            uri: video,
          }}
          videoStyle={{}}
          rate={1.0}
          volume={1.0}
          isMuted={false}
          resizeMode="contain"
          // shouldPlay
          // isLooping
          style={{ width: 200, height: 200 }}
          // useNativeControls
        />
      )}
    </View>
  );
}
