# IoT‑AQI Dashboard

  

A full‑stack **IoT Air‑Quality Index (AQI) Monitoring System** that streams sensor data from an ESP32‑based edge device to a cloud backend and renders an interactive, mobile‑first dashboard built with **Next 15**, **TypeScript**, **Tailwind CSS**, **Radix UI**, and **Recharts**.

> Live demo → [https://iotaqi353.netlify.app](https://iotaqi353.netlify.app)

---

## ✨ Key Features

| Layer        | Highlights                                                                    |
| ------------ | ----------------------------------------------------------------------------- |
| **Edge**     | ESP32 + MQ‑3, MQ‑135, DHT‑11 sensors · Wi‑Fi MQTT push · On‑board calibration |
| **Cloud**    | ThingSpeak / Firebase Realtime DB (swappable) · REST + WebSocket API          |
| **Web**      | Next .js App Router · Tailwind CSS + Radix primitives · Dark‑mode support     |
| **Data Viz** | Recharts area + bar graphs · real‑time spark‑lines · AQI colour coding        |
| **CI/CD**    | GitHub → Netlify deploy preview & production · Node 18 runtime                |

---

## 🏗 Architecture Diagram

```
[Sensors] → ESP32 MQTT → [Cloud DB] ←→ Next API Route → React Charts
```

---

## 🚀 Quick Start

```bash
# 1 Clone repository
$ git clone https://github.com/dipen353/IoT-AQI-Clean.git && cd IoT-AQI-Clean

# 2 Install deps (Node ≥18)
$ npm install

# 3 Create .env.local and configure keys
NEXT_PUBLIC_API_URL=https://api.thingspeak.com/channels/XXXX/fields/1.json

# 4 Run dev server
$ npm run dev
```

Access [http://localhost:3000](http://localhost:3000).

---

## ⚙️ Configuration

| Variable              | Description                                   |
| --------------------- | --------------------------------------------- |
| `NEXT_PUBLIC_API_URL` | Endpoint that returns JSON formatted AQI data |
| `NODE_VERSION`        | Locked to **18.20.8** on Netlify              |

---

## 📦 Tech Stack

* **Frontend:** Next 15 · React 19 · TypeScript · Tailwind CSS · Radix UI · Framer Motion
* **Charts:** Recharts
* **Backend (optional):** ThingSpeak / Firebase Realtime DB
* **Edge Device:** ESP32 WROOM‑32 · MQ‑3, MQ‑135 (air quality) · DHT‑11 (temp & RH)
* **CI/CD:** GitHub Actions → Netlify

---

## 🧪 Testing

```bash
npm run lint   # ESLint + TypeScript strict mode
npm run build  # Production build – will fail on type errors
```

---

## 🛠 Roadmap

*

---

## 🤝 Contributing

1. Fork the repo & create your branch (`git checkout -b feature/foo`)
2. Commit your changes (`git commit -am 'feat: add foo'`)
3. Push and open a PR against **main**

All contributions, big or small, are welcome!

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for details.

---

> © 2025 Dipen Reddy – Built for academic and hobby IoT experimentation.
