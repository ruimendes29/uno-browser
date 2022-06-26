import React, { Fragment, useEffect, useMemo, useState } from "react";
import Card from "./Card/Card";
import classes from "./GameTable.module.scss";
import Hand from "./Hand";
import { useRouter } from "next/router";
import { fetchCardsForPlayer, handlePlayCard } from "./GameUtils";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "../../store/config";
import { getDatabase, onChildAdded, onValue, ref } from "firebase/database";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import ICard from "./Card/ICard";

const getCardsFromOther = (roomInfo: any, index: number, i: number) => {
  return roomInfo.cards[(index + i) % roomInfo.cards.length].map((c: any) => {
    return { identifier: "back" };
  });
};

const turnToRelativePos = (myIndex: number, currentTurn: number) => {
  return (((currentTurn - myIndex) % 4) + 4) % 4;
};

const GameTable = () => {
  const router = useRouter();
  const [cards, setCards] = useState([[], [], [], []]);
  const [players, setPlayers] = useState(1);
  const [topCard, setTopCard]: [any, Function] = useState(undefined);
  const [i, setI] = useState(-1);
  const [turn, setTurn] = useState(-1);

  useEffect(() => {
    if (router.query.gameId) {
      const app = initializeApp(firebaseConfig);
      const gameString = `rooms/${router.query.gameId}`;
      onValue(ref(getDatabase(app), gameString), (snapshot) => {
        const newRoomInfo = snapshot.val();
        console.log(players);
        const index = newRoomInfo.players.findIndex(
          (el: string) => el === localStorage.getItem("player")
        );
        if (players < 4) {
          setPlayers(newRoomInfo.players.length);
        }
        setTopCard(newRoomInfo.top);

        if (index !== i) {
          setI(index);
        }
        console.log(newRoomInfo.cards[index]);
        if (newRoomInfo.turn !== turn) {
          setTurn(newRoomInfo.turn);
        }
        setCards([
          newRoomInfo.cards[index],
          getCardsFromOther(newRoomInfo, index, 1),
          getCardsFromOther(newRoomInfo, index, 2),
          getCardsFromOther(newRoomInfo, index, 3),
        ]);
      });
    }
  }, [i, router.query.gameId, turn, players]);

  return (
    <div
      className={`${classes.table} ${players===4?
        classes["turn_" + turnToRelativePos(i, turn)] : classes["no-players"]
      }`}
    >
      {(!topCard || players < 4) && (
        <div className={`${classes.waiting}`}>
          <FontAwesomeIcon
            className={`${classes.icon} fa-spin`}
            icon={faCircleNotch}
          />
          <div className={`${classes.players}`}>{players}/4</div>
        </div>
      )}
      {topCard && players === 4 && (
        <Fragment>
          <Hand
            onPlay={(card: ICard) => {
              handlePlayCard(
                initializeApp(firebaseConfig),
                topCard,
                card,
                router.query.gameId,
                localStorage.getItem("player")!
              );
            }}
            className={` ${classes["my-hand"]}`}
            cards={cards[0]}
          />
          <Card
            className={`${classes["top-card"]}`}
            identifier={topCard.identifier}
            color={topCard.color}
          />
          <Hand
            vertical
            className={` ${classes["left-player"]}`}
            cards={[...cards[1], ...cards[1], ...cards[2]]}
          />
          <Hand className={` ${classes["top-player"]}`} cards={cards[2]} />
          <Hand
            vertical
            className={` ${classes["right-player"]}`}
            cards={cards[3]}
          />
        </Fragment>
      )}
    </div>
  );
};

export default GameTable;
