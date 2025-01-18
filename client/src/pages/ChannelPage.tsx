import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/Redux/store";
import { api } from "@/api/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";
import { Navbar } from "@/components/shared/Navbar";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { socketService } from "@/services/socketService";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface Message {
  _id: string;
  channelId: string;
  content: string;
  sender: {
    _id: string;
    firstName: string;
    lastName: string;
    media?: string[];
  };
  createdAt: string;
}

const DEBUG_MODE = false; // You can change this to true to enable logging

export default function ChannelPage() {
  const { channelId } = useParams();
  const queryClient = useQueryClient();
  const users = useSelector((state: RootState) => state.user);
  const user = { ...users, _id: sessionStorage.getItem("id") };
  const channels = useSelector((state: RootState) => state.channels.channels);
  const [newMessage, setNewMessage] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isConnected, setIsConnected] = useState(false);
  console.log(isConnected);
  const currentChannel = channels.find((channel) => channel._id === channelId);

  // Query for fetching messages
  const { data: messages = [] } = useQuery({
    queryKey: ["messages", channelId],
    queryFn: async () => {
      if (!channelId) return [];
      const response = await api.get(`/messages/channel/${channelId}`);
      return Array.isArray(response.data) ? response.data : [];
    },
    enabled: !!channelId,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    staleTime: Infinity,
  });

  // Add a debug logger function
  const debugLog = (message: string, data?: any) => {
    if (DEBUG_MODE) {
      if (data) {
        console.log(message, data);
      } else {
        console.log(message);
      }
    }
  };

  // Socket connection effect
  useEffect(() => {
    if (!channelId || !user._id) return;

    // Connect to socket
    const socket = socketService.connect(channelId);
    setIsConnected(true);

    // Join channel after connection
    socket.on("connect", () => {
      debugLog(`🟢 Socket Connected to channel: ${channelId}`);
      socket.emit("join channel", channelId);
      debugLog(`📡 Emitted: join channel ${channelId}`);
    });

    socket.on("message received", (newMessage: Message) => {
      debugLog(`📩 Received message:`, newMessage);
      // Update messages in cache
      queryClient.setQueryData(
        ["messages", channelId],
        (oldMessages: any[] = []) => {
          // Avoid duplicate messages
          if (oldMessages.some((msg) => msg._id === newMessage._id)) {
            return oldMessages;
          }
          return [...oldMessages, newMessage];
        }
      );
      // Scroll to bottom on new message
      scrollToBottom();
    });

    // Error handling
    socket.on("connect_error", (error) => {
      debugLog(`🔴 Socket Connection Error:`, error);
    });

    socket.on("error", (error) => {
      debugLog(`❌ Socket Error:`, error);
    });

    // Cleanup function
    return () => {
      debugLog(`👋 Leaving channel ${channelId}`);
      socket.emit("leave channel", channelId);
      socketService.disconnect();
      setIsConnected(false);
    };
  }, [channelId, user._id, queryClient]);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !channelId || !user._id) return;

    try {
      debugLog(`📤 Emitting message to channel ${channelId}:`, {
        content: newMessage.trim(),
        sender: user._id,
      });

      socketService.emitMessage({
        channelId: channelId,
        content: newMessage.trim(),
        sender: user._id,
      });

      setNewMessage("");
      debugLog(`✅ Message emission completed`);
    } catch (error) {
      debugLog(`❌ Error sending message:`, error);
    }
  };

  return (
    <div className="flex h-screen">
      <Navbar isVertical isAccordion modes="home" />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Channel Header */}
        <div className="h-14 md:h-20 border-b flex items-center justify-center bg-background shrink-0">
          <h1 className="text-xl md:text-3xl lg:text-4xl font-bold text-center bg-gradient-to-r from-[#F596D3] to-[#D247BF] text-transparent bg-clip-text px-6">
            {currentChannel?.name || "Channel"}
          </h1>
        </div>

        {/* Content Container - Updated with max-width and center alignment */}
        <div className="flex-1 flex justify-center overflow-hidden">
          <div className="w-full max-w-3xl px-4 py-6 flex flex-col">
            {/* Chat Container */}
            <div className="flex-1 flex flex-col rounded-lg border shadow-sm overflow-hidden bg-background/50">
              {/* Messages Area */}
              <ScrollArea ref={scrollAreaRef} className="flex-1" type="always">
                <div className="flex flex-col gap-4 p-4">
                  {Array.isArray(messages) && messages.length > 0 ? (
                    messages.map((message: Message) => {
                      const isCurrentUser = message.sender._id === user._id;
                      return (
                        <div
                          key={message._id}
                          className={`flex items-start gap-2 w-full ${
                            isCurrentUser ? "flex-row-reverse" : "flex-row"
                          }`}
                        >
                          {/* Avatar */}
                          <Avatar className="w-8 h-8 shrink-0 mt-1">
                            {message.sender.media?.[0] ? (
                              <AvatarImage src={message.sender.media[0]} />
                            ) : (
                              <AvatarFallback className="bg-primary/10 text-xs">
                                {message.sender.firstName?.[0]}
                                {message.sender.lastName?.[0]}
                              </AvatarFallback>
                            )}
                          </Avatar>

                          {/* Message Content Container */}
                          <div
                            className={`flex flex-col ${
                              isCurrentUser ? "items-end" : "items-start"
                            } max-w-[calc(100%-4rem)] space-y-1`}
                          >
                            {/* Name */}
                            <span className="text-xs font-medium text-muted-foreground px-1">
                              {message.sender.firstName}{" "}
                              {message.sender.lastName}
                            </span>

                            {/* Message Bubble */}
                            <div
                              className={`w-fit max-w-full ${
                                isCurrentUser
                                  ? "bg-[#F596D3]/20 border border-[#F596D3]/30 rounded-l-lg rounded-br-lg"
                                  : "bg-gray-100 dark:bg-gray-800/50 rounded-r-lg rounded-bl-lg"
                              } px-3 py-2`}
                            >
                              {/* Message Text - Added break-all for long words */}
                              <div className="break-all whitespace-pre-wrap text-sm inline-block">
                                {message.content}
                              </div>

                              {/* Timestamp */}
                              <div className="text-[10px] mt-1 text-muted-foreground/70 text-right">
                                {new Date(message.createdAt).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No messages yet. Start the conversation!
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 bg-accent/30 border-t">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 bg-background"
                  />
                  <Button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-gradient-to-r from-[#F596D3] to-[#D247BF] hover:opacity-90"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
