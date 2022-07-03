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
  return roomInfo.cards[myIndex].hand;
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

const getNextTurn = (
  preTurn: number,
  direction: number,
  cards: { hand: ICard[]|string }[],
  numberOfPlayers: number
) => {
  let nextTurn =
    (((preTurn + direction) % numberOfPlayers) + numberOfPlayers) %
    numberOfPlayers;
  while (cards[nextTurn].hand === "finished") {
    nextTurn =
      (((nextTurn + direction) % numberOfPlayers) + numberOfPlayers) %
      numberOfPlayers;
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
    numberOfPlayers: number;
  }
) => {
  const db = getDatabase(app);
  const roomRef = ref(db, `rooms/${gameId}`);
  get(roomRef).then((snapshot) => {
    const preInfo = snapshot.val();

    if (preInfo.players[preInfo.turn] === playerId) {
      const index = preInfo.players.findIndex((el: string) => el === playerId);
      const newCards = [...preInfo.cards];

      let newTake = preInfo.take;
      let newDirection = preInfo.direction;
      let newTurn = getNextTurn(
        preInfo.turn,
        newDirection,
        preInfo.cards,
        rules.numberOfPlayers
      );

      for (const playableCard of playableCards) {
        // remove the card from the hand of the player
        newCards[index].hand = newCards[index].hand.filter(
          (c: any) => c.id !== playableCard.id
        );
        switch (playableCard.identifier) {
          case "reverse":
            newDirection *= -1;
            newTurn = getNextTurn(
              preInfo.turn,
              newDirection,
              preInfo.cards,
              rules.numberOfPlayers
            );
            break;
          case "+2":
            newTake += 2;
            break;
          case "+4":
            newTake += 4;
            break;
          case "forbid":
            newTurn = getNextTurn(
              newTurn,
              newDirection,
              preInfo.cards,
              rules.numberOfPlayers
            );
            break;
        }
        //condition when the game ends
        let i: number = 0;
        if (newCards[index].hand.length===0)
        {
          newCards[index].hand = "finished";
        }
        newCards.forEach((el) => {
          if (!el || el.length === 0) i++;
        });
        if (
          (rules.endWhenOneEnds && i === 1) ||
          (!rules.endWhenOneEnds && i === rules.numberOfPlayers - 1)
        ) {
          setNewGame(app, gameId, undefined, preInfo.rules);
        }
      }
      set(roomRef, {
        ...snapshot.val(),
        top: playableCards[playableCards.length - 1],
        cards: newCards.map((el) => {
          if (!el) return { hand: [] };
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
    numberOfPlayers: number;
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

      const newCard: ICard = preInfo.deck.pop();
      newCards[index].hand.push(newCard);
      if (preInfo.deck.length === 0) {
        preInfo.deck = preInfo.playedCards.sort(() => {
          const a = Math.random();
          const b = Math.random();
          return a - b;
        });
        preInfo.playedCards = [];
      }
      set(roomRef, {
        ...snapshot.val(),
        deck: preInfo.deck,
        playedCards: preInfo.playedCards ? preInfo.playedCards : [],
        cards: newCards.map((el) => {
          if (!el) return { hand: [] };
          else return el;
        }),
        turn:
          !rules.takeUntilPlay &&
          !cardIsPlayable(newCard, preInfo.top, 0, rules)
            ? getNextTurn(
                preInfo.turn,
                preInfo.direction,
                preInfo.cards,
                rules.numberOfPlayers
              )
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

      while (take > 0) {
        newCards[index].hand.push(preInfo.deck.pop());
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
          if (!el) return { hand: [] };
          else return el;
        }),
        take: 0,
        turn: getNextTurn(preInfo.turn, preInfo.direction, preInfo.cards, preInfo.rules.numberOfPlayers),
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
    numberOfPlayers: number;
  }
) => {
  const db = getDatabase(app);
  const gameRef = ref(db, `rooms/${roomId}`);
  // shuffle the deck
  let deck: ICard[] = [];
  const gameInfo = await (await get(gameRef)).val();
  const players = rules
    ? rules.numberOfPlayers
    : gameInfo.rules.numberOfPlayers;
  do {
    deck = Array.from(getDeck())
      .map((el) => el[1])
      .sort(() => {
        const a = Math.random();
        const b = Math.random();
        return a - b;
      });
  } while (
    deck[7 * players].identifier === "+4" ||
    deck[7 * players].identifier === "choose"
  );

  // deal the cards
  const cards: { hand: ICard[] }[] = [];
  const numberOfCardsPerPlayer = 7;
  for (let i = 0; i < players; i++) {
    cards.push({
      hand: deck.slice(
        i * numberOfCardsPerPlayer,
        (i + 1) * numberOfCardsPerPlayer
      ),
    });
  }

  await set(gameRef, {
    id: roomId,
    players: gameInfo !== null ? gameInfo.players : [playerId],
    // distribute 7 cards for each player
    cards,
    // assign the rest to the deck
    deck: deck.slice(7 * players + 1),
    top: deck[7 * players],
    turn: 0,
    take: 0,
    rules: gameInfo !== null ? gameInfo.rules : rules!,
    direction: 1,
  });
};
