import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  Text,
  Alert,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Menu, Provider } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import GlobalStyles from "./styles/GlobalStyles";
import { Ionicons } from "@expo/vector-icons";

const NOTACCEPT = 0;
const ACCEPT = 1;
const BLOCK = 2;

const HomeScreen = ({ navigation }, { itemId }) => {
  const [fields, setFields] = useState(["number", "profession", "description"]);
  const [user, setUser] = useState({});
  const [oppositeUser, setOppositeUserType] = useState(null);
  const [userList, setUserList] = useState([]);
  const [sentRequests, setSentRequests] = useState({});
  const [bookmarked, setBookmarked] = useState(false);

  // Handle menu state separately for each item to avoid hook misuse
  const [menuVisibleState, setMenuVisibleState] = useState({});

  useEffect(() => {
    if (itemId) {
      const fetchBookmarkStatus = async () => {
        try {
          const response = await axios.get(
            `http://192.168.0.184:8002/api/bookmarks/${itemId}`
          );
          setBookmarked(response.data.bookmarked);
        } catch (error) {
          console.error("Error fetching bookmark status:", error);
        }
      };

      fetchBookmarkStatus();
    }
  }, [itemId]);

  const addFav = async (item) => {

    console.log("jenny", Math.floor(Math.random()));
  
    let alreadyBooked = item.is_book_marked_count > 0;
  
    // Base endpoint URL
    let endpoint = "http://192.168.0.184:8002/api/store-bookmark";
    let method = 'post';  
  
    if (alreadyBooked) {
      endpoint = "http://192.168.0.184:8002/api/delete-bookmark";
      method = 'delete';  
    }
  
    console.log(endpoint);
  
    let payload = {
      user_id: user.id,
      item_id: item.id,
    };

    console.log(payload);

  
    try {
      let result = await axios.post(endpoint, payload);
  
      console.log(`my rsult `);
      getUserData();
      console.log(result);

    
    } catch (error) {
      console.log(error);
    }
  };
  

  const toggleMenu = (userId) => {
    setMenuVisibleState((prevState) => ({
      ...prevState,
      [userId]: !prevState[userId],
    }));
  };

  const getUserData = async () => {
    let userObj = await AsyncStorage.getItem("user");
    let token = await AsyncStorage.getItem("token");

    if (userObj && token) {
      let { user } = JSON.parse(userObj);
      setUser(user);
      getData(user, token);
    }
  };

  const getData = async (user, token) => {
    let oppositeUserType = user.user_type === "client" ? "partner" : "client";

    setOppositeUserType(oppositeUserType);
    try {
      const { data: list } = await axios.get(
        `http://192.168.0.184:8002/api/${oppositeUserType}`,
        {
          params: {
            [`${user.user_type}_id`]: user.id,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUserList(list.data);

      const sentRequestsStatus = {};
      for (const user of list.data) {
        const status = await AsyncStorage.getItem(`request_${user.id}`);
        if (status === "sent") {
          sentRequestsStatus[user.id] = true;
        }
      }
      setSentRequests(sentRequestsStatus);
    } catch (error) {
      console.error("Error fetching data:", error);
      Alert.alert("Error", "Failed to fetch data");
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    navigation.navigate("Login");
  };

  const sendRequestService = async (partner_id) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const { data } = await axios.post(
        `http://192.168.0.184:8002/api/service-request`,
        {
          client_id: user.id,
          partner_id: partner_id,
          status: 0,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(data);
      Alert.alert("Success", "Service request sent successfully.");
    } catch (error) {
      console.error("Error sending service request:", error);
      Alert.alert("Error", "Failed to send service request");
    }
  };

  const startConversation = (item) => {
    navigation.navigate("Chat", { receiver: item });
  };

  const cancelRequestService = async (service_request_id) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const { data } = await axios.delete(
        `http://192.168.0.184:8002/api/service-request/` + service_request_id,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(data, "Service deleted successfully.");
      Alert.alert("Success", "Service deleted successfully.");
    } catch (error) {
      console.error("Error sending service request:", error);
      Alert.alert("Error", "Failed to send service request");
    }
  };

  const processRquestByStatusId = async (status = 1, client) => {
    let serviceId = client.is_request.id;
    try {
      const token = await AsyncStorage.getItem("token");
      let payload = { partner_id: user.id, status, client_id: client.id };
      let url = `http://192.168.0.184:8002/api/service-request/${serviceId}`;
      let config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const { data } = await axios.put(url, payload, config);
      getUserData();
      console.log(data);
    } catch (error) {
      console.error("Error accepting request:", error);
      Alert.alert("Error", "Failed to accept request");
    }
  };

  const renderItem = ({ item }) => {
    const isRequestSent = sentRequests[item.id];

    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.text}>Profession: {item.profession}</Text>
          <Text>
            Email:
            <Text style={item.email ? styles.text : styles.error}>
              {" "}
              {item.email || "no email found yet"}{" "}
            </Text>
          </Text>
          <Text style={styles.text}>Phone: {item.number}</Text>
          <Text style={styles.text}>My User Type: {user.user_type}</Text>

          <View>
            {user.user_type === "client" ? (
              <>
                {!item.partner_service_request ? (
                  <TouchableOpacity
                    style={[GlobalStyles.button]}
                    onPress={() => sendRequestService(item.id)}
                  >
                    <Text style={GlobalStyles.buttonText}>Send Request</Text>
                  </TouchableOpacity>
                ) : (
                  <>
                    {item.partner_service_request.status == 0 ? (
                      <TouchableOpacity
                        style={[GlobalStyles.button]}
                        onPress={() =>
                          cancelRequestService(item.partner_service_request.id)
                        }
                      >
                        <Text style={GlobalStyles.buttonText}>
                          Cancel Request
                        </Text>
                      </TouchableOpacity>
                    ) : null}
                    {item.partner_service_request.status == 1 ? (
                      <Menu
                        style
                        visible={menuVisibleState[item.id]}
                        onDismiss={() => toggleMenu(item.id)}
                        anchor={
                          <TouchableOpacity onPress={() => toggleMenu(item.id)}>
                            <MaterialIcons name="more-horiz" color="black" />
                          </TouchableOpacity>
                        }
                      >
                        <Menu.Item
                          onPress={() => {
                            toggleMenu(item.id);
                            startConversation(item);
                          }}
                          title="Start Conversation"
                        />
                      </Menu>
                    ) : null}
                    {item.partner_service_request.status == 2 ? (
                      <TouchableOpacity style={[GlobalStyles.button]}>
                        <Text style={GlobalStyles.buttonText}>Blocked</Text>
                      </TouchableOpacity>
                    ) : null}
                  </>
                )}
              </>
            ) : (
              <>
                {item.is_request && item.is_request.status == 0 ? (
                  <View style={{ flexDirection: "row", width: "100%" }}>
                    <TouchableOpacity
                      style={[GlobalStyles.button, { flex: 1, marginRight: 5 }]}
                      onPress={() => processRquestByStatusId(ACCEPT, item)}
                    >
                      <Text style={GlobalStyles.buttonText}>Accept</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[GlobalStyles.button, { flex: 1, marginLeft: 5 }]}
                      onPress={() => processRquestByStatusId(BLOCK, item)}
                    >
                      <Text style={GlobalStyles.buttonText}>Block</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "flex-end",
                      position: "absolute",
                      bottom: 120,
                      right: 0,
                    }}
                  >
                    <Menu
                      visible={menuVisibleState[item.id]}
                      onDismiss={() => toggleMenu(item.id)}
                      anchor={
                        <TouchableOpacity onPress={() => toggleMenu(item.id)}>
                          <MaterialIcons
                            name="more-vert"
                            size={24}
                            color="black"
                          />
                        </TouchableOpacity>
                      }
                    >
                      <Menu.Item
                        onPress={() => {
                          toggleMenu(item.id);
                          startConversation(item);
                        }}
                        title="Start Conversation"
                      />
                      <Menu.Item
                        onPress={() => {
                          toggleMenu(item.id);
                          processRquestByStatusId(NOTACCEPT, item);
                        }}
                        title="Not Accept"
                      />
                    </Menu>
                  </View>
                )}
                <TouchableOpacity
  style={{
    position: "absolute",
    bottom: 80,
    right: 0,
    zIndex: 10, // Ensure it’s above other elements
  }}
  onPress={() => addFav(item)}
>
  <Ionicons
    name={item.is_book_marked_count > 0 ? "bookmark" : "bookmark-outline"}
    size={32}
    color={item.is_book_marked_count > 0 ? "#148C94" : "gray"}
  />
</TouchableOpacity>

                {/* <TouchableOpacity
                 onPress={() => addFav(item.id)}
                >
                  <Ionicons
                    style={{
                      flexDirection: "row",
                      justifyContent: "flex-end",
                      position: "absolute",
                      bottom: 80,
                      right: 0,
                    }}
                    name={
                      item.is_book_marked_count > 0
                        ? "bookmark"
                        : "bookmark-outline"
                    }
                    size={32}
                    color={item.is_book_marked_count > 0 ? "#148C94" : "gray"}
                  />
                </TouchableOpacity> */}
              </>
            )}
          </View>
        </View>
      </View>
    );
  };

  useFocusEffect(
    useCallback(() => {
      getUserData();
    }, [])
  );

  return (
    <Provider>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
            <MaterialIcons name="menu" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.title}>Welcome, {user.name}</Text>
          <TouchableOpacity onPress={handleLogout}>
            <MaterialIcons name="logout" size={24} color="black" />
          </TouchableOpacity>
        </View>
        <FlatList
          data={userList}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
        />
      </View>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 15,
    backgroundColor: "#f5f5f5",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  list: {
    paddingVertical: 20,
  },
  card: {
    width: 300,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)", // This will be approximated
    elevation: 4, // Adds shadow effect on Android
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  text: {
    fontSize: 16,
    marginBottom: 5,
  },
  error: {
    fontSize: 16,
    marginBottom: 5,
    color: "red",
  },
});

export default HomeScreen;
