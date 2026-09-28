interface ChatMessagesType {
  id: number;
  message: string;
  author: string;
  authorRole: string;
  createdAt: number;
}

export default function ChatMessages() {
  const ChatList: ChatMessagesType[] = [
    {
      id: 1,
      message: "test message",
      author: "user",
      authorRole: "user",
      createdAt: 1789555911,
    },
    {
      id: 2,
      message:
        "In the constructor body of a derived class (with extends), the super keyword may appear as a \"function call\" (super(...args)), which must be called before the this keyword is used, and before the constructor returns. It calls the parent class's constructor and binds the parent class's public fields, after which the derived class's constructor can further access and modify this. The \"property lookup\" form can be used to access methods and properties of an object literal's or class's [[Prototype]]. Within a class's body, the reference of super can be either the superclass's constructor itself, or the constructor's prototype, depending on whether the execution context is instance creation or class initialization. See the Examples section for more details.",
      author: "system",
      authorRole: "system",
      createdAt: 1789557911,
    },
  ];
  return (
    <>
      <div className="relative h-[calc(100dvh-100px)] overflow-y-scroll px-4 lg:px-8">
        <div className="my-16">
          {[...Array(10)].map((_, i) => (
            <div key={i}>
              {ChatList.map((item) =>
                item.authorRole == "user" ? (
                  <div key={item.id} className="flex justify-end m-4 px-4 text-right">
                    <div className="px-4 py-2 bg-gray-200 dark:bg-gray-800/80 max-w-3/4 rounded-4xl">
                      {item.message}
                    </div>
                  </div>
                ) : (
                  <div key={item.id} className="flex justify-start m-4 px-4">
                    <div className="px-4 py-2 w-full">{item.message}</div>
                  </div>
                ),
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
