import { getDatabase, get, set, ref, remove } from "firebase/database";
import { useReducer } from "react";
import ICard from "./Card/ICard";

export const fetchCardsForPlayer = async (
  app: any,
  playerId: string,
  gameId: any
) => {
  const db = getDatabase(app);
  const roomRef = ref(db, `rooms/${gameId}`);
  const roomInfo = (await get(roomRef)).val();
  const players: any[] = roomInfo.players;
  const myIndex = players.findIndex((el) => el === playerId);
  return roomInfo.cards[myIndex];
};

export const fetchNumberOfPlayers = async (app: any, gameId: any) => {
  const db = getDatabase(app);
  const roomRef = ref(db, `rooms/${gameId}`);
  const roomInfo = (await get(roomRef)).val();
  const players: any[] = roomInfo.players;
  return players.length;
};

export const cardIsPlayable = (
  pCard: ICard,
  tCard: ICard,
  take: number,
  rules: {
    takeUntilPlay: boolean;
    canPlayMultiple: boolean;
    canPlayOverTake: boolean;
    endWhenOneEnds: boolean;
  }
): boolean => {
  if (take > 0 && rules.canPlayOverTake) {
    if (tCard.identifier === "+2") return pCard.identifier === "+2";
    if (tCard.identifier === "+4") return pCard.identifier === "+4";
  }
  if (take > 0 && !rules.canPlayOverTake) return false;
  if (
    pCard.identifier === tCard.identifier ||
    !pCard.color ||
    pCard.color === tCard.color
  ) {
    return true;
  }

  return false;
};

const getNextTurn = (preTurn: number, direction: number, cards: ICard[]) => {
  let nextTurn = (((preTurn + direction) % 2) + 2) % 2;
  while (!cards[nextTurn]) {
    nextTurn = (((nextTurn + direction) % 2) + 2) % 2;
  }
  return nextTurn;
};

export const handlePlayCard = (
  app: any,
  playableCards: ICard[],
  gameId: any,
  playerId: string,
  rules: {
    takeUntilPlay: boolean;
    canPlayMultiple: boolean;
    canPlayOverTake: boolean;
    endWhenOneEnds: boolean;
  }
) => {
  const db = getDatabase(app);
  const roomRef = ref(db, `rooms/${gameId}`);
  const index = get(roomRef).then((snapshot) => {
    const preInfo = snapshot.val();

    if (preInfo.players[preInfo.turn] === playerId) {
      const index = preInfo.players.findIndex((el: string) => el === playerId);
      const newCards = [...preInfo.cards];

      let newTake = preInfo.take;
      let newDirection = preInfo.direction;
      let newTurn = getNextTurn(preInfo.turn, newDirection, preInfo.cards);

      for (const playableCard of playableCards) {
        // remove the card from the hand of the player
        newCards[index] = newCards[index].filter(
          (c: any) => c.id !== playableCard.id
        );
        switch (playableCard.identifier) {
          case "reverse":
            newDirection *= -1;
            break;
          case "+2":
            newTake += 2;
            break;
          case "+4":
            newTake += 4;
            break;
          case "forbid":
            newTurn = getNextTurn(newTurn, newDirection, preInfo.cards);
            break;
        }
        console.log(newCards);

        //condition when the game ends
        let i: number = 0;
        newCards.forEach((el) => {
          if (!el || el.length === 0) i++;
        });
        if (
          (rules.endWhenOneEnds && i === 1) ||
          (!rules.endWhenOneEnds && i === 2 - 1)
        ) {
          setNewGame(app, gameId);
        }
      }
      set(roomRef, {
        ...snapshot.val(),
        top: playableCards[playableCards.length - 1],
        cards: newCards.map((el) => {
          if (!el) return [];
          else return el;
        }),
        take: newTake,
        direction: newDirection,
        // insert previous top card into played cards
        playedCards: [
          ...(preInfo.playedCards ? preInfo.playedCards : []),
          preInfo.top,
          ...playableCards.slice(0, playableCards.length - 1),
        ],
        turn: newTurn,
      });
    }
  });
};

export const doesNotHavePlayableCards = (
  cards: ICard[],
  topCard: ICard,
  take: number,
  rules: {
    takeUntilPlay: boolean;
    canPlayMultiple: boolean;
    canPlayOverTake: boolean;
    endWhenOneEnds: boolean;
  }
) => {
  if (cards) {
    for (const card of cards) {
      if (cardIsPlayable(card, topCard, take, rules)) return false;
    }
    return true;
  }
  return true;
};

