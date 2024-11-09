![image](https://github.com/user-attachments/assets/41cbf825-944b-4d3e-9a17-ef8d8f06fedf)# SabhaSthal V1

**SabhaSthal** is a peer-to-peer video conferencing web application that enables real-time video communication and chat among users. This initial version (V1) of SabhaSthal is built with Node.js, Socket.IO, and React, using WebRTC for seamless, high-quality video streaming. The app supports video calls, direct chat, and an interactive UI for connecting users effortlessly.

![Recipe Website Screenshot](https://github.com/pushan-alagiya/SabhaSthal-V1/blob/main/Screenshot%20From%202024-11-09%2021-44-35.png?raw=true)

![Recipe Website Screenshot](https://github.com/pushan-alagiya/SabhaSthal-V1/blob/main/Screenshot%20From%202024-11-09%2021-47-59.png?raw=true)


## Features

- **Real-Time Video Conferencing**: Connect users directly via WebRTC for smooth, low-latency video and audio calls.
- **Instant Messaging**: Integrated chat function allows users to send messages during video calls.
- **Peer-to-Peer Communication**: Built using Socket.IO to manage peer-to-peer connections effectively.
- **Responsive Design**: Optimized for desktops and mobile devices, providing an adaptable user experience.

## Tech Stack

### Frontend
- **React.js**: Main framework for building the interactive UI components.
- **Socket.IO (Client)**: Facilitates real-time communication with the server for managing peer connections.
- **WebRTC**: Handles direct media (video/audio) connections between users, providing low-latency streaming.

### Backend
- **Node.js**: Server environment for handling requests and managing connections.
- **Express.js**: Lightweight framework for building the server and REST API routes.
- **Socket.IO (Server)**: Manages WebSocket connections and signaling between peers for real-time communication.

## Project Setup

### Prerequisites
- Node.js (v14+)
- npm or yarn for dependency management

### Installation

1. **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/sabhasthal.git
    cd sabhasthal
    ```

2. **Install dependencies for both frontend and backend**

    ```bash
    # Install backend dependencies
    cd server
    npm install
    
    # Install frontend dependencies
    cd ../client
    npm install
    ```

3. **Running the Application**

   Start the backend and frontend servers:

    ```bash
    # Start backend server
    cd server
    npm start

    # Start frontend
    cd ../client
    npm start
    ```

## Usage Instructions

1. **Open the Application**: Access the app by navigating to `http://localhost:3000` (default) in your web browser.
2. **Starting a Video Call**:
   - Join a room by entering the unique room code or creating a new room.
   - Once in a room, connect with other users for a live video call.
3. **Using the Chat**:
   - Open the chat panel to send and receive messages during the call.
   - Messages are displayed in real-time, enabling simultaneous text and video communication.


## Key Modules

- **WebRTC**: Manages peer-to-peer video and audio communication, handling streams and connections directly between clients.
- **Socket.IO**: Enables real-time, bidirectional communication for signaling WebRTC connections, allowing peers to connect, disconnect, and handle multiple users.

## Future Improvements

- **Screen Sharing**: Enable users to share their screen during a call for enhanced collaboration.
- **Recording**: Implement a feature for users to record meetings or sessions.
- **User Authentication**: Add authentication and authorization for secure, user-specific access.
- **File Sharing**: Allow file transfers through the chat interface during calls.
- **Enhanced UI/UX**: Additional UI enhancements and features like virtual backgrounds and video filters.
