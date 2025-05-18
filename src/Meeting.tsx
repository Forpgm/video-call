import { useEffect, useState } from "react";
import AgoraRTC, {
  AgoraRTCProvider,
  type IAgoraRTCClient,
} from "agora-rtc-react";
import { APP_ID, CHANNEL_NAME, TOKEN } from "./constants";
import { Videos } from "./Videos";

export default function Meeting() {
  const [videoClient] = useState<IAgoraRTCClient>(() =>
    AgoraRTC.createClient({ mode: "rtc", codec: "vp8" })
  );
  const [inCall, setInCall] = useState(true);

  useEffect(() => {
    const startCall = async () => {
      try {
        // Join client and publish mic+cam tracks
        await videoClient.join(APP_ID, CHANNEL_NAME, TOKEN, null);
        const [audioTrack, videoTrack] =
          await AgoraRTC.createMicrophoneAndCameraTracks();
        await videoClient.publish([audioTrack, videoTrack]);
      } catch (err) {
        console.error("Failed to start call:", err);
      }
    };

    startCall();

    return () => {
      videoClient.leave();
    };
  }, [videoClient]);

  return (
    <div>
      <AgoraRTCProvider client={videoClient}>
        {inCall ? (
          <Videos
            videoClient={videoClient}
            screenClient={videoClient} // Đổi thành videoClient luôn
            onEndCall={() => setInCall(false)}
          />
        ) : (
          <div>Cuộc gọi đã kết thúc. Cảm ơn bạn!</div>
        )}
      </AgoraRTCProvider>
    </div>
  );
}
