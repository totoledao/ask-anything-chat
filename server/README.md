# API Documentation

## Endpoints Overview

1. **POST /rooms/{id}/messages** - Create a new message in a room.
2. **GET /rooms/{id}/messages** - Retrieve all messages from a room.
3. **GET /rooms/{roomID}/messages/{messageID}** - Retrieve a specific message from a room.
4. **PATCH /rooms/{roomID}/messages/{messageID}/react** - Add a reaction to a specific message.
5. **DELETE /rooms/{roomID}/messages/{messageID}/react** - Remove a reaction from a specific message.
6. **PATCH /rooms/{roomID}/messages/{messageID}/answer** - Mark a message as answered.
7. **POST /rooms** - Create a new room.
8. **GET /rooms** - Retrieve all rooms.
9. **WebSocket: /subscribe/{roomID}** - Subscribe to a room via WebSocket.

## POST /rooms/{id}/messages

Create a new message in a room.

- **Request Parameters:**

  - `id` (string): The ID of the room.
  - `message` (string): The content of the message.

- **Response:**

  - Returns an object containing:

  ```typescript
  {
    id: string;
  }
  ```

## GET /rooms/{id}/messages

Retrieve all messages from a room.

- **Request Parameters:**

  - `id` (string): The ID of the room.

- **Response:**

  - Returns an array of `Message` objects.

  ```typescript
  [
    {
      id: string;
      room_id: string;
      message: string;
      reaction_count: number;
      answered: boolean;
    }
  ]
  ```

## GET /rooms/{roomID}/messages/{messageID}

Retrieve a specific message from a room.

- **Request Parameters:**

  - `roomID` (string): The ID of the room.
  - `messageID` (string): The ID of the message.

- **Response:**

  - Returns a `Message` object.

  ```typescript
  {
    id: string;
    room_id: string;
    message: string;
    reaction_count: number;
    answered: boolean;
  }
  ```

## PATCH /rooms/{roomID}/messages/{messageID}/react

Add a reaction to a specific message.

- **Request Parameters:**

  - `roomID` (string): The ID of the room.
  - `messageID` (string): The ID of the message.

- **Response:**

  - Returns an object containing:

  ```typescript
  {
    count: number;
  }
  ```

## DELETE /rooms/{roomID}/messages/{messageID}/react

Remove a reaction from a specific message.

- **Request Parameters:**

  - `roomID` (string): The ID of the room.
  - `messageID` (string): The ID of the message.

- **Response:**

  - Returns an object containing:

  ```typescript
  {
    count: number;
  }
  ```

## PATCH /rooms/{roomID}/messages/{messageID}/answer

Mark a message as answered.

- **Request Parameters:**

  - `roomID` (string): The ID of the room.
  - `messageID` (string): The ID of the message.

- **Response:**

  - Returns an object containing:

  ```typescript
  {
    id: string;
  }
  ```

## POST /rooms

Create a new room.

- **Request Parameters:**

  - `theme` (string): The theme (name) of the room.

- **Response:**

  - Returns an object containing:

  ```typescript
  {
    id: string;
  }
  ```

## GET /rooms

Retrieve all rooms.

- **Response:**

  - Returns an array of `Room` objects.

  ```typescript
  [
    {
      id: string;
      theme: string;
    }
  ]
  ```

## WebSocket: /subscribe/{roomID}

Subscribe to a room via WebSocket.

- **Request Parameters:**

  - `roomID` (string): The ID of the room.

- **Response:**

  - Establishes a WebSocket connection to the specified room and listen to events

  ```typescript
  {
    kind: "message_reaction_increased";
    value: {
      id: string;
      count: number;
    }
  }

  {
    kind: "message_reaction_decreased";
    value: {
      id: string;
      count: number;
    }
  }

  {
    kind: "message_answered";
    value: {
      id: string;
    }
  }

  {
    kind: "message_created";
    value: {
      id: string;
      message: string;
    }
  }
  ```
