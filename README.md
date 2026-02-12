<img width="936" height="661" alt="image" src="https://github.com/user-attachments/assets/e9aa7ad3-6ddc-489e-a614-3b98728bb180" />


# The Living Blueprint
> **ARCHITECTURAL_DRIFT_ELIMINATOR_V1**

![Status](https://img.shields.io/badge/STATUS-NO_DRIFT_POLICY_ENFORCED-black?style=for-the-badge)
![Tech](https://img.shields.io/badge/TECH-REACT_%7C_GEMINI_LIVE_API_%7C_TAILWIND-black?style=for-the-badge)

**The Living Blueprint** is a Brutalist-style architectural audit tool that eliminates "Architectural Drift" by bridging the gap between static design documents and dynamic development discussions.

It utilizes a dual-stack AI architecture to ingest visual system diagrams and cross-reference them against real-time voice and text proposals, acting as an automated "Senior Architect" in the room.

---

## 🔒 Security & Privacy (Cyber Risk Mitigation)

*   **API Key Management:** This application uses `process.env.API_KEY` to inject credentials. **NEVER** hardcode your API key directly into the source code.
*   **Git Hygiene:** A `.gitignore` file is included to prevent the `.env` file from being committed to version control. Ensure you double-check this before pushing code.
*   **Client-Side Disclosure:** As a client-side React application, the API key is theoretically accessible to the browser session. For high-security production environments, it is recommended to proxy these calls through a secure backend middleware.

---

## 🏗 System Architecture

The application operates on two distinct AI layers:

1.  **L1 Sensory Input (Visual Cortex):**
    *   **Model:** `gemini-3-flash-preview`
    *   **Function:** OCRs and analyzes uploaded system diagrams (PNG/JPG). It extracts microservices, databases, security boundaries, and strict constraints (e.g., ACID compliance, mTLS requirements) into system memory.

2.  **L2 Real-Time Alignment (Auditory Cortex):**
    *   **Model:** `gemini-2.5-flash-native-audio-preview-12-2025`
    *   **Function:** Establishes a low-latency, bidirectional WebSocket connection. It listens to voice conversations or reads text commands, validating feature intents against the extracted blueprint.

---

## ⚡ Features

### 1. Visual Ingestion Engine
Drag and drop your architectural diagrams into the **Drop Zone**. The system analyzes the image and establishes a "Source of Truth" summary.

### 2. Live Audio Audit
Click **INITIATE_SESSION** to start the Gemini Live connection. Speak naturally about feature proposals.
*   *Example:* "We want to add a direct HTTP call from the Transaction Service to the Notification Service."
*   *Result:* The system will interrupt (audio & visual) to flag the violation of the Event-Driven Architecture constraint.

### 3. Drift Console
A real-time log of all detected violations.
*   **Severity Levels:** LOW, MEDIUM, HIGH, CRITICAL.
*   **Remediation:** Provides specific technical advice to fix the drift.
*   **Export:** Download audit logs as JSON.

### 4. Manual Override
A command-line interface for typing specific technical queries if voice is not feasible.

---

## 🛠 Tech Stack

*   **Frontend:** React 19, TypeScript, Vite
*   **Styling:** Tailwind CSS (Custom Brutalist Theme)
*   **AI SDK:** `@google/genai`
*   **Icons:** Lucide React
*   **State Management:** React Hooks & Local Storage persistence

---

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+)
*   A Google Cloud Project with the **Gemini API** enabled.
*   An API Key with access to `gemini-2.5-flash-native-audio` and `gemini-3-flash`.

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-username/the-living-blueprint.git
    cd the-living-blueprint
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment**
    Create a `.env` file in the root directory. **DO NOT COMMIT THIS FILE.**
    ```env
    API_KEY=your_google_genai_api_key_here
    ```

4.  **Run Application**
    ```bash
    npm start
    ```

---

## 📜 System Manifesto

### 01_COMPUTE_ENGINE
Employs Multi-Threaded Web Workers for non-blocking real-time audio analysis and a persistent WebSocket (WSS) layer for bidirectional neural-link stability. Orchestration utilizes a dual-stack architecture: Gemini 2.5 Flash (Native Audio) for L1 sensory input and Gemini 3 Flash for L2 architectural reasoning.

### 02_EDGE_CASE_HANDLING
Standard security protocols in hardened browser environments (Brave/Chrome) may intercept the WSS handshake or restrict Worker instantiation, prioritizing client-side privacy over real-time stream stability.

### 03_MANUAL_OVERRIDE
To bypass localized security conflicts and access full-bandwidth alignment, initialize the session via a Chrome Guest Profile or Firefox.

---

## ⚠️ Compliance

This tool strictly adheres to the **NO_DRIFT_POLICY**. Any feature request that violates the ingested blueprint will be flagged immediately.

*   **Deployed By:** Siddharth Bellad
*   **Credentials:** Duke U
*   **Status:** SYSTEM NOMINAL
