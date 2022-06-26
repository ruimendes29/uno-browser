import { getDatabase, get, set, ref } from "firebase/database";
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

export const fetchNumberOfPlayers = async (
  app: any,
  gameId: any
) => {
  const db = getDatabase(app);
  const roomRef = ref(db, `rooms/${gameId}`);
  const roomInfo = (await get(roomRef)).val();
  const players: any[] = roomInfo.players;
  return players.length;
};

const cardIsPlayable = (pCard: ICard, tCard: ICard): boolean => {
  if (pCard.identifier === tCard.identifier||(!pCard.color)||pCard.color===tCard.color) {
    return true;
  }

  return false;
};

export const handlePlayCard = (
  app: any,
  topCard: ICard,
  playableCard: ICard,
  gameId: any,
  playerId: string
) => {
  const db = getDatabase(app);
  const roomRef = ref(db, `rooms/${gameId}`);
  const index = get(roomRef).then((snapshot) => {
    const preInfo = snapshot.val();

    if (
      preInfo.players[preInfo.turn] === playerId &&
      cardIsPlayable(playableCard, topCard)
    ) {
      const index = preInfo.players.findIndex((el: string) => el === playerId);
      const newCards = [...preInfo.cards];
      newCards[index] = newCards[index].filter(
        (c: any) => c.id !== playableCard.id
      );
      set(roomRef, {
        ...snapshot.val(),
        top: playableCard,
        cards: newCards,
        turn: (preInfo.turn + 1) % 4,
      });
    }
  });
};
