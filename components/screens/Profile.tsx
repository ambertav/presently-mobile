import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView } from "react-native-gesture-handler";
import { colors } from "../../constants/Theme";
import * as friendsService from "../../utilities/friends-service";
import {
  calculateAge,
  daysUntilBirthday,
  splitDOB,
} from "../../utilities/helpers";
import Explore from "../Explore";
import ProfileContent from "../ProfileContent";
import ProfileSkeleton from "../skeletons/ProfileSkeleton";
import { useUser } from "../providers/UserContext";

interface Friend {
  name: string;
  gender: string;
  location: string;
  dob: string;
  photo: string;
  bio: string;
  interests: string[];
  tags: string[];
  user: string;
  giftPreferences: string[];
  favoriteGifts: string[];
}

export default function UserProfileScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  // const [user, setUser] = useState<Friend | null>(null);
  const [image, setImage] = useState(null);
  const [dobObject, setDobObject] = useState({
    year: "",
    month: "",
    day: "",
  });
  const [favorites, setFavorites] = useState([]);
  const [enableRecs, setEnableRecs] = useState<boolean>(false);
  const [favError, setFavError] = useState("");
  const [loading, setLoading] = useState(true);
  const { user, fetchFriend } = useUser();

  const { id } = useLocalSearchParams();

  // const fetchFriend = async () => {
  //   try {
  //     const friendData = await friendsService.retrieveFriend(id);
  //     if (friendData) {
  //       const uniqueTimestamp = Date.now();
  //       friendData.photo = `${
  //         friendData.photo
  //           ? friendData.photo
  //           : "https://i.imgur.com/hCwHtRc.png"
  //       }?timestamp=${uniqueTimestamp}`;
  //       setUser(friendData);
  //       setDobObject(splitDOB(friendData.dob));
  //       setFavorites(friendData.favoriteGifts);
  //       if (friendData.tags.length > 0) setEnableRecs(true);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching user: ", error);
  //   }
  // };

  useEffect(() => {
    console.log("USER USER PROFILE", user);
    if (user) {
      const uniqueTimestamp = Date.now();
      user.photo = `${
        user.photo ? user.photo : "https://i.imgur.com/hCwHtRc.png"
      }?timestamp=${uniqueTimestamp}`;

      setDobObject(splitDOB(user.dob));
      setFavorites(user.favoriteGifts);
      if (user.tags.length > 0) setEnableRecs(true);

      setLoading(false);
    }
    // fetchFriend();
  }, [user]);

  const toggleFavorite = async (recommendation, e) => {
    e.preventDefault();
    const idx = favorites.findIndex(
      (fav) => fav.title.toLowerCase() === recommendation.title.toLowerCase()
    );
    if (idx > -1) {
      // remove from favorites
      try {
        const item = favorites[idx];
        const res = await friendsService.removeFromFavorites(id, item._id);
        if (res)
          setFavorites(
            favorites.slice(0, idx).concat(favorites.slice(idx + 1))
          );
      } catch (error) {
        setFavError(error.message);
      }
    } else {
      // add to favorites
      try {
        const res = await friendsService.addToFavorites(id, recommendation);
        setFavorites([...favorites, res.recommendation]);
      } catch (error) {
        setFavError(error.message);
      }
    }
  };

  const handleSelect = (value: string) => {
    setActiveTab(value);
  };

  const onLoad = () => {
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  return (
    <View style={styles.container}>
      {loading && !user ? (
        <ProfileSkeleton />
      ) : (
        <>
          <View style={styles.backgroundCover}></View>
          <View style={styles.header}>
            <TouchableOpacity
              style={{ position: "absolute", left: 0, top: 40 }}
              onPress={() => router.back()}
            >
              <Image
                source={require("../../assets/images/arrow-left.png")}
                style={{ height: 24, width: 24 }}
              />
            </TouchableOpacity>
            <Image
              source={{
                uri: user.photo
                  ? user.photo
                  : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
              }}
              onLoad={onLoad}
              style={styles.avatar}
            />
            <Text style={styles.name}>{user && user.name}</Text>
            <Text style={styles.subText}>Friend</Text>
          </View>
          <View style={styles.info}>
            <View style={styles.infoDescription}>
              <Text style={{ color: "#804C46", fontWeight: "bold" }}>
                {dobObject && dobObject.day}
              </Text>
              <Text>{dobObject && dobObject.month}</Text>
            </View>
            <View
              style={{ height: 30, width: 1, backgroundColor: "lightgray" }}
            ></View>
            <View style={styles.infoDescription}>
              <Text style={{ color: "#804C46", fontWeight: "bold" }}>
                {user && daysUntilBirthday(user.dob)}
              </Text>
              <Text>Days left</Text>
            </View>
            <View
              style={{ height: 30, width: 1, backgroundColor: "lightgray" }}
            ></View>
            <View style={styles.infoDescription}>
              <Text style={{ color: "#804C46", fontWeight: "bold" }}>
                {user && calculateAge(user.dob)}
              </Text>
              <Text>Age</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push(`/users/${id}/update`)}
            >
              <Image
                source={require("../../assets/images/pencil.png")}
                style={{ height: 20, width: 20, right: -40 }}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => handleSelect("profile")}
            >
              <Text
                style={
                  activeTab == "profile" ? styles.selected : styles.unselected
                }
              >
                Profile
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => handleSelect("explore")}
            >
              <Text
                style={
                  activeTab == "profile" ? styles.unselected : styles.selected
                }
              >
                Explore Gifts
              </Text>
            </TouchableOpacity>
          </View>

          {user && activeTab === "profile" && (
            <ScrollView>
              <ProfileContent
                favorites={favorites}
                giftPreferences={user.giftPreferences}
                tags={user.tags}
                toggleFavorite={toggleFavorite}
                friendLocation={user.location}
              />
            </ScrollView>
          )}
          {user && activeTab === "explore" && (
            <ScrollView>
              <Explore
                enableRecs={enableRecs}
                toggleFavorite={toggleFavorite}
                friend={user}
                giftPreferences={user.giftPreferences}
                tags={user.tags}
                id={id}
                friendLocation={user.location}
              />
            </ScrollView>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: colors.cream,
    paddingTop: 120,
  },
  header: {
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  info: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginVertical: 10,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 30,
    marginVertical: 10,
    paddingTop: 10,
  },
  giftType: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  tags: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  button: {
    padding: 10,
    borderRadius: 5,
  },
  infoDescription: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  selected: {
    color: "black",
    textDecorationLine: "underline",
    fontFamily: "PilcrowMedium",
    fontSize: 20,
  },

  unselected: {
    color: "gray",
    fontFamily: "PilcrowRounded",
    fontSize: 18,
  },
  backgroundCover: {
    position: "absolute",
    left: 0,
    height: 140,
    right: 0,
    top: 0,
    backgroundColor: colors.orange,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  name: {
    fontFamily: "PilcrowMedium",
    fontSize: 24,
  },
  subText: {
    fontFamily: "PilcrowRounded",
    fontSize: 16,
  },
  numberText: {
    fontFamily: "PilcrowRounded",
    fontSize: 18,
    color: colors.orange,
  },
});
