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
    method: "POST",
    body: JSON.stringify({ message }),
  });

  return <{ id: string }>await res.json();
}

export async function getRoomMessages(id: string) {
  const res = await fetch(`${API}/rooms/${id}/messages`, {
    method: "GET",
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
    method: "GET",
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
      method: "PATCH",
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
      method: "DELETE",
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
      method: "PATCH",
    }
  );

  return <{ id: string }>await res.json();
}
