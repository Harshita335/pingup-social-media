# 🚀 PingUp - Advanced Social Media Platform

PingUp is a modern **full-stack social media web application** built using the **MERN Stack (MongoDB, Express.js, React.js, Node.js)**.

PingUp allows users to connect with others, share posts, schedule stories, send and receive payments, get notifications, chat in real-time, and customize their experience with themes and profile settings.

The goal of this project is to create a **modern, scalable, and feature-rich social media platform**.

---

# 🌐 Project Overview

PingUp combines traditional social media functionality with modern features such as **story scheduling, payments, notifications, and theme customization.**

Users can:

• Create and manage profiles
• Share posts and stories
• Schedule stories in advance
• Send and receive payments
• Receive real-time notifications
• Chat with other users
• Customize themes and profile settings

---

# 🛠 Tech Stack

## Frontend

• React.js
• Tailwind CSS
• Redux Toolkit
• React Router

## Backend

• Node.js
• Express.js

## Database

• MongoDB

## Real-Time Communication

• Socket.IO

## Authentication

• JWT (JSON Web Tokens)

## Media Storage

• Cloudinary

---

# ✨ Core Features

## 🔐 Authentication System

• Secure User Registration
• Login / Logout System
• JWT Authentication
• Password Encryption

---

# 👤 User Profile Management

• Update Profile Information
• Change Profile Picture
• Add Bio and Personal Details
• View Other User Profiles

---

# 📸 Post System

• Create Posts
• Upload Images
• Like / Unlike Posts
• Comment on Posts
• Delete Posts

---

# 📖 Story System

• Upload Stories
• View Stories
• Story Expiration System

---

# ⏳ Pre-Scheduled Story Feature

Users can schedule their stories to be posted automatically in the future.

Examples:

• Post story after 1 hour
• Post story after 3 hours
• Post story after 12 hours
• Post story after 24 hours

This feature allows users to **plan content in advance**.

---

# ⏱ Story Duration Control

Users can choose **how long their story remains visible**.

Available options:

• 6 Hours
• 12 Hours
• 24 Hours
• Custom Duration

Once the selected time is completed, the story **automatically disappears.**

---

# 💬 Real-Time Chat System

• Private Messaging
• Instant Message Delivery
• Online / Offline Status

Powered by **Socket.IO** for real-time communication.

---

# 💳 Payment System

PingUp includes a built-in **user-to-user payment feature**.

Users can:

• Send Money to Other Users
• Receive Payments
• View Payment Confirmation

This feature is useful for **creators, collaborations, and digital support.**

---

# 💰 Payment Receive Notification

Whenever a user receives a payment:

• Instant notification appears
• Payment confirmation is displayed
• Transaction alert is generated

This ensures users never miss any payment activity.

---

# 🔔 Notification System

Users receive notifications for:

• New Followers
• Likes on Posts
• Comments on Posts
• New Messages
• Payment Received

---

# 🎨 Theme Customization

Users can customize the application theme.

Available options:

• Light Mode
• Dark Mode

This helps improve **user comfort and accessibility.**

---

# ⚙️ Account Settings

Users can manage their account settings:

• Update Profile
• Change Password
• Change Theme
• Manage Notifications

---

# 📂 Project Structure

pingup-social-media

backend
├ controllers
├ middleware
├ models
├ routes
├ config

frontend
├ components
├ pages
├ redux
├ utils

server.js

---

# ⚙️ Installation & Setup

## 1️⃣ Clone Repository

git clone https://github.com/Harshita335/pingup-social-media.git

Move to project folder

cd pingup-social-media

---

# 2️⃣ Install Backend Dependencies

npm install

Create `.env` file

MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
PORT=5000
CLOUDINARY_KEY=your_cloudinary_key

Run backend

npm run dev

---

# 3️⃣ Setup Frontend

cd frontend

Install dependencies

npm install

Run frontend

npm start

---

# 🔐 Environment Variables

Create `.env` file

Example:

MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
CLOUDINARY_API_KEY=your_key
SENDGRID_API_KEY=your_key

---

# 🚀 Deployment

Frontend → Vercel

Backend → Render / Vercel

Database → MongoDB Atlas

---

# 📸 Screenshots

You can add screenshots of:

• Home Feed
• User Profile
• Story Section
• Payment Interface
• Notifications Panel

---

# 🔮 Future Improvements

• Video Stories
• Group Chat
• Push Notifications
• Mobile App Version

---

# 👩‍💻 Author

Harshita Shukla

GitHub
https://github.com/Harshita335

---

# ⭐ Support

If you like this project, please give it a **star ⭐ on GitHub.**
