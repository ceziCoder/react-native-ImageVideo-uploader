import { Image, Text, StyleSheet, View, TouchableOpacity } from "react-native";
import React, { useState, useEffect } from "react";
import Spinner from "react-native-loading-spinner-overlay";

import { Video } from "expo-av";
import { BlurView } from "expo-blur";

export function Uploading({ image, video, progress }) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <View style={{  flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)', 
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    }}>
     
      <Image
        source={require("../assets/l_s.gif")}
        style={{
          width: 250,
          height: 200,
          overflow: "hidden",
          backgroundColor: "#fff",
        
          borderRadius: 20,
        }}
      />
     
     <Text style={{color:'#7B1FA2', fontWeight: 'bold',position:'relative',marginTop:-20}}>{`${progress}%`}</Text>
     
    
    </View>
  );
}
