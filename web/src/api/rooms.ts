import { Room } from "../types/room-types";
import { API } from "./constants";

export async function postCreateRoom(theme: string) {
  const res = await fetch(`${API}/rooms`, {
    method: "post",
    body: JSON.stringify({
      theme,
    }),
  });

  return <{ id: string }>await res.json();
}

export async function getRooms() {
  const res = await fetch(`${API}/rooms`, {
    method: "get",
  });

  return <Room[]>await res.json();
}
