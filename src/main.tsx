import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"
import ServiceWorkerRegister from "./components/ServiceWorkerRegister"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
    <ServiceWorkerRegister />
  </React.StrictMode>,
)
