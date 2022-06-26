import React, { Fragment, useEffect, useMemo, useState } from "react";
import Card from "./Card/Card";
import classes from "./GameTable.module.scss";
import Hand from "./Hand";
import { useRouter } from "next/router";
import {
  cardIsPlayable,
  doesNotHavePlayableCards,
  drawFromDeck,
  exitRoom,
  fetchCardsForPlayer,
  handlePlayCard,
} from "./GameUtils";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "../../store/config";
import { getDatabase, onChildAdded, onValue, ref } from "firebase/database";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import ICard from "./Card/ICard";
import Playground from "./Playground";
import Modal from "../UI/Modal";
import ChooseColor from "./ChooseColor/ChooseColor";
import { getAuth, onAuthStateChanged, signInAnonymously } from "firebase/auth";

const getCardsFromOther = (roomInfo: any, index: number, i: number) => {
  if (roomInfo.cards) {
    const otherPlayerCards =
      roomInfo.cards[(index + i) % roomInfo.cards.length];
    if (otherPlayerCards)
      return otherPlayerCards.map((c: any) => {
        return {id:c.id, identifier: "back" };
      });
    return [];
  } else return [];
};

const turnToRelativePos = (myIndex: number, currentTurn: number) => {
  return (
    (((currentTurn - myIndex) % numberOfPlayers) + numberOfPlayers) %
    numberOfPlayers
  );
};

const numberOfPlayers = 2;

const rules = {
  takeUntilPlay: false,
};

const GameTable = (props: {
  rules: {
    takeUntilPlay: boolean;
    canPlayMultiple: boolean;
    canPlayOverTake: boolean;
    endWhenOneEnds: boolean;
  };
}) => {

  const app = initializeApp(firebaseConfig);
  onAuthStateChanged(getAuth(app),(user) => {
    if (!user)
    {
      signInAnonymously(getAuth(app));
    }
  });

  const router = useRouter();
  const [cards, setCards] = useState([[], [], [], []]);
  const [players, setPlayers] = useState(1);
  const [deck, setDeck] = useState([]);
  const [topCard, setTopCard]: [any, Function] = useState(undefined);
  const [i, setI] = useState(-1);
  const [turn, setTurn] = useState(-1);
  const [playerId, setPlayerId] = useState("");
  const [take, setTake] = useState(-1);
  const [chooseColor, setChooseColor]: [ICard | undefined, any] =
    useState(undefined);
  console.log(rules);

  useEffect(() => {
    setPlayerId(localStorage.getItem("player")!);
    if (router.query.gameId) {
      const app = initializeApp(firebaseConfig);
      const gameString = `rooms/${router.query.gameId}`;
      onValue(ref(getDatabase(app), gameString), (snapshot) => {
        const newRoomInfo = snapshot.val();
        if (
          newRoomInfo !== null &&
          newRoomInfo.players &&
          newRoomInfo.players.includes(playerId)
        ) {
          const index = newRoomInfo.players.findIndex(
            (el: string) => el === playerId
          );
          if (players < numberOfPlayers) {
            setPlayers(newRoomInfo.players.length);
          }
          setTopCard(newRoomInfo.top);
          setDeck(newRoomInfo.deck);
          if (index !== i) {
            setI(index);
          }
          if (newRoomInfo.turn !== turn) {
            setTurn(newRoomInfo.turn);
          }
          if (newRoomInfo.take !== take) {
            setTake(newRoomInfo.take);
          }
          setCards([
            newRoomInfo.cards[index],
            getCardsFromOther(newRoomInfo, index, 1),
            getCardsFromOther(newRoomInfo, index, 2),
            getCardsFromOther(newRoomInfo, index, 3),
          ]);
        }
      });
    }
  }, [i, router.query.gameId, turn, players, take, playerId]);

  const cantPlay = useMemo(
    () =>
      doesNotHavePlayableCards(cards[0], topCard, take, props.rules) &&
      i === turn,
    [cards, topCard, take, i, turn, props.rules]
  );

  const handleColorChose = (color: string) => {
    const card = chooseColor!;
    handlePlayCard(
      initializeApp(firebaseConfig),
      { id: card.id, identifier: card.identifier, color },
      router.query.gameId,
      playerId!,
      props.rules
    );
    setChooseColor(false);
  };

  return (
    <div
      className={`${classes.table} ${
        players === numberOfPlayers
          ? classes["turn_" + turnToRelativePos(i, turn)]
          : classes["no-players"]
      }`}
    >
      {playerId && (
        <button
          onClick={async () => {
            await exitRoom(
              initializeApp(firebaseConfig),
              playerId!,
              router.query.gameId + ""
            );
            await router.push("/");
          }}
        >
          Leave Room
        </button>
      )}
      {(!topCard || players < numberOfPlayers) && (
        <div className={`${classes.waiting}`}>
          <FontAwesomeIcon
            className={`${classes.icon} fa-spin`}
            icon={faCircleNotch}
          />
          <div className={`${classes.players}`}>
            {players}/{numberOfPlayers}
          </div>
        </div>
      )}
      {topCard && players === numberOfPlayers && (
        <Fragment>
          <Hand
            onPlay={(card: ICard) => {
              if (cardIsPlayable(card, topCard, take, props.rules)) {
                if (card.identifier === "+4" || card.identifier === "choose") {
                  setChooseColor(card);
                } else {
                  handlePlayCard(
                    initializeApp(firebaseConfig),
                    card,
                    router.query.gameId,
                    playerId!,
                    props.rules
                  );
                }
              }
            }}
            className={` ${classes["my-hand"]}`}
            cards={cards[0]}
          />
          <Playground
            rules={props.rules}
            myTurn={i === turn}
            cantPlay={cantPlay}
            take={take}
            topCard={topCard}
            className={`${classes.playground}`}
          />
          <Hand
            vertical
            className={` ${classes["left-player"]}`}
            cards={cards[1]}
          />
          <Hand className={` ${classes["top-player"]}`} cards={cards[2]} />
          <Hand
            vertical
            className={` ${classes["right-player"]}`}
            cards={cards[3]}
          />
          {chooseColor && (
            <Modal>
              <ChooseColor
                onColorChose={(color: string) => handleColorChose(color)}
              />
            </Modal>
          )}
        </Fragment>
      )}
    </div>
  );
};

export default GameTable;
