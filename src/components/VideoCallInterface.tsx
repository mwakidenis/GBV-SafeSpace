import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Video, VideoOff, Mic, MicOff, Phone, PhoneOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VideoCallInterfaceProps {
  conversationId: string;
  onClose: () => void;
}

const VideoCallInterface = ({ conversationId, onClose }: VideoCallInterfaceProps) => {
  const { toast } = useToast();
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>("idle");
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      endCall();
    };
  }, []);

  const startCall = async () => {
    try {
      setConnectionStatus("connecting");
      
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Create peer connection
      const configuration = {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      };
      
      const peerConnection = new RTCPeerConnection(configuration);
      peerConnectionRef.current = peerConnection;

      // Add local tracks to peer connection
      stream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, stream);
      });

      // Handle incoming tracks
      peerConnection.ontrack = (event) => {
        if (remoteVideoRef.current && event.streams[0]) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          // In production, send candidate to remote peer via signaling server
          console.log("ICE candidate:", event.candidate);
        }
      };

      peerConnection.onconnectionstatechange = () => {
        setConnectionStatus(peerConnection.connectionState);
        if (peerConnection.connectionState === "connected") {
          toast({
            title: "Call Connected",
            description: "You are now connected",
          });
        }
      };

      setIsCallActive(true);
      setConnectionStatus("connected");
      
      toast({
        title: "Call Started",
        description: "Voice and video call initiated",
      });
    } catch (error) {
      console.error("Error starting call:", error);
      toast({
        title: "Call Failed",
        description: "Could not start call. Please check permissions.",
        variant: "destructive",
      });
      setConnectionStatus("failed");
    }
  };

  const endCall = () => {
    // Stop all tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    // Clear video elements
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    setIsCallActive(false);
    setConnectionStatus("idle");
    onClose();
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  return (
    <Card className="fixed inset-4 z-50 flex flex-col bg-card shadow-strong">
      <div className="flex-1 relative bg-muted/20">
        {/* Remote video */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        
        {/* Local video (picture-in-picture) */}
        <div className="absolute bottom-4 right-4 w-48 h-36 rounded-lg overflow-hidden shadow-strong border-2 border-border">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        </div>

        {/* Connection status */}
        <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full">
          <span className="text-sm font-medium">
            {connectionStatus === "connecting" && "Connecting..."}
            {connectionStatus === "connected" && "Connected"}
            {connectionStatus === "failed" && "Connection Failed"}
            {connectionStatus === "idle" && "Ready to call"}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="p-6 bg-background border-t flex items-center justify-center gap-4">
        {!isCallActive ? (
          <Button
            size="lg"
            onClick={startCall}
            className="gap-2 shadow-glow"
          >
            <Phone className="h-5 w-5" />
            Start Call
          </Button>
        ) : (
          <>
            <Button
              size="lg"
              variant={isMuted ? "destructive" : "secondary"}
              onClick={toggleMute}
            >
              {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>
            
            <Button
              size="lg"
              variant={isVideoOff ? "destructive" : "secondary"}
              onClick={toggleVideo}
            >
              {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
            </Button>
            
            <Button
              size="lg"
              variant="destructive"
              onClick={endCall}
              className="gap-2"
            >
              <PhoneOff className="h-5 w-5" />
              End Call
            </Button>
          </>
        )}
      </div>
    </Card>
  );
};

export default VideoCallInterface;
