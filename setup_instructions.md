# AI Smart House Price Project - Setup & Requirements

This document outlines all system requirements, software dependencies, and step-by-step instructions needed to set up, install, and run the project from scratch.

## 1. System Requirements

To ensure compatibility, please ensure your system has the following core runtimes installed. The project has been verified with these specific versions:

*   **Node.js**: `v22.20.0` (or compatible LTS version)
*   **npm**: `10.9.3` (comes bundled with Node.js)
*   **Python**: `3.12.10` (or compatible Python 3.10+ version)

---

## 2. Frontend Dependencies (React + Vite)

The frontend is a single-page application built with React and Vite. The dependencies are defined in `frontend/package.json`.

**Core Packages:**
*   `react` (`^18.3.1`) - UI library
*   `react-dom` (`^18.3.1`) - DOM bindings for React
*   `react-router-dom` (`^6.28.0`) - Application routing
*   `axios` (`^1.7.9`) - HTTP client for API requests
*   `recharts` (`^2.15.0`) - Charting and data visualization

**Development Packages:**
*   `vite` (`^6.0.3`) - Build tool and development server
*   `@vitejs/plugin-react` (`^4.3.4`) - React support for Vite

---

## 3. Backend Dependencies (Python FastAPI)

The backend is a Python application using FastAPI and scikit-learn for AI price prediction. The dependencies are defined in `backend/requirements.txt`.

**Web Framework & Server:**
*   `fastapi` (`==0.115.6`) - Web framework for building APIs
*   `uvicorn[standard]` (`==0.32.1`) - ASGI web server implementation
*   `python-multipart` (`==0.0.17`) - Form data parsing
*   `pydantic` (`==2.10.3`) - Data validation
*   `pydantic-settings` (`==2.6.1`) - Environment management

**Security & Authentication:**
*   `python-jose[cryptography]` (`==3.3.0`) - JWT token generation/validation
*   `passlib[bcrypt]` (`==1.7.4`) - Password hashing algorithm wrapper
*   `bcrypt` (`==4.2.1`) - Cryptographic hashing
*   `slowapi` (`==0.1.9`) - API rate-limiting

**Database & Validation:**
*   `sqlalchemy` (`==2.0.36`) - Object Relational Mapper (ORM) for SQLite
*   `email-validator` (`==2.2.0`) - Email format validation

**AI & Machine Learning:**
*   `scikit-learn` (`==1.5.2`) - Machine learning library (Random Forest model)
*   `numpy` (`==2.1.3`) - Numerical computing
*   `joblib` (`==1.4.2`) - Serialization for loading the AI model

---

## 4. Step-by-Step Installation & Run Guide

### Step A: Start the Backend Server
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. *(Optional but recommended)* Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On Mac/Linux:
   source venv/bin/activate
   ```
3. Install the required Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the FastAPI server using Uvicorn:
   ```bash
   uvicorn main:app --reload
   ```
   *The backend will now be running at `http://127.0.0.1:8000`.*

### Step B: Start the Frontend Server
1. Open a **new** separate terminal window and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the required Node dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend UI will now be available at `http://localhost:5173`.*

---
**You are all set!** Open the frontend URL in your browser to interact with the full-stack AI smart house price application.
