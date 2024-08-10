type WSMessageReactionIncreased = {
  kind: "message_reaction_increased";
  value: {
    id: string;
    count: number;
  };
};

type WSMessageReactionDecreased = {
  kind: "message_reaction_decreased";
  value: {
    id: string;
    count: number;
  };
};

type WSMessageAnswered = {
  kind: "message_answered";
  value: {
    id: string;
  };
};

type WSMessageCreated = {
  kind: "message_created";
  value: {
    id: string;
    message: string;
  };
};

export type WSMessage =
  | WSMessageReactionIncreased
  | WSMessageReactionDecreased
  | WSMessageAnswered
  | WSMessageCreated;
