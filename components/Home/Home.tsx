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
import { firebaseConfig } from "../../store/config";

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
  const [error, setError] = useState<string | false>(false);

  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const router = useRouter();

  const signIn = useCallback(
    async (name?: string) => {
      setLoading(true);

      const p = localStorage.getItem("player");

      if (p) {
        
        const db = getDatabase(app);
        const playerRef = ref(db, `players/${p}`);
        const playerInfo = (await get(playerRef)).val();
        if (!playerInfo) {
          // stale player id (e.g. the database was reset), start over
          localStorage.removeItem("player");
          setLoading(false);
          return;
        }
        setName(playerInfo.name);
        setPlayerId(playerInfo.id);
        if (playerInfo.room) {
          await router.push("/game/" + playerInfo.room);
        }
      } else {
        setName(name!);
        await signInAnonymously(auth).catch((error) => {
          
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
    return onAuthStateChanged(auth, (user) => {
      if (user && !localStorage.getItem("player") && name) {
        setPlayerId(user.uid);
        localStorage.setItem("player", user.uid);
        const db = getDatabase(app);
        const playerRef = ref(db, `players/${user.uid}`);
        set(playerRef, {
          id: user.uid,
          name: name,
          room: "",
        });
      }
    });
  }, [name]);

  const [roomId, setRoomId] = useState("");

  const handleCreateSession = async (
    roomId: string,
    rules: {
      takeUntilPlay: boolean;
      canPlayMultiple: boolean;
      canPlayOverTake: boolean;
      endWhenOneEnds: boolean;
      numberOfPlayers: number
    }
  ) => {
    setLoading(true);
    const db = getDatabase(app);
    
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
    const players: string[] = gameInfo && gameInfo.players ? gameInfo.players : [];
    if (!gameInfo) {
      setError("Room does not exist");
    } else if (
      !players.includes(playerId) &&
      players.length >= gameInfo.rules.numberOfPlayers
    ) {
      setError("Room is full");
    } else {
      const playerRef = ref(db, `players/${playerId}`);
      await set(playerRef, {
        id: playerId,
        name: name,
        room: room,
      });
      if (!players.includes(playerId)) {
        await set(gameRef, {
          ...gameInfo,
          players: [...players, playerId],
        });
      }
      await router.push("/game/" + room);
    }
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
            {error || "Room does not exist"}
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
              numberOfPlayers: number;
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
