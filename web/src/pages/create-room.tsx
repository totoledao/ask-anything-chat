import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import amaLogo from "../assets/ama-logo.svg";
import { Button } from "../components/button";

export function CreateRoom() {
  const navigate = useNavigate();

  function handleCreateRoom(data: FormData) {
    const theme = data.get("theme");
    if (!theme) return toast.error("You have to choose a name for your room");

    navigate(`/room/${theme}`);
  }

  return (
    <main className="h-screen flex items-center justify-center px-4">
      <div className="max-w-[450px] flex flex-col gap-6">
        <img src={amaLogo} alt="Ask me anything Logo" className="h-10" />

        <p className="leading-relaxed text-zinc-300 text-center">
          Create a public AMA (Ask me anything) room and prioritize the most
          important questions for the community.
        </p>

        <form
          action={handleCreateRoom}
          className="flex items-center gap-2 bg-zinc-900  p-2 rounded-xl border border-zinc-800 ring-orange-400 ring-offset-3 ring-offset-zinc-950 focus-within:ring-1"
        >
          <input
            className="flex-1 text-sm bg-transparent mx-2 outline-none placeholder:text-zinc-500 text-zinc-100"
            type="text"
            name="theme"
            placeholder="Room name"
            autoComplete="off"
          />
          <Button text="Create room" Icon={ArrowRight} />
        </form>
      </div>
    </main>
  );
}
