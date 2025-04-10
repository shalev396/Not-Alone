import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/Redux/store";
import { api } from "@/api/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, AlertCircle, X, Users, MessageCircle } from "lucide-react";
import { Navbar } from "@/components/shared/Navbar";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { socketService } from "@/services/socketService";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

const DEBUG_MODE = false;

export default function ChannelPage() {
  const navigate = useNavigate();
  const { channelId } = useParams();
  const queryClient = useQueryClient();
  const users = useSelector((state: RootState) => state.user);
  const user = { ...users, _id: sessionStorage.getItem("id") };
  const channels = useSelector((state: RootState) => state.channels.channels);
  const [newMessage, setNewMessage] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isConnected, setIsConnected] = useState(false);
  console.log(isConnected);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const currentChannel = channels.find((channel) => channel._id === channelId);

  // Query for fetching messages
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["messages", channelId],
    queryFn: async () => {
      if (!channelId) return [];
      try {
        const response = await api.get(`/messages/channel/${channelId}`);
        debugLog("Initial messages loaded:", response.data);
        return Array.isArray(response.data)
          ? response.data
          : response.data?.messages
          ? response.data.messages
          : [];
      } catch (error: any) {
        if (error.response?.status === 401) {
          navigate("/login");
        }
        setErrorMessage(
          error.response?.data?.message || "Failed to fetch messages"
        );
        setShowError(true);
        return [];
      }
    },
    enabled: !!channelId,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    staleTime: Infinity,
  });

  // Debug logger function
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

    debugLog(`Setting up socket connection for channel: ${channelId}`);

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
          // If oldMessages is not an array, handle it
          if (!Array.isArray(oldMessages)) {
            debugLog("oldMessages is not an array:", oldMessages);
            oldMessages = [];
          }

          // Avoid duplicate messages
          if (oldMessages.some((msg) => msg._id === newMessage._id)) {
            debugLog("Duplicate message detected, not adding to cache");
            return oldMessages;
          }

          debugLog("Adding new message to cache");
          return [...oldMessages, newMessage];
        }
      );

      // Scroll to bottom on new message
      scrollToBottom();
    });

    // Error handling
    socket.on("connect_error", (error) => {
      debugLog(`🔴 Socket Connection Error:`, error);
      setErrorMessage("Failed to connect to chat server");
      setShowError(true);
    });

    socket.on("error", (error) => {
      debugLog(`❌ Socket Error:`, error);
      setErrorMessage("An error occurred with the chat connection");
      setShowError(true);
    });

    // Cleanup function
    return () => {
      debugLog(`👋 Leaving channel ${channelId}`);
      socket.emit("leave channel", channelId);
      socketService.disconnect();
      setIsConnected(false);
    };
  }, [channelId, user._id, queryClient]);

  // Add some additional debugging for messages state
  useEffect(() => {
    debugLog(`Messages state updated, count: ${messages?.length || 0}`);
  }, [messages]);

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
      setErrorMessage("Failed to send message");
      setShowError(true);
    }
  };

  if (isLoading) {
    return (
      <div className="flex bg-background text-foreground min-h-screen">
        <Navbar modes="home" isVertical={true} isAccordion={true} />
        <div className="flex-1 p-6 pl-[72px] sm:pl-20 md:pl-6">
          <div className="max-w-3xl mx-auto">
            <Card className="p-6">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="ml-3 text-muted-foreground">
                  Loading messages...
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!currentChannel) {
    return (
      <div className="flex bg-background text-foreground min-h-screen">
        <Navbar modes="home" isVertical={true} isAccordion={true} />
        <div className="flex-1 p-6 pl-[72px] sm:pl-20 md:pl-6">
          <div className="max-w-3xl mx-auto">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Channel Not Found</AlertTitle>
              <AlertDescription>
                The channel you're looking for doesn't exist or you don't have
                access to it.
              </AlertDescription>
            </Alert>
            <Button
              onClick={() => navigate("/home")}
              className="mt-6 bg-gradient-to-r from-primary/80 to-primary hover:opacity-90 transition-opacity"
            >
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-background text-foreground min-h-screen">
      <Navbar modes="home" isVertical={true} isAccordion={true} />

      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Channel Header */}
        <div className="h-14 md:h-20 border-b border-border flex items-center justify-center px-6 bg-background/50 shrink-0">
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-xl md:text-3xl font-bold">
              <span className="bg-gradient-to-r from-primary/60 to-primary text-transparent bg-clip-text">
                {currentChannel?.name || "Channel"}
              </span>
            </h1>
            <Badge
              variant="outline"
              className="bg-primary/5 text-primary border-primary/20"
            >
              <Users className="w-4 h-4 mr-1" />
              {currentChannel.members?.length || 0} Members
            </Badge>
          </div>
        </div>

        {showError && (
          <Alert variant="destructive" className="mx-6 mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              {errorMessage}
              <button
                onClick={() => setShowError(false)}
                className="rounded-full p-1 hover:bg-destructive/10"
              >
                <X className="h-4 w-4" />
              </button>
            </AlertDescription>
          </Alert>
        )}

        {/* Content Container */}
        <div className="flex-1 flex justify-center overflow-hidden">
          <div className="w-full max-w-3xl px-4 py-6 flex flex-col">
            {/* Chat Container */}
            <Card className="flex-1 flex flex-col overflow-hidden border-primary/20">
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
                          <Avatar className="w-8 h-8 shrink-0 mt-1 border border-primary/20">
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
                                  ? "bg-primary/10 border border-primary/20 rounded-l-lg rounded-br-lg"
                                  : "bg-accent/50 rounded-r-lg rounded-bl-lg"
                              } px-3 py-2`}
                            >
                              {/* Message Text */}
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
                    <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground gap-2">
                      <MessageCircle className="h-8 w-8 text-primary/60" />
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 bg-accent/30 border-t border-border">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 bg-background/50 border-primary/20"
                  />
                  <Button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-gradient-to-r from-primary/80 to-primary hover:opacity-90 transition-opacity"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
