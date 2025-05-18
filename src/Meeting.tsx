import { useState } from "react";
import AgoraRTC, { AgoraRTCProvider } from "agora-rtc-react";
import { APP_ID, CHANNEL_NAME, TOKEN } from "./constants";
import { Videos } from "./Videos";

export default function Meeting() {
  const client = AgoraRTC.createClient({ codec: "vp8", mode: "rtc" });

  const [inCall, setInCall] = useState<boolean>(true);

  return (
    <div>
      <AgoraRTCProvider client={client}>
        {inCall ? (
          <Videos
            channelName={CHANNEL_NAME}
            AppID={APP_ID}
            token={TOKEN}
            onEndCall={() => setInCall(false)}
          />
        ) : (
          <div>Cuộc gọi đã kết thúc. Cảm ơn bạn!</div>
        )}
      </AgoraRTCProvider>
    </div>
  );
}
