import { Alert, View } from "react-native";
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import dayjs from "dayjs";

export default function Index() {
  const [latitude, setLatitude] = useState<number>();
  const [longitude, setLongitude] = useState<number>();
  const [timings, setTimings] = useState<any>({});
  
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

    // When lat/lng is available, fetch prayer times
  useEffect(() => {
    if(latitude && longitude){
      const today = dayjs().format("D-M-YYYY");
      const getPrayerTime = async () => {
        const URL = `https://api.aladhan.com/v1/timings/${today}?latitude=${latitude}&longitude=${longitude}`;
        const request = await fetch(URL);
        const response = await request.json();
        const timings = response.data.timings;
        setTimings(timings);
      };
      //
      getPrayerTime();
    }
  }, [latitude, longitude]);
  }, []);
  
  return (
    <View>
    </View>
  );
}
