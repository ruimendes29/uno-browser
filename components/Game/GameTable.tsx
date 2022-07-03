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
import {
  get,
  getDatabase,
  onChildAdded,
  onValue,
  ref,
} from "firebase/database";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch, faTimes } from "@fortawesome/free-solid-svg-icons";
import ICard from "./Card/ICard";
import Playground from "./Playground";
import Modal from "../UI/Modal";
import ChooseColor from "./ChooseColor/ChooseColor";
import { getAuth, onAuthStateChanged, signInAnonymously } from "firebase/auth";
import Button from "../UI/Button";
import {
  angleToPosition,
  getRelativeIndex,
  turnToRelativePos,
} from "./PositionUtils";

const getCardsFromOther = (roomInfo: any, index: number, i: number) => {
  if (roomInfo.cards) {
    const otherPlayerCards =
      roomInfo.cards[(index + i) % roomInfo.cards.length].hand;
    if (otherPlayerCards!=="finished")
      return otherPlayerCards.map((c: any) => {
        return { id: c.id, identifier: "back" };
      });
    return [];
  } else return [];
};

const GameTable = () => {
  const app = initializeApp(firebaseConfig);
  onAuthStateChanged(getAuth(app), (user) => {
    if (!user) {
      signInAnonymously(getAuth(app));
    }
  });

  const router = useRouter();
  const [cards, setCards] = useState([]);
  const [players, setPlayers] = useState(1);
  const [deck, setDeck] = useState([]);
  const [topCard, setTopCard]: [any, Function] = useState(undefined);
  const [i, setI] = useState(-1);
  const [turn, setTurn] = useState(-1);
  const [playerId, setPlayerId] = useState("");
  const [take, setTake] = useState(-1);
  const [grouping, setGrouping]: [{ active: boolean; cards: ICard[] }, any] =
    useState({ active: false, cards: [] });
  const [chooseColor, setChooseColor]: [ICard | undefined, any] =
    useState(undefined);
  const [names, setNames] = useState([]);
  const [rules, setRules]: [any, any] = useState({});
  const numberOfPlayers = rules.numberOfPlayers;

  const currentTurn = turnToRelativePos(i, turn, numberOfPlayers);

  console.log(currentTurn);
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
          const playersRef = ref(getDatabase(app), `players`);
          get(playersRef).then((playersInfo) => {
            const playersValue: any = playersInfo.val();
            setNames(
              newRoomInfo.players.map((pId: string) => playersValue[pId]!.name)
            );
          });
          setRules(newRoomInfo.rules);
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
          setRules;
          setCards(
            newRoomInfo.cards.map((hand: ICard[], i: number) => {
              if (i === 0) {
                const hand = newRoomInfo.cards[index].hand;
                return hand==="finished"?[]:hand;
              }
              return getCardsFromOther(newRoomInfo, index, i);
            })
          );
        }
      });
    }
  }, [i, router.query.gameId, turn, players, take, playerId, numberOfPlayers]);

  const cantPlay = useMemo(
    () =>
      doesNotHavePlayableCards(cards[0], topCard, take, rules) && i === turn,
    [cards, topCard, take, i, turn, rules]
  );

  const handleColorChose = (color: string) => {
    const card = chooseColor!;
    handlePlayCard(
      initializeApp(firebaseConfig),
      [{ id: card.id, identifier: card.identifier, color }],
      router.query.gameId,
      playerId!,
      rules
    );
    setChooseColor(false);
  };

  const handlePlayMultipleCards = (card: ICard) => {
    setGrouping((oldGroup: { active: boolean; cards: ICard[] }) => {
      if (oldGroup.cards.includes(card))
        return {
          ...oldGroup,
          cards:
            oldGroup.cards[0] === card
              ? []
              : oldGroup.cards.filter((el) => el != card),
        };
      if (
        oldGroup.cards.length === 0 &&
        cardIsPlayable(card, topCard, take, rules)
      ) {
        return { ...oldGroup, cards: [card] };
      }
      if (
        oldGroup.cards.length > 0 &&
        card.identifier === oldGroup.cards[0].identifier
      ) {
        return { ...oldGroup, cards: [...oldGroup.cards, card] };
      }
      return oldGroup;
    });
  };

  const handleGroupClicked = () => {
    if (grouping.active) {
      if (grouping.cards.length > 0) {
        handlePlayCard(
          initializeApp(firebaseConfig),
          grouping.cards,
          router.query.gameId,
          playerId,
          rules
        );
      }
      setGrouping({ active: false, cards: [] });
    } else setGrouping({ active: true, cards: [] });
  };

  console.log(names);

  return (
    <div
      className={`${classes.table} ${
        players === numberOfPlayers ? "" : classes["no-players"]
      }`}
    >
      {playerId && (
        <FontAwesomeIcon
          onClick={async () => {
            await exitRoom(
              initializeApp(firebaseConfig),
              playerId!,
              router.query.gameId + ""
            );
            await router.push("/");
          }}
          className={`${classes.leave}`}
          icon={faTimes}
        />
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
          <Playground
            rules={rules}
            myTurn={i === turn}
            cantPlay={cantPlay}
            take={take}
            topCard={topCard}
            className={`${classes.playground}`}
          />
          <Hand
            mine
            name={names[getRelativeIndex(i, 0, numberOfPlayers)]}
            grouping={grouping}
            clickedGroup={handleGroupClicked}
            myTurn={currentTurn === 0}
            selected={grouping.cards}
            canPlayMultiple={rules.canPlayMultiple}
            onPlay={(card: ICard) => {
              if (grouping.active) {
                handlePlayMultipleCards(card);
              } else if (cardIsPlayable(card, topCard, take, rules)) {
                if (card.identifier === "+4" || card.identifier === "choose") {
                  setChooseColor(card);
                } else {
                  handlePlayCard(
                    initializeApp(firebaseConfig),
                    [card],
                    router.query.gameId,
                    playerId!,
                    rules
                  );
                }
              }
            }}
            style={{
              ...angleToPosition(-Math.PI / 2),
              width: `80vw`,
              height: `11.2em`,
              backgroundColor: "black",
            }}
            className={`${classes["my-hand"]}`}
            cards={[...(cards[0] ? cards[0] : [])]}
          />
          {cards.slice(1).map((handCards, index) => (
            <Hand
              name={names[getRelativeIndex(i, index + 1, numberOfPlayers)]}
              myTurn={currentTurn === index + 1}
              cards={handCards}
              key={index}
              style={{
                ...angleToPosition(
                  -Math.PI / 2 + (index + 1) * ((Math.PI * 2) / numberOfPlayers)
                ),
              }}
            />
          ))}

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
