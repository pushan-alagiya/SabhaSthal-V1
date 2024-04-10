class PeerService {
  constructor(socket) {
    //Using Google server to connect peer to peer connection
    if (!this.peer) {
      this.peer = new RTCPeerConnection({
        iceServers: [
          {
            urls: ["stun:stun.l.google.com:19302"],
          },
        ],
      });
    }
  }

  // createOffer
  async getAnswer(offer) {
    if (this.peer) {
      await this.peer.setRemoteDescription(offer);
      const ans = await this.peer.createAnswer();
      await this.peer.setLocalDescription(new RTCSessionDescription(ans));
      return ans;
    }
  }

  async endCall(remoteSocketId) {
    try {
      const offer = await this.getOffer();
      this.socket.emit("call:end", { to: remoteSocketId, offer });
    } catch (error) {
      throw new Error("Error ending call: " + error.message);
    }
  }

  // give to answer for device description
  async setLocalDescription(ans) {
    if (this.peer) {
      await this.peer.setRemoteDescription(new RTCSessionDescription(ans));
    }
  }

  async getOffer() {
    if (this.peer) {
      const offer = await this.peer.createOffer();
      await this.peer.setLocalDescription(new RTCSessionDescription(offer));
      return offer;
    }
  }
}

export default new PeerService();
