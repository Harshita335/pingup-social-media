# Pingup MERN
Full-Stack Pingup Social Media using MERN Stack and Socket.IO

[Visit Now]() 🚀

## 🖥️ Tech Stack
**Frontend:**

![reactjs](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)&nbsp;
![react-router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)&nbsp;
![redux](https://img.shields.io/badge/Redux-593D88?style=for-the-badge&logo=redux&logoColor=white)&nbsp;
![tailwindcss](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)&nbsp;
![mui](https://img.shields.io/badge/Material--UI-0081CB?style=for-the-badge&logo=material-ui&logoColor=white)&nbsp;

**Backend:**

![nodejs](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)&nbsp;
![expressjs](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)&nbsp;
![mongodb](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)&nbsp;
![jwt](	https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)&nbsp;

**Realtime Communication:**

![socketio](https://img.shields.io/badge/Socket.io-010101?&style=for-the-badge&logo=Socket.io&logoColor=white)

**Cloud Storage:**

![aws-s3](https://img.shields.io/badge/Amazon_AWS-FF9900?style=for-the-badge&logo=amazonaws&logoColor=white)

**Cloud Storage:** [Cloudinary](https://cloudinary.com/)

**Mail Service:** [Sendgrid](https://sendgrid.com/)


## ⚙️ How to Run the Project (Setup Instructions)

Follow the steps below to get the project running locally 👇

### 1️⃣ Clone the repository
```bash
git clone https://github.com/jigar-sable/instagram-mern.git
cd pingup-mern
```
### 2️⃣ Setup Backend
```bash
npm install
```

Before running the backend, go to:
```bash
backend/config/config.env.example
```

Rename this file to:
config.env
and update it with your environment variables (like MongoDB URI, JWT secret, etc.).

Then start the backend server:
```bash
npm run dev
```

### 3️⃣ Setup Frontend
From the root directory, navigate to the frontend folder:
```bash
cd frontend
```

Install dependencies:
```bash
npm install
```

Start the frontend server:
```bash
npm start
```

Now your app should be running successfully 🎉

## 🚀 Features
**Authentication and User Management**
- ✨ Secure Login/Signup Functionality
- 🚪 Support for Email or Username-based Login
- 🔐 Seamless Profile and Password Management
- 🔄 Password Reset via Sendgrid Integration

**Content Management**
- 📜 Dynamic Infinite Scroll for Posts
- 🔍 Suggestions for User Connections
- 🔎 Intuitive Search for Users by Name or Username
- 🔗 Follow/Unfollow Capability for User Networking
- ❤️ Like/Unlike Posts with Double-Tap Feature
- 💬 Commenting on Posts for Interaction
- 📌 Save/Unsave Posts for Bookmarking
- 📤 Effortless Post-Sharing Functionality

**Messaging System**
- 🔍 User-Friendly Search for Chat Participants
- 📝 Seamless Creation of New Chats
- 💬 Real-Time Messaging Between Users
- 🕒 Status Indicators for Typing and Online Presence

**Social Features**
- 📊 Comprehensive View of Followers/Following Lists
- 👍 Post Liked By Users Tracking
- 😄 Emoji Integration via Emoji Mart

**Image Storage**
- 📷 Branch [dev-v3-cloudinary](https://github.com/jigar-sable/instagram-mern/tree/dev-v3-cloudinary): Utilizes Cloudinary for Image Storage
- ☁️ Branch [dev-v2-aws](https://github.com/jigar-sable/instagram-mern/tree/dev-v2-aws): Leverages AWS S3 for Image Storage
- 💾 Branch [dev-v1](https://github.com/jigar-sable/instagram-mern/tree/dev-v1): Relies on Local Storage Solution




