import { jsx as _jsx } from "react/jsx-runtime";
// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
/* global styles */
import "@esri/calcite-components/dist/calcite/calcite.css";
import "./index.css";
/* Calcite web-component registration */
import { setAssetPath } from "@esri/calcite-components/dist/components";
import { defineCustomElements } from "@esri/calcite-components/dist/loader";
setAssetPath("https://js.arcgis.com/calcite-components/3.2.1/assets");
defineCustomElements(window);
/* selected-feature context */
import { SelectedAssetProvider } from "./hooks/useSelectedAsset";
ReactDOM.createRoot(document.getElementById("root")).render(_jsx(React.StrictMode, { children: _jsx(SelectedAssetProvider, { children: _jsx(BrowserRouter, { children: _jsx(App, {}) }) }) }));
