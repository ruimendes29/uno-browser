import { useRouter } from "next/router";
import React, {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Button from "../UI/Button";
import classes from "./Home.module.scss";
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, set, get } from "firebase/database";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDzAOrF65dPlutkRWausbH7ioYWoMAetoM",
  authDomain: "uno-browser.firebaseapp.com",
  databaseURL: "https://uno-browser-default-rtdb.firebaseio.com",
  projectId: "uno-browser",
  storageBucket: "uno-browser.appspot.com",
  messagingSenderId: "1055566517111",
  appId: "1:1055566517111:web:8e1796967d99f73ede4772",
  measurementId: "G-T6T0J23BTS",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

//Possible uno colors
const colors = ["red", "blue", "green", "yellow"];
// Array with all numbers and special cards that have color
const non_specials = [...Array(10).keys(), "reverse", "forbid", "+2"];
//special cards
const specials = ["+4", "choose"];

/**
 * Loop through the colors and numbers to create a whole UNO deck.
 * @returns A deck of UNO cards.
 */
const getDeck = () => {
  const ret = new Map();
  let id = 0;
  for (const color of colors) {
    console.log(color);
    for (const non_special of non_specials) {
      ret.set(id, { identifier: non_special, color, id: id++ });
      ret.set(id, { identifier: non_special, color, id: id++ });
    }
  }
  for (const special of specials) {
    ret.set(id, { identifier: special, id: id++ });
    ret.set(id, { identifier: special, id: id++ });
  }
  return ret;
};

const Home = () => {
  //player name
  const [name, setName] = useState("");
  //player id
  const [playerId, setPlayerId] = useState("");
  //ref for input field
  const nameRef = useRef(null);
  //ref for room field
  const roomRef = useRef(null);

  const [loading, setLoading] = useState(true);

  const router = useRouter();

  const signIn = useCallback(
    async (name?: string) => {
      setLoading(true);

      const p = localStorage.getItem("player");

      if (p) {
        console.log(p);
        const db = getDatabase(app);
        const playerRef = ref(db, `players/${p}`);
        const playerInfo = (await get(playerRef)).val();
        setName(playerInfo.name);
        setPlayerId(playerInfo.id);
        if (playerInfo.room) {
          await router.push("/game/" + playerInfo.room);
        }
      } else {
        setName(name!);
        signInAnonymously(auth).catch((error) => {
          console.log(error);
        });
      }

      setLoading(false);
    },
    [router]
  );

  useEffect(() => {
    if (localStorage.getItem("player")) {
      signIn();
    }
  }, [signIn]);

  useEffect(() => {
    // add a listener to check for auth changes and add the new user to the database if necessary
    onAuthStateChanged(auth, (user) => {
      if (user && !localStorage.getItem("player") && name) {
        console.log("tem user");
        setPlayerId(user.uid);
        localStorage.setItem("player", playerId);
        const db = getDatabase(app);
        const playerRef = ref(db, `players/${user.uid}`);
        set(playerRef, {
          id: user.uid,
          name: name,
          room: '',
        });
      } else {
        console.error("Couldn't create user!");
      }
    });
  }, [ name, playerId]);

  const handleCreateSession = () => {
      
    const db = getDatabase(app);
    const gameRef = ref(db, `rooms/${playerId}`);
    const playerRef = ref(db, `players/${playerId}`);
    set(playerRef, {
      id: playerId,
      name: name,
      room: playerId,
    });
    // shuffle the deck
    const deck = Array.from(getDeck())
      .map((el) => el[1])
      .sort(() => Math.random() - 0.5);
    set(gameRef, {
      id: playerId,
      players: [playerId],
      // distribute 7 cards for each player
      cards: [
        deck.slice(0, 7),
        deck.slice(7, 14),
        deck.slice(14, 21),
        deck.slice(21, 28),
      ],
      // assign the rest to the deck
      deck: deck.slice(29),
      top: deck[28],
      turn: 0,
      direction: 1,
    });
    router.push("/game/" + playerId);
  };

  const handleJoinSession = async (room: string) => {
    const db = getDatabase(app);
    const gameRef = ref(db, `rooms/${room}`);
    const gameInfo = (await get(gameRef)).val();
    if (gameInfo) {
      const playerRef = ref(db, `players/${playerId}`);
      set(playerRef, {
        id: playerId,
        name: name,
        room: room,
      });
      set(gameRef, { ...gameInfo, players: [...gameInfo.players, playerId] });
      router.push("/game/" + room);
    }
  };

  return (
    <div className={`${classes.home}`}>
      {loading && (
        <FontAwesomeIcon
          className={`${classes.icon} fa-spin`}
          icon={faCircleNotch}
        />
      )}
      {!loading && name && (
        <Fragment>
          <div className={`${classes.welcome}`}>Welcome {name}</div>
          <Button className={`${classes.btn}`} onClick={handleCreateSession}>
            Create session
          </Button>
          <input placeholder="Enter room code" type="text" ref={roomRef} />
          <Button
            className={`${classes.btn}`}
            onClick={() => {
              const roomInput: HTMLInputElement = roomRef.current!;
              handleJoinSession(roomInput.value);
            }}
          >
            Join session
          </Button>
        </Fragment>
      )}
      {!loading && !name && (
        <Fragment>
          <input
            placeholder="Enter your name"
            className={`${classes.input}`}
            type="text"
            ref={nameRef}
          />
          <Button
            onClick={() => {
              const inputEl: HTMLInputElement = nameRef.current!;
              signIn(inputEl.value);
            }}
          >
            Continue
          </Button>
        </Fragment>
      )}
    </div>
  );
};

export default Home;
