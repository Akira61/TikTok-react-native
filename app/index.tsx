import { Alert, View } from "react-native";
import * as Location from "expo-location";
import { useEffect, useState } from "react";

export default function Index() {
  const [latitude, setLatitude] = useState<number>();
  const [longitude, setLongitude] = useState<number>();

  // get user's location
  useEffect(() => {
    const getLocation = async () => {
      const { status } = await Location.getForegroundPermissionsAsync();

      if(status !== "granted"){
        Alert.alert(
          "Access Location Failed",
          "Please enable location access manually from your device's settings."
        ); 
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLatitude(loc.coords.latitude);
      setLongitude(loc.coords.longitude);
    }
    getLocation();

  }, []);
  
  return (
    <View>
    </View>
  );
}
