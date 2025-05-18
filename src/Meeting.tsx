import React, { useState } from "react";
import AgoraRTC, {
  AgoraRTCProvider,
  useJoin,
  useLocalCameraTrack,
  useLocalMicrophoneTrack,
  usePublish,
  useRTCClient,
  useRemoteAudioTracks,
  useRemoteUsers,
  RemoteUser,
  LocalVideoTrack,
} from "agora-rtc-react";
import { APP_ID, CHANNEL_NAME, TOKEN } from "./constants";
import { Videos } from "./Videos";

export default function Meeting() {
  const client = AgoraRTC.createClient({ codec: "vp8", mode: "rtc" });
  const [channelName, setChannelName] = useState<string>(CHANNEL_NAME);
  const [AppID, setAppID] = useState<string>(APP_ID);
  const [token, setToken] = useState<string>(TOKEN);
  const [inCall, setInCall] = useState<boolean>(true);

  const toggleInCall = () => {
    setInCall(!inCall);
  };
  return (
    <div>
      <AgoraRTCProvider client={client}>
        {inCall ? (
          <Videos
            channelName={channelName}
            AppID={AppID}
            token={token}
            onEndCall={() => setInCall(false)}
          />
        ) : (
          <div>Cuộc gọi đã kết thúc. Cảm ơn bạn!</div>
        )}
      </AgoraRTCProvider>
    </div>
  );
}
