import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { postCreateRoomMessage } from "../api/messages";
import { Button } from "./button";

export function SendMessageForm({ roomID }: { roomID?: string }) {
  if (!roomID) {
    throw new Error("Missing roomID prop");
  }

  async function sendMessageAction(data: FormData) {
    const message = data.get("message")?.toString();
    if (!message || !roomID) return;

    try {
      await postCreateRoomMessage({ id: roomID, message: message });
    } catch (err) {
      toast.error(err?.toString());
    }
  }

  return (
    <form
      action={sendMessageAction}
      className="flex items-center gap-2 bg-zinc-900  p-2 rounded-xl border border-zinc-800 ring-orange-400 ring-offset-3 ring-offset-zinc-950 focus-within:ring-1"
    >
      <input
        className="flex-1 text-sm bg-transparent mx-2 outline-none placeholder:text-zinc-500 text-zinc-100"
        type="text"
        name="message"
        placeholder="Ask anything"
        autoComplete="off"
        required
      />
      <Button text="Send" Icon={ArrowRight} />
    </form>
  );
}