export const drawFromDeck = (
  app: any,
  gameId: any,
  playerId: string,
  rules: {
    takeUntilPlay: boolean;
    canPlayMultiple: boolean;
    canPlayOverTake: boolean;
    endWhenOneEnds: boolean;
  }
) => {
  const db = getDatabase(app);
  const roomRef = ref(db, `rooms/${gameId}`);
  get(roomRef).then((snapshot) => {
    const preInfo = snapshot.val();

    if (preInfo.players[preInfo.turn] === playerId) {
      const index = preInfo.players.findIndex((el: string) => el === playerId);
      const newCards = [...preInfo.cards];
      const deck = preInfo.deck;
      console.log(deck);
      const newCard: ICard = preInfo.deck.pop();
      newCards[index].push(newCard);
      if (preInfo.deck.length === 0) {
        preInfo.deck = preInfo.playedCards.sort(() => {
          return Math.random() - 0.5;
        });
        preInfo.playedCards = [];
      }
      set(roomRef, {
        ...snapshot.val(),
        deck: preInfo.deck,
        playedCards: preInfo.playedCards ? preInfo.playedCards : [],
        cards: newCards.map((el) => {
          if (!el) return [];
          else return el;
        }),
        turn:
          !rules.takeUntilPlay &&
          !cardIsPlayable(newCard, preInfo.top, 0, rules)
            ? getNextTurn(preInfo.turn, preInfo.direction, preInfo.cards)
            : preInfo.turn,
      });
    }
  });
};

export const handleTake = (
  app: any,
  gameId: any,
  playerId: string,
  take: number
) => {
  const db = getDatabase(app);
  const roomRef = ref(db, `rooms/${gameId}`);
  get(roomRef).then((snapshot) => {
    const preInfo = snapshot.val();

    if (preInfo.players[preInfo.turn] === playerId) {
      const index = preInfo.players.findIndex((el: string) => el === playerId);
      const newCards = [...preInfo.cards];
      const deck = preInfo.deck;
      console.log(deck);
      while (take > 0) {
        newCards[index].push(preInfo.deck.pop());
        take--;
      }
      if (preInfo.deck.length === 0) {
        preInfo.deck = preInfo.playedCards.sort(() => {
          return Math.random() - 0.5;
        });
        preInfo.playedCards = [];
      }
      set(roomRef, {
        ...snapshot.val(),
        deck: preInfo.deck,
        playedCards: preInfo.playedCards,
        cards: newCards.map((el) => {
          if (!el) return [];
          else return el;
        }),
        take: 0,
        turn: getNextTurn(preInfo.turn, preInfo.direction, preInfo.cards),
      });
    }
  });
};

export const exitRoom = async (app: any, playerId: string, gameId: string) => {
  const db = getDatabase(app);
  const playerRef = ref(db, `players/${playerId}`);
  const snapshotPlayer = await get(playerRef);
  await set(playerRef, { ...snapshotPlayer.val(), room: "" });
  const roomRef = ref(db, `rooms/${gameId}`);
  const snapshotRoom = await get(roomRef);
  const preInfo = snapshotRoom.val();
  const newPlayers = preInfo.players.filter(
    (player: string) => player != playerId
  );
  if (newPlayers.length > 0) {
    await set(roomRef, {
      ...snapshotRoom.val(),
      players: newPlayers,
    });
  } else remove(roomRef);
};

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

export const setNewGame = async (
  app: any,
  roomId: string,
  playerId?: string,
  rules?: {
    takeUntilPlay: boolean;
    canPlayMultiple: boolean;
    canPlayOverTake: boolean;
    endWhenOneEnds: boolean;
  }
) => {
  const db = getDatabase(app);
  const gameRef = ref(db, `rooms/${roomId}`);
  // shuffle the deck
  let deck: ICard[] = [];
  do {
    deck = Array.from(getDeck())
      .map((el) => el[1])
      .sort(() => Math.random() - 0.5);
  } while (deck[28].identifier === "+4" || deck[28].identifier === "choose");
  const gameInfo = await (await get(gameRef)).val();

  await set(gameRef, {
    id: roomId,
    players: gameInfo !== null ? gameInfo.players : [playerId],
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
    take: 0,
    rules: gameInfo !== null ? gameInfo.rules : rules!,
    direction: 1,
  });
};
