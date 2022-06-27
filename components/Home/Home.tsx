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
import { setNewGame } from "../Game/GameUtils";
import Logo from "../UI/Logo";
import Modal from "../UI/Modal";
import ChooseRules from "./ChooseRules";
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

const Home = () => {
  //player name
  const [name, setName] = useState("");
  //player id
  const [playerId, setPlayerId] = useState("");
  //ref for input field
  const nameRef = useRef(null);
  //ref for room field
  const roomRef = useRef(null);
  //state for error in room name
  const [error, setError] = useState(false);

  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

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
        await signInAnonymously(auth).catch((error) => {
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
    } else setLoading(false);
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
          room: "",
        });
      } else {
        console.error("Couldn't create user!");
      }
    });
  }, [name, playerId]);

  const [roomId, setRoomId] = useState("");

  const handleCreateSession = async (
    roomId: string,
    rules: {
      takeUntilPlay: boolean;
      canPlayMultiple: boolean;
      canPlayOverTake: boolean;
      endWhenOneEnds: boolean;
    }
  ) => {
    setLoading(true);
    const db = getDatabase(app);
    console.log(roomId);
    const gameRef = ref(db, `rooms/${roomId}`);
    const playerRef = ref(db, `players/${playerId}`);
    await set(playerRef, {
      id: playerId,
      name: name,
      room: roomId,
    });
    await setNewGame(initializeApp(firebaseConfig), roomId, playerId, rules);
    await router.push("/game/" + roomId);
    setLoading(false);
  };

  const handleJoinSession = async (room: string) => {
    setLoading(true);
    const db = getDatabase(app);
    const gameRef = ref(db, `rooms/${room}`);
    const gameInfo = (await get(gameRef)).val();
    if (gameInfo) {
      const playerRef = ref(db, `players/${playerId}`);
      await set(playerRef, {
        id: playerId,
        name: name,
        room: room,
      });
      await set(gameRef, {
        ...gameInfo,
        players: [...gameInfo.players, playerId],
      });
      await router.push("/game/" + room);
    } else setError(true);
    setLoading(false);
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
          <Logo />
          <h3 className={`${classes.message} ${error ? classes.error : ""}`}>
            Room does not exist
          </h3>
          <input
            onChange={() => {
              if (error) {
                setError(false);
              }
            }}
            className={`${classes.ipt} ${error ? classes.invalid : ""}`}
            placeholder="Enter room code"
            type="text"
            ref={roomRef}
          />
          <Button
            className={`${classes.btn}`}
            onClick={() => {
              const roomInput: HTMLInputElement = roomRef.current!;
              if (roomInput.value.trim() !== "") {
                handleJoinSession(roomInput.value);
              }
            }}
          >
            Join session
          </Button>
          <Button
            className={`${classes.btn}`}
            onClick={() => {
              setRoomId(Date.now().toString(36) + playerId);
              setShowModal(true);
            }}
          >
            Create session
          </Button>
        </Fragment>
      )}
      {!loading && !name && (
        <Fragment>
          <input
            placeholder="Enter your name"
            className={`${classes.ipt}`}
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
      {showModal && (
        <Modal
          onClose={() => {
            setShowModal(false);
          }}
        >
          <ChooseRules
            roomId={roomId}
            onStart={(rules: {
              takeUntilPlay: boolean;
              canPlayMultiple: boolean;
              canPlayOverTake: boolean;
              endWhenOneEnds: boolean;
            }) => {
              setShowModal(false);
              handleCreateSession(roomId, rules);
            }}
          />
        </Modal>
      )}
    </div>
  );
};

export default Home;
