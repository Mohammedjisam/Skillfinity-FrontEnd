import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { host } from "../../lib/APIRoutes";
import NoConversationFallback from "@/components/Chat/NoConversationFallback";
import Contacts from "@/components/Chat/Contacts";
import ChatContainer from "@/components/Chat/ChatContainer";
import { useSelector } from "react-redux";
import axiosInstance from "@/AxiosConfig";
import SideBar from "../Tutor/SideBar";
import { Menu, X, Users } from 'lucide-react';

export default function Chat() {
  const tutorData = useSelector((store) => store.tutor.tutorDatas);
  const navigate = useNavigate();
  const socket = useRef();
  const [contacts, setContacts] = useState([]);
  const [currentChat, setCurrentChat] = useState(undefined);
  const [currentUser, setCurrentUser] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [showContacts, setShowContacts] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const getCurrentUser = async () => {
    if (tutorData) {
      setCurrentUser(tutorData);
    }
  };

  const getContacts = async () => {
    if (!currentUser) return;

    if (currentUser) {
      try {
        const { data } = await axiosInstance(
          `/tutor/getStudents/${currentUser._id}`
        );
        setContacts(data);
      } catch (error) {
        console.error("Error fetching contacts:", error);
      }
    } else {
      navigate("/setAvatar");
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      await getCurrentUser();
      setLoading(false);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      socket.current = io(host, {
        transports: ["websocket"],
        auth: { userId: currentUser._id }
      });

      socket.current.on("connect", () => {
        console.log("Connected to server. Socket ID:", socket.current.id);
      });

      socket.current.on("connect_error", (err) => {
        console.error("Error during socket connection:", err);
      });
    }
  }, [currentUser]);

  useEffect(() => {
    getContacts();
  }, [currentUser]);

  const handleChatChange = (chat) => {
    setCurrentChat(chat);
    setShowContacts(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-2xl font-semibold text-gray-700 animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 transform ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:relative lg:translate-x-0 transition duration-200 ease-in-out z-30`}>
        <SideBar
          activeItem="Chat & Video"
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col w-full lg:w-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm z-20">
          <div className="px-4 sm:px-6 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 lg:hidden focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500"
                aria-label="Open sidebar"
              >
                <Menu className="h-6 w-6" />
              </button>
              <h1 className="text-xl font-semibold text-gray-800">Messages</h1>
            </div>
            <button
              onClick={() => setShowContacts(!showContacts)}
              className="p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 md:hidden focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500"
              aria-label={showContacts ? 'Show chat' : 'Show contacts'}
            >
              {showContacts ? (
                <X className="h-6 w-6" />
              ) : (
                <Users className="h-6 w-6" />
              )}
            </button>
          </div>
        </header>

        {/* Chat Area */}
        <main className="flex-1 overflow-hidden bg-gray-50">
          <div className="h-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
            <div className="h-full bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="flex h-[calc(100vh-5rem)]">
                {/* Contacts List */}
                <div
                  className={`${
                    showContacts ? 'block' : 'hidden'
                  } md:block w-full md:w-80 lg:w-96 border-r border-gray-200 bg-white`}
                >
                  <Contacts 
                    contacts={contacts} 
                    changeChat={handleChatChange}
                    className="h-full overflow-y-auto"
                  />
                </div>

                {/* Chat Container */}
                <div
                  className={`${
                    showContacts ? 'hidden' : 'block'
                  } md:block flex-1 flex flex-col bg-gray-50`}
                >
                  {currentChat === undefined ? (
                    <NoConversationFallback />
                  ) : (
                    <ChatContainer 
                      currentChat={currentChat} 
                      socket={socket}
                      className="h-full flex flex-col"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity lg:hidden z-20"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}

