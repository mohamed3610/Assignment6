import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  ImageBackground,
  TouchableOpacity,
  FlatList,
} from "react-native";
import * as SQLite from "expo-sqlite";
import { openDatabase, SQLResultSet, SQLTransaction } from "expo-sqlite";
let db = openDatabase("db.todos"); // returns Database object

export default function Todo() {
  const [text, onChangeText] = React.useState("");
  const [update, onUpdate] = React.useState("");
  const [task, setTask] = React.useState([] as any);

  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        "create table if not exists todoL (id integer primary key AUTOINCREMENT not null, Name text, Done int);"
      );
    });

    getTODO();
  }, [update]);

  const addTask = async () => {
    if (!text) {
      alert("Please insert Task");
      return false;
    }

    db.transaction(async (tx) => {
      tx.executeSql(
        "INSERT INTO todoL (Name, Done) VALUES (?,0)",
        [text],
        (_, { rows }) => {
          console.log(JSON.stringify(rows));
          onUpdate(" ");
          onChangeText(" ");
        }
      );
      tx.executeSql("select * from todoL", [], (_, { rows }) => {
        console.log(JSON.stringify(rows));
        getTODO();
        onUpdate(" ");
      });
    });
  };

  const deleteTask = async (id: number) => {
    db.transaction(async (tx) => {
      tx.executeSql("DELETE FROM todoL where id= ?", [id], (_, { rows }) => {
        getTODO();
      });
      tx.executeSql("select * from todoL", [], (_, { rows }) => {
        getTODO();
      });
    });
  };

  const getTODO = () => {
    db.transaction((txn) => {
      txn.executeSql("select * from todoL", [], (_, { rows }) => {
        console.log("Tasks retrieved successfully");
        setTask(rows._array);
      });
    });
  };

  const updateItem = async (id: number) => {
    db.transaction(async (txn) => {
      txn.executeSql(
        "UPDATE todoL  SET Done = CASE Done WHEN 0 THEN 1 ELSE 0 END where id = ?",
        [id]
      );

      txn.executeSql("select * from todoL where id=?", [id], (_, { rows }) => {
        console.log("Update", JSON.stringify(rows));
        getTODO();
        onUpdate(" ");
      });
    });
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../assets/ghost.jpg")}
        resizeMode="cover"
        style={styles.image}
      >
        <View style={styles.TitleWrapper}>
          <Text style={styles.Title}>To-Do List</Text>
        </View>

        <View style={styles.taskContainer}>
          {task?.map((item: any, index: number) => (
            <View key={index} style={styles.task}>
              <Text
                style={item.Done == 0 ? styles.taskName : styles.taskNameDone}
              >
                {item.Name}
              </Text>
              {/* {console.log('item.Done', item.done)} */}
              <TouchableOpacity
                onPress={() => {
                  console.log(item.done);
                  updateItem(item.id);
                }}
                style={styles.checkcontain}
              >
                <Image
                  style={styles.checkicon}
                  source={require("../assets/check.png")}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  deleteTask(item.id);
                }}
                style={styles.addicon}
              >
                <Image
                  style={styles.crossicon}
                  source={require("../assets/cross.png")}
                />
              </TouchableOpacity>
            </View>
          ))}
        </View>
        <View style={styles.textbarcontainer}>
          <View style={styles.textbar}>
            <TextInput
              placeholder="Type here"
              style={{ color: "black", width: "90%" }}
              onChangeText={onChangeText}
              value={text}
              // autoCapitalize="none"
            />

            <TouchableOpacity style={styles.addicon} onPress={addTask}>
              <Image
                style={{ width: 25, height: 25 }}
                source={require("../assets/add.png")}
              />
            </TouchableOpacity>
          </View>
        </View>
        <StatusBar style="auto" />
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignContent: "center",
  },
  Title: {
    alignSelf:"center",
    fontSize: 25,
    fontWeight: "bold",
    color: "#fff",

  },
  TitleWrapper: {
    top: 0,
    marginLeft: 10,
    position: "absolute",
    alignSelf:"center",
    borderRadius: 20,
    padding: 15,
    margin: 80,
  },
  taskContainer: {
    alignItems: "center",
    marginBottom: 0,
    position: "absolute",
    width: "100%",
    top: 180,
  },
  task: {
    borderRadius: 20,
    backgroundColor: "grey",
    padding: 20,
    margin: 10,
    borderColor: "#2E3475",

    width: "80%",
    justifyContent: "center",
    opacity: 0.5,
  },
  taskName: {
    fontSize: 20,

    color: "red",
    left: 0,
    marginLeft: 30,
  },
  taskNameDone: {
    fontSize: 20,
    fontWeight: "bold",
    color: "red",
    left: 0,
    marginLeft: 30,
    textDecorationLine: "line-through",
  },
  textbar: {
    borderRadius: 20,
    backgroundColor: "white",
    padding: 15,
    margin: 5,
    width: "90%",
    justifyContent: "center",
    opacity: 0.6,
  },
  textbarcontainer: {
    
    alignItems: "center",
    position: "absolute",
    bottom: 0,
    width: "100%",
    marginBottom: 70,
    borderRadius: 20,
 
    alignSelf: "center",

    justifyContent: "space-around",

    
  },
  addicon: {
    position: "absolute",
    right: 0,
    margin: 8,
   
  },
  checkicon: {
    width: 25,
    height: 25,
  },
  crossicon: {
    width: 25,
    height: 25,
    
  },
  image: {
    flex: 1,
    justifyContent: "center",
    width:'100%',
  },
  checkcontain: {
    position: "absolute",
    left: 0,
    margin: 10,
  },
});
