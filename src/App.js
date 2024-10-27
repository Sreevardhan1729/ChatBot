import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import Prism from "prismjs";
import "prismjs/themes/prism.css";
import CodeResponse from "./CodeResponse";

const App = () => {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const textareaRef = useRef(null);

  const surpriseOptions = [
    "Which is best books for General Knowledge",
    "Recommend me some books written by Robert Kiyosaki",
    "Recomment me some books like Atomic Habits",
    "Recommand some books with same genre as ikigai",
  ];

  const surprise = () => {
    const randomValue = Math.floor(Math.random() * surpriseOptions.length);
    setValue(surpriseOptions[randomValue]);
  };

  function autoResizeInput() {
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
  }

  const getResponse = async () => {
    if (!value) {
      setError("Please enter a question");
      return;
    }
    try {
      setValue("");
      const query = "I am talking about books. "
      const final = query.concat(value)
      const options = {
        method: "POST",
        body: JSON.stringify({
          history: chatHistory,
          message: final,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      };
      const response = await fetch("http://localhost:8000/gemini", options);
      const data = await response.text();

      let formattedResponse = "";

      if (data.startsWith("**")) {
        formattedResponse = data;
      } else {
        formattedResponse = `**Bot:** ${data}`;
      }

      const formattedUserMessage = `**You:** ${value}`;

      setChatHistory((oldChatHistory) => [
        ...oldChatHistory,
        {
          role: "user",
          parts: formattedUserMessage,
        },
        {
          role: "model",
          parts: formattedResponse,
        },
      ]);
      setError("");
      textareaRef.current.style.height = "auto";
    } catch (error) {
      console.error(error);
      setError("Something went wrong. Please try again later.");
    }
  };

  const clear = () => {
    setChatHistory([]);
    setValue("");
    setError("");
    textareaRef.current.style.height = "auto";
  };

  useEffect(() => {
    Prism.highlightAll();
  }, [chatHistory]);

  return (
    <div className="app">
      <div className="search-result">
        {chatHistory.map((chatItem, index) => (
          <div key={index}>
            <div className="message">
              {chatItem.role === "user" ? (
                <div className="user-message">
                  <ReactMarkdown>{chatItem.parts}</ReactMarkdown>
                </div>
              ) : chatItem.parts.startsWith("```") ? (
                <CodeResponse code={chatItem.parts} />
              ) : (
                <div className="bot-message">
                  <ReactMarkdown>{chatItem.parts}</ReactMarkdown>
                </div>
              )}
            </div>
            {index !== chatHistory.length - 1 && <div className="message-gap" />}
          </div>
        ))}
      </div>
      <p>
        What do you want to know?
        <button className="surprise" onClick={surprise} disabled={!chatHistory}>
          Sample Questions
        </button>
      </p>
      <div className="input-container">
        <textarea
          ref={textareaRef}
          id="chat-input"
          value={value}
          placeholder="When is Christmas...?"
          onChange={(e) => {
            setValue(e.target.value);
            autoResizeInput();
          }}
        />
        {!error && <button onClick={getResponse}>Ask me</button>}
        {error && <button onClick={clear}>Clear</button>}
      </div>
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default App;
