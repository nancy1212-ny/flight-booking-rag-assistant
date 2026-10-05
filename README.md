# RAG AI Tutor

> Drop a PDF, ask questions, get answers grounded in the document — with source passages highlighted and page citations you can click.

**Stack:** React 19 + Vite 7 + Tailwind CSS v4 + shadcn-style UI | FastAPI | FAISS | local embeddings (fastembed) | Ollama / Gemini / OpenRouter

---

## Table of Contents

* [Architecture Overview](#architecture-overview)
* [Getting Started](#getting-started)
* [Switch the AI Provider](#switch-the-ai-provider)
* [Project Structure](#project-structure)
* [Detailed Code Walkthrough](#detailed-code-walkthrough)

  * [Backend](#backend)

    * [config.py — Configuration](#configpy--configuration)
    * [llm.py — LLM Abstraction](#llmpy--llm-abstraction)
    * [rag.py — The RAG Pipeline](#ragpy--the-rag-pipeline)
    * [main.py — FastAPI Endpoints](#mainpy--fastapi-endpoints)
  * [Frontend](#frontend)

    * [api.js — HTTP Client](#apijs--http-client)
    * [App.jsx — Root Layout](#appjsx--root-layout)
    * [UploadPanel.jsx — PDF Upload](#uploadpaneljsx--pdf-upload)
    * [Chat.jsx — Chat Interface](#chatjsx--chat-interface)
    * [UI Components — Badge, Button, Card, Input](#ui-components)
* [Complete Request Lifecycle](#complete-request-lifecycle)
* [RAG Pipeline Deep Dive](#rag-pipeline-deep-dive)
* [Tuning Knobs](#tuning-knobs)
* [Seminar Kit](#seminar-kit)
* [Known Limits & Discussion Points](#known-limits--discussion-points)

---

## Architecture Overview

```text
┌──────────────────────┐         ┌──────────────────────────────────────────┐
│     FRONTEND         │         │                BACKEND                   │
│  (React + Vite)      │         │             (FastAPI)                   │
│                      │         │                                          │
│  ┌────────────────┐  │  Vite   │  ┌──────────┐  ┌───────┐  ┌─────────┐  │
│  │  UploadPanel   │──┼─proxy──▶│  │ /api/    │  │ rag.py│  │ llm.py  │  │
│  │  (PDF upload)  │  │  /api   │  │ upload   │──│       │  │         │  │
│  └────────────────┘  │         │  │ health   │  │ PDF   │  │ OpenAI  │  │
│                      │         │  │ search   │  │ chunk │  │ compat  │  │
│  ┌────────────────┐  │         │  │ ask      │  │ embed │  │ client  │  │
│  │      Chat      │──┼─proxy──▶│  └──────────┘  │ index │  └─────────┘  │
│  │  (Q&A + cites) │  │         │       │        │ query │       │        │
│  └────────────────┘  │         │       ▼        └───────┘       ▼        │
│                      │         │  In-memory       FAISS     Ollama /     │
│  ┌────────────────┐  │         │  doc store       index     Gemini /     │
│  │    Skeleton    │  │         │  (DOCS dict)              OpenRouter    │
│  │     Loader     │  │         │                                          │
│  └────────────────┘  │         └──────────────────────────────────────────┘
└──────────────────────┘
```

**Data Flow (High Level):**

1. User drops a PDF → frontend `POST /api/upload` → backend reads it, chunks it, embeds & indexes chunks in FAISS.
2. User asks a question → frontend `POST /api/ask` → backend embeds the question, FAISS finds top-k similar chunks, builds a prompt, sends it to the LLM, returns the answer + source passages.
3. Frontend displays the answer with clickable page citation badges that expand to show the relevant source passages.

---

## Getting Started

### Prerequisites

* **Python 3.10+** with `pip`
* **Node.js 18+** with `npm`
* **One LLM backend** (see [Switch the AI Provider](#switch-the-ai-provider))

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

Swagger UI at `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`

---

## Switch the AI Provider

Edit `backend/.env`, restart uvicorn. The badge in the sidebar shows what's active.

| Provider       | `.env`                                                                |
| -------------- | --------------------------------------------------------------------- |
| Ollama (local) | `LLM_PROVIDER=ollama`, then `ollama pull llama3.2`                    |
| Gemini free    | `LLM_PROVIDER=gemini` + `GEMINI_API_KEY`                              |
| OpenRouter     | `LLM_PROVIDER=openrouter` + `OPENROUTER_API_KEY` (use `:free` models) |

Embeddings **always run locally** using `fastembed` (BAAI/bge-small-en-v1.5, ~130 MB, downloads once on first upload), so no API key is needed for indexing.

---

## Project Structure

```text
rag-tutor/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py
│   │   ├── llm.py
│   │   ├── main.py
│   │   └── rag.py
│   ├── .env.example
│   ├── .env
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   ├── badge.jsx
│   │   │   │   ├── button.jsx
│   │   │   │   ├── card.jsx
│   │   │   │   └── input.jsx
│   │   │   ├── Chat.jsx
│   │   │   └── UploadPanel.jsx
│   │   ├── lib/
│   │   │   ├── api.js
│   │   │   └── utils.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── tools/
│   └── make_starter.py
│
└── README.md
```

---

## Detailed Code Walkthrough

### Backend

#### `config.py` — Configuration

Loads environment variables from `.env`, selects the configured LLM provider, and defines RAG settings such as chunk size, overlap, and top-k retrieval.

#### `llm.py` — LLM Abstraction

Provides a simple interface for communicating with the configured LLM provider through an OpenAI-compatible API.

#### `rag.py` — The RAG Pipeline

```text
PDF → pages → chunks → embeddings → FAISS index → retrieve top-k → build prompt → LLM
```

The pipeline:

1. Extracts text from the PDF.
2. Splits text into overlapping chunks.
3. Generates embeddings using `fastembed`.
4. Stores embeddings in a FAISS index.
5. Retrieves the most relevant chunks for a question.
6. Builds a context-aware prompt.
7. Sends the context and question to the configured LLM.

#### `main.py` — FastAPI Endpoints

| Method | Path          | Purpose                      |
| ------ | ------------- | ---------------------------- |
| `GET`  | `/api/health` | Backend and LLM health check |
| `POST` | `/api/upload` | Upload and index a PDF       |
| `POST` | `/api/search` | Retrieve relevant passages   |
| `POST` | `/api/ask`    | Full RAG question answering  |

---

### Frontend

#### `api.js` — HTTP Client

Handles communication between the React frontend and FastAPI backend.

#### `App.jsx` — Root Layout

Provides the main application layout with the PDF upload sidebar and chat interface.

#### `UploadPanel.jsx` — PDF Upload

Provides drag-and-drop and file-picker functionality for uploading PDF documents.

#### `Chat.jsx` — Chat Interface

Handles user questions, loading states, answers, source citations, and retrieved passages.

---

## Complete Request Lifecycle

```text
User Question
     ↓
React Chat Interface
     ↓
POST /api/ask
     ↓
FastAPI Backend
     ↓
Embed Question
     ↓
FAISS Similarity Search
     ↓
Retrieve Relevant Chunks
     ↓
Build Context + Question
     ↓
LLM
     ↓
Answer + Sources
     ↓
React UI
     ↓
Answer + Page Citations
```

---

## RAG Pipeline Deep Dive

### What is RAG?

**Retrieval-Augmented Generation (RAG)** grounds LLM answers in information retrieved from a specific document.

Instead of relying only on the LLM's training data:

1. **Retrieve** relevant passages from the uploaded document.
2. **Augment** the prompt with those passages.
3. **Generate** an answer based on the retrieved context.

### Pipeline Steps

```text
PDF
 ↓
Text Extraction
 ↓
Page Splitting
 ↓
Chunking
 ↓
Embeddings
 ↓
FAISS Index
 ↓
Question Embedding
 ↓
Similarity Search
 ↓
Top-k Relevant Chunks
 ↓
Prompt Construction
 ↓
LLM
 ↓
Answer + Sources
```

### Why These Choices?

| Decision                     | Reason                                                                       |
| ---------------------------- | ---------------------------------------------------------------------------- |
| **fastembed**                | Runs locally and does not require an API key for embeddings.                 |
| **FAISS IndexFlatIP**        | Provides exact nearest-neighbour search using inner product.                 |
| **Character-based chunking** | Simple and predictable for a basic RAG pipeline.                             |
| **Chunk overlap**            | Helps preserve context across chunk boundaries.                              |
| **OpenAI-compatible API**    | Allows switching between supported LLM providers with configuration changes. |

---

## Tuning Knobs

Edit these values in `backend/.env` and restart the server.

| Variable        | Default | Effect                     |
| --------------- | ------: | -------------------------- |
| `CHUNK_SIZE`    |     800 | Characters per chunk       |
| `CHUNK_OVERLAP` |     150 | Overlap between chunks     |
| `TOP_K`         |       4 | Number of chunks retrieved |

### Experiments

* Try a smaller `CHUNK_SIZE` for more precise retrieval.
* Try a larger `CHUNK_SIZE` for more context.
* Change `TOP_K` to control the number of retrieved passages.
* Ask a question that is not covered by the PDF.
* Try different LLM providers.

---

## Seminar Kit

```bash
python tools/make_starter.py
```

The tool generates a starter project for students to practice implementing the RAG pipeline.

| Step | File                      | Task                     |
| ---- | ------------------------- | ------------------------ |
| 1    | `rag.py`                  | Chunk document pages     |
| 2    | `rag.py`                  | Build FAISS index        |
| 3    | `rag.py`                  | Retrieve relevant chunks |
| 4    | `rag.py`                  | Build the LLM prompt     |
| 5    | `frontend/src/lib/api.js` | Call `/api/ask`          |

---

## Known Limits & Discussion Points

| Limitation                   | Possible Fix                                                   |
| ---------------------------- | -------------------------------------------------------------- |
| **In-memory store**          | Add SQLite, Redis, or another persistent database.             |
| **No OCR**                   | Integrate an OCR system for scanned PDFs.                      |
| **Vague questions**          | Add document summarization functionality.                      |
| **Character-based chunking** | Use sentence-aware or semantic chunking.                       |
| **No conversation memory**   | Store message history and include relevant history in prompts. |
| **Single document**          | Support multiple documents and merged indexes.                 |
