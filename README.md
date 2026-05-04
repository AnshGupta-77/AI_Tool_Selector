# ToolFind AI — AI Tool Discovery Engine

Find the perfect AI tool for any task. Describe what you need, and ToolFind searches a curated database of 150+ tools plus the live web to recommend the best matches — with AI-generated explanations and side-by-side comparisons.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS |
| Backend | Python FastAPI |
| AI Engine | Google Gemini 1.5 Flash (free tier) |
| Live Search | DuckDuckGo (no API key needed) |
| Curated DB | JSON (150+ tools, hand-curated) |

---

## Quick Start

### 1. Get a Free Gemini API Key
Go to → https://aistudio.google.com/app/apikey
Create a key (free, no credit card needed).

### 2. Set Up the Backend

```bash
# Open VS Code terminal (Ctrl+` or Cmd+`)
# Navigate to backend folder
cd "AI Selector Tool/backend"

# Install dependencies
pip install -r requirements.txt

# Create your .env file
cp .env.example .env
# Open .env and paste your Gemini API key

# Start the API server
uvicorn main:app --reload --port 8000
```

The API runs at: http://localhost:8000
API docs at: http://localhost:8000/docs

### 3. Set Up the Frontend

```bash
# Open a NEW terminal tab
cd "AI Selector Tool/frontend"

# Install Node dependencies
npm install

# Start the dev server
npm run dev
```

The app runs at: http://localhost:5173

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| POST | `/api/search` | Main AI search — returns ranked tools + comparison |
| GET | `/api/tools` | Browse all curated tools with filters |
| GET | `/api/tools/{id}` | Get single tool detail |
| GET | `/api/categories` | List all categories with counts |
| POST | `/api/compare` | Compare 2-4 tools side by side |
| GET | `/api/suggest` | Autocomplete suggestions |

---

## Project Structure

```
AI Selector Tool/
├── backend/
│   ├── main.py           # FastAPI app + all routes
│   ├── ai_engine.py      # Gemini AI recommendations
│   ├── search.py         # DuckDuckGo live search
│   ├── models.py         # Pydantic request/response models
│   ├── tools_db.json     # 150+ curated AI tools
│   ├── requirements.txt
│   └── .env              # Your API key goes here
│
└── frontend/
    ├── src/
    │   ├── App.tsx
    │   ├── components/
    │   │   ├── Navbar.tsx
    │   │   ├── SearchBar.tsx
    │   │   ├── FilterSidebar.tsx
    │   │   ├── ResultCard.tsx
    │   │   ├── ComparisonTable.tsx
    │   │   └── LoadingState.tsx
    │   ├── pages/
    │   │   ├── HomePage.tsx
    │   │   ├── ResultsPage.tsx
    │   │   ├── BrowsePage.tsx
    │   │   └── ToolDetailPage.tsx
    │   ├── hooks/useToolSearch.ts
    │   ├── lib/api.ts
    │   └── types/index.ts
    └── package.json
```

---

## Notes

- **Without Gemini API key**: The tool still works using keyword-based matching from the curated database. Add a key for AI-powered explanations and smarter ranking.
- **Rate limits**: Gemini free tier allows 60 requests/minute — plenty for personal use.
- **Live web search**: Uses DuckDuckGo with no API key required. Results supplement the curated DB.
