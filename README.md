# Direct Messenger

Direct Messenger is a full-stack real-time one-to-one messaging application built using Django and React.

The application allows registered users to communicate with each other through direct conversations. It provides authentication, user listing, chat creation, message history, real-time messaging, unread message tracking, typing status, and real-time notifications.

---

## Project Overview

The project consists of two main parts:

- **Backend:** Django REST Framework with Django Channels
- **Frontend:** React.js with Vite

The REST API is used for authentication, users, chats, and message-related operations.

Django Channels and WebSockets are used to provide real-time communication between users.

---

## Features

### Authentication

- User registration
- User login
- JWT-based authentication
- Password validation
- Protected API requests

### Users

- Display registered users
- Select a user to start a direct conversation
- User-specific chat conversations

### Direct Messaging

- One-to-one conversations
- Send messages to another user
- Receive messages in real time
- Store messages in the database
- Retrieve previous message history

### Real-Time Communication

- WebSocket-based real-time messaging
- Django Channels
- Real-time message delivery
- Typing status
- Real-time chat updates

### Read and Unread Messages

- Track message read/unread status
- Display unread message counts
- Mark messages as read when the conversation is opened

### Notifications

- Real-time message notifications
- Unread message indicators

---

# Technologies Used

## Backend

- Python
- Django
- Django REST Framework
- Django Channels
- Django Simple JWT
- SQLite
- WebSockets

## Frontend

- React.js
- Vite
- Axios
- React Router
- Tailwind CSS

## Development Tools

- Visual Studio Code
- Git
- GitHub
- npm
- Python Virtual Environment

---

# Project Structure

```text
DirectMessenger/
│
├── README.md
│
├── backend/
│   │
│   ├── directmessenger/
│   │   ├── __init__.py
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── asgi.py
│   │   └── wsgi.py
│   │
│   ├── messenger/
│   │   ├── migrations/
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── consumers.py
│   │   ├── models.py
│   │   ├── routing.py
│   │   ├── serializers.py
│   │   ├── tests.py
│   │   ├── urls.py
│   │   └── views.py
│   │
│   ├── db.sqlite3
│   └── manage.py
│
├── env/
│
└── frontend/
    ├── node_modules/
    ├── public/
    ├── src/
    ├── .gitignore
    ├── package.json
    └── ...