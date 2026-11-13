import React from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/vazirmatn/arabic-400.css";
import "@fontsource/vazirmatn/arabic-500.css";
import "@fontsource/vazirmatn/arabic-600.css";
import "@fontsource/vazirmatn/arabic-700.css";
import "@fontsource/vazirmatn/arabic-800.css";
import "@fontsource/vazirmatn/latin-400.css";
import "@fontsource/vazirmatn/latin-500.css";
import "@fontsource/vazirmatn/latin-600.css";
import "@fontsource/vazirmatn/latin-700.css";
import "@fontsource/vazirmatn/latin-800.css";
import "@fontsource/manrope/latin-500.css";
import "@fontsource/manrope/latin-600.css";
import "@fontsource/manrope/latin-700.css";
import "@fontsource/manrope/latin-800.css";
import "@fontsource/noto-sans-kr/korean-400.css";
import "@fontsource/noto-sans-kr/korean-700.css";
import "@flaticon/flaticon-uicons/css/regular/rounded.css";
import App from "./App.jsx";
import "./styles.css";
import "./starter.css";
import "./profile.css";
import "./quiz.css";
import "./quizPage.css";
import "./theme.css";
import "./learning.css";
import "./cardDeck.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
