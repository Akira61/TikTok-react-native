import { Alert, ImageBackground, SafeAreaView, StyleSheet, Text, View } from "react-native";
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import dayjs from "dayjs";

export default function Index() {
  const [latitude, setLatitude] = useState<number>();
  const [longitude, setLongitude] = useState<number>();
  const [timings, setTimings] = useState<any>({});
  const [filteredTimings, setFilteredTimings] = useState<any>({});
  const [nextPrayer, setNextPrayer] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<string>();
  
  const prayerNames: { [key: string]: string } = {
    Fajr: " الفجر ",
    Sunrise: " الشروق ",
    Dhuhr: " الظهر ",
    Asr: " العصر ",
    Maghrib: " المغرب ",
    Isha: " العشاء ",
  };

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

 // When timings update, filter relevant prayers
 useEffect(() => {
  if (Object.keys(timings).length > 0) {
    const prayerKeys = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];
    const filtered = Object.entries(timings).filter(([key]) => prayerKeys.includes(key));
    const arrayToObject = Object.fromEntries(filtered);
    setFilteredTimings(arrayToObject);
  }
}, [timings]);

// next Pray time
useEffect(() => {
  const now = dayjs(); // YYYY-MM-DD HH:mm
  let nextPrayer = null;
  let nextPrayerTime = null;

  for (const name in timings) {
    const time = timings[name];
    const prayerTime = dayjs(
      `${dayjs().format("YYYY-MM-DD")} ${time}`,
      "YYYY-MM-DD HH:mm"
    );

    if (prayerTime.isAfter(now)) {
      if (!nextPrayerTime || prayerTime.isBefore(nextPrayerTime)) {
        nextPrayerTime = prayerTime;
        nextPrayer = name;
      }
    }
  }

  if (nextPrayerTime) {
    setNextPrayer(nextPrayer);
    const diff = nextPrayerTime.diff(now, "second");
    updateCountdown(diff);
  }
   
}, [timings]);

// countdown
const updateCountdown = (totalSeconds: number) => {
  const interval = setInterval(() => {
    totalSeconds--; // -1

    const hours = Math.floor(totalSeconds / 3600)
    .toString()
    .padStart(2, "0");

    const minutes = Math.floor((totalSeconds % 3600) / 60)
    .toString()
    .padStart(2, "0");

    const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");

    setCountdown(`${hours}:${minutes}:${seconds}`);
    
    if (totalSeconds <= 0) clearInterval(interval);
  }, 1000); // every scound
};
  return (
    <SafeAreaView style={styles.root}>
      <ImageBackground style={styles.imageBackground} source={require("@/assets/images/background.jpg")}>
        <View style={styles.container}>

          {/* next prayer */}
          <View style={styles.nextPray}>
            <Text style={styles.nextPrayTitle}>
              {nextPrayer && prayerNames[nextPrayer]}
            </Text>
            <Text style={styles.nextPrayState}> بعد </Text>
            <Text style={styles.nextPrayTimeLeft}>{countdown}</Text>
          </View>

          {/* all prayer */}
          <View></View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1
  },
  imageBackground: {
    flex: 1,
    justifyContent: 'center'
  },
  container: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 30,
    gap: 50,
  },
  nextPray: {
    alignItems: "center",
    gap: 10,
  },
  nextPrayTitle: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#fff",
  },
  nextPrayState: {
    color: "#DDDDDD",
    fontSize: 40,
  },
  nextPrayTimeLeft: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#fff",
  },
})