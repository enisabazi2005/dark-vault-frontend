import { useState, useEffect, useRef } from "react";
import { useStore } from "../../Store/store";
import api from "../../api";
import { STORAGE_URL } from "../../api";
import "../Bot/Bot.css";
import vaultbot from "../../assets/images/vaultbot.png"

const Bot = () => {
    const { myProfile } = useStore(); 
    const [isClicked, setIsClicked] = useState(false);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const defaultBlankPhotoUrl = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const faqQuestions = [
        "Who is creator of Dark Vault?",
        "Can I reset password?",
        "Can we create groups?",
        "Is everything free?",
        "Is everything encrypted?"
    ];

    const handleClick = () => {
        setIsClicked(prev => !prev);
        if (!messages.length) {
            setMessages([
                {
                    type: "bot",
                    text: "Hello! Please select one of the frequently asked questions below:"
                }
            ]);
        }
    };

    const handleFaqClick = async (question) => {
        setMessages(prev => [...prev, {
            type: "user",
            text: question
        }]);
        
        setLoading(true);
        
        try {
            const response = await api.post(`/chatbot`, {
                message: question
            });
            
            setMessages(prev => [...prev, {
                type: "bot",
                text: response.data.reply
            }]);
        } catch (error) {
            console.error("Error answering the bot:", error);
            setMessages(prev => [...prev, {
                type: "bot",
                text: "Sorry, I couldn't process your question. Please try again later."
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bot-container">
            {isClicked && (
                <div className="chat-body">
                    <div className="chat-header">
                        <h3>Vault Chatbot</h3>
                        <button className="close-button-bot" onClick={handleClick}>×</button>
                    </div>
                    
                    <div className="chat-messages-bot">
                        {messages.map((message, index) => (
                            <div key={index} className={`message-bot-item ${message.type}-message-item`}>
                                {message.type === "bot" && (
                                    <div className="avatar">
                                        <img src={vaultbot} alt="Bot" />
                                    </div>
                                )}
                                <div className="text-bubble">
                                    <p>{message.text}</p>
                                </div>
                                {message.type === "user" && (
                                    <div className="avatar">
                                        <img 
                                            src={myProfile?.picture === null || myProfile?.picture === ''
                                                ? defaultBlankPhotoUrl
                                                : `${STORAGE_URL}/${myProfile.picture}`
                                            } 
                                            alt="User" 
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                        
                        {loading && (
                            <div className="message-bot-item bot-message-item">
                                <div className="avatar">
                                    <img src={vaultbot} alt="Bot" />
                                </div>
                                <div className="text-bubble typing">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        )}
                        
                        <div ref={messagesEndRef} />
                    </div>
                    
                    <div className="faq-options">
                        {faqQuestions.map((question, index) => (
                            <button 
                                key={index} 
                                className="faq-button"
                                onClick={() => handleFaqClick(question)}
                            >
                                {question}
                            </button>
                        ))}
                    </div>
                </div>
            )}
            <div className="bot-button">
                <button onClick={handleClick}>
                    FAQ
                </button>
            </div>
        </div>
    );
};

export default Bot;