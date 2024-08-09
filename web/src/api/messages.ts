import { Message } from "../types/message-types";
import { API } from "./constants";

interface postCreateRoomMessageRequest {
  id: string;
  message: string;
}

export async function postCreateRoomMessage({
  id,
  message,
}: postCreateRoomMessageRequest) {
  const res = await fetch(`${API}/rooms/${id}/messages`, {
    method: "post",
    body: JSON.stringify({ message }),
  });

  return <{ id: string }>await res.json();
}

export async function getRoomMessages(id: string) {
  const res = await fetch(`${API}/rooms/${id}/messages`, {
    method: "get",
  });

  return <Message[]>await res.json();
}

interface RoomMessageRequest {
  roomID: string;
  messageID: string;
}

export async function getRoomMessage({
  roomID,
  messageID,
}: RoomMessageRequest) {
  const res = await fetch(`${API}/rooms/${roomID}/messages/${messageID}`, {
    method: "get",
  });

  return <Message>await res.json();
}

export async function addReactionFromMessage({
  roomID,
  messageID,
}: RoomMessageRequest) {
  const res = await fetch(
    `${API}/rooms/${roomID}/messages/${messageID}/react`,
    {
      method: "patch",
    }
  );

  return <{ count: number }>await res.json();
}

export async function deleteReactionFromMessage({
  roomID,
  messageID,
}: RoomMessageRequest) {
  const res = await fetch(
    `${API}/rooms/${roomID}/messages/${messageID}/react`,
    {
      method: "delete",
    }
  );

  return <{ count: number }>await res.json();
}

export async function markMessageAsAnswered({
  roomID,
  messageID,
}: RoomMessageRequest) {
  const res = await fetch(
    `${API}/rooms/${roomID}/messages/${messageID}/answer`,
    {
      method: "patch",
    }
  );

  return <{ id: string }>await res.json();
}
