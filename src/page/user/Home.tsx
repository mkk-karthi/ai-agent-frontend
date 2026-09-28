import ChatHeader from "../../components/user/ChatHeader";
import { useEffect, useState } from "react";
import PromptInput from "../../components/user/PromptInput";
import { useParams } from "react-router-dom";
import ChatMessages from "../../components/user/ChatMessages";
import { useUserStore } from "../../stores/UserStore";

export default function Home(): React.ReactElement {
  const [prompt, setPrompt] = useState("");
  const { id } = useParams();
  const { user } = useUserStore.getState();

  useEffect(() => {
    console.log(id);
  }, []);

  return (
    <>
      <ChatHeader id={id} />
      {id == "new" ? (
        <div className="flex flex-col size-full justify-center items-center">
          <div className="flex text-4xl my-8">
            Ask your query,
            <span className="lowercase first-letter:uppercase ml-2">{user?.firstName}</span>
          </div>
          <PromptInput className="w-sm md:w-2xl my-2" />
        </div>
      ) : (
        <div className="">
          <div>
            <ChatMessages />
          </div>
          <div className="absolute bottom-0 left-0 w-full min-h-14 flex justify-center px-4 z-2">
            <PromptInput className="w-sm md:w-3xl" />
          </div>
        </div>
      )}
    </>
  );
}
