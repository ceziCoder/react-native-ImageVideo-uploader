import { Image, Text, StyleSheet, View, TouchableOpacity } from "react-native";
import React, { useState, useEffect } from "react";



export function Removed() {
    


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
              source={require("../assets/removed.gif")}
              style={{
                width: 250,
                height: 200,
              
                backgroundColor: "#fff",
                overflow: "hidden",
                borderRadius: 20
              }}
            />

            </View>




)








}