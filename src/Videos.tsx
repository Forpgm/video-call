import React, { useEffect, useState } from "react";
import AgoraRTC, {
  useLocalCameraTrack,
  useLocalMicrophoneTrack,
  useRemoteUsers,
  RemoteUser,
  LocalVideoTrack,
  useLocalScreenTrack,
  type ILocalVideoTrack,
  type ILocalAudioTrack,
  type IAgoraRTCClient,
} from "agora-rtc-react";
import { APP_ID, CHANNEL_NAME, TOKEN } from "./constants";

interface VideoProps {
  videoClient: IAgoraRTCClient; // client dùng cho video + mic
  screenClient: IAgoraRTCClient; // client dùng cho screen share
  onEndCall: () => void;
}

export function Videos({ videoClient, screenClient, onEndCall }: VideoProps) {
  const { isLoading: isLoadingMic, localMicrophoneTrack } =
    useLocalMicrophoneTrack();
  const { isLoading: isLoadingCam, localCameraTrack } = useLocalCameraTrack();

  const [camOn, setCamOn] = useState(true);
  const [micOn, setMicOn] = useState(true);

  // Screen share states
  const [screenVideoTrack, setScreenVideoTrack] =
    useState<ILocalVideoTrack | null>(null);
  const [screenAudioTrack, setScreenAudioTrack] =
    useState<ILocalAudioTrack | null>(null);
  const [screenShareOn, setScreenShareOn] = useState(false);
  const { screenTrack } = useLocalScreenTrack(
    screenShareOn,
    { systemAudio: "include" },
    "enable"
  );

  const [hasJoinedVideoClient, setHasJoinedVideoClient] = useState(false);
  const [hasJoinedScreenClient, setHasJoinedScreenClient] = useState(false);

  useEffect(() => {
    const joinAndPublish = async () => {
      try {
        if (!videoClient) return;

        if (hasJoinedVideoClient) {
          console.log("Already joined video client");
          return;
        }

        await videoClient.join(APP_ID, CHANNEL_NAME, TOKEN ?? null);
        setHasJoinedVideoClient(true);

        const tracks = [];
        if (localCameraTrack) tracks.push(localCameraTrack);
        if (localMicrophoneTrack) tracks.push(localMicrophoneTrack);

        if (tracks.length > 0) {
          await videoClient.publish(tracks);
        }
        console.log("Joined and published local tracks on video client");
      } catch (error) {
        console.error("Error joining or publishing videoClient:", error);
      }
    };

    if (localCameraTrack && localMicrophoneTrack) {
      joinAndPublish();
    }

    return () => {
      const cleanup = async () => {
        try {
          if (!videoClient) return;

          if (!hasJoinedVideoClient) {
            console.log("Client not joined, skip cleanup");
            return;
          }

          if (localCameraTrack) await videoClient.unpublish(localCameraTrack);
          if (localMicrophoneTrack)
            await videoClient.unpublish(localMicrophoneTrack);
          await videoClient.leave();

          setHasJoinedVideoClient(false);
          console.log("Left video client channel");
        } catch (error) {
          console.error("Error leaving video client:", error);
        }
      };
      cleanup();
    };
  }, [
    videoClient,
    localCameraTrack,
    localMicrophoneTrack,
    hasJoinedVideoClient,
  ]);

  videoClient.on("user-published", async (user, mediaType) => {
    await videoClient.subscribe(user, mediaType);
    if (mediaType === "video") {
      // show video track
    }
    if (mediaType === "audio") {
      // play audio
    }
  });

  screenClient.on("user-published", async (user, mediaType) => {
    await screenClient.subscribe(user, mediaType);
    if (mediaType === "video") {
      // show screen share video track
    }
  });

  useEffect(() => {
    const publishScreen = async () => {
      if (screenShareOn && screenVideoTrack) {
        try {
          if (!hasJoinedScreenClient) {
            await screenClient.join(APP_ID, CHANNEL_NAME, TOKEN ?? null);
            setHasJoinedScreenClient(true);
          }
          await screenClient.publish(
            screenAudioTrack
              ? [screenVideoTrack, screenAudioTrack]
              : [screenVideoTrack]
          );
          console.log("Screen share published");
        } catch (err) {
          console.error("Failed to publish screen share:", err);
        }
        return;
      }

      if (!screenShareOn && hasJoinedScreenClient) {
        try {
          if (screenVideoTrack) {
            await screenClient.unpublish(
              screenAudioTrack
                ? [screenVideoTrack, screenAudioTrack]
                : [screenVideoTrack]
            );
          }
          await screenClient.leave();
          setHasJoinedScreenClient(false);
          console.log("Stopped screen share");
        } catch (err) {
          console.error("Failed to stop screen share:", err);
        }
      }
    };
    publishScreen();
  }, [
    screenShareOn,
    screenVideoTrack,
    screenAudioTrack,
    screenClient,
    hasJoinedScreenClient,
  ]);

  useEffect(() => {
    if (screenTrack) {
      const [videoTrack, audioTrack] = screenTrack;
      setScreenVideoTrack(videoTrack);
      setScreenAudioTrack(audioTrack);
    } else {
      setScreenVideoTrack(null);
      setScreenAudioTrack(null);
    }
  }, [screenTrack]);

  // Lấy remote users từ hook
  const remoteUsers = useRemoteUsers();
  useEffect(() => {
    if (screenVideoTrack) {
      const handleTrackEnded = () => {
        console.log("Screen share stopped from browser UI");
        setScreenShareOn(false); // cập nhật UI app khi user stop share từ Chrome
      };

      screenVideoTrack.on("track-ended", handleTrackEnded);

      return () => {
        screenVideoTrack.off("track-ended", handleTrackEnded);
      };
    }
  }, [screenVideoTrack]);

  useEffect(() => {
    remoteUsers.forEach((user) => {
      if (user.hasAudio) user.audioTrack?.play();
    });
  }, [remoteUsers]);

  // Toggle camera
  const toggleCamEnabled = () => {
    if (!localCameraTrack) return;
    localCameraTrack.setEnabled(!localCameraTrack.enabled);
    setCamOn(!camOn);
  };

  // Toggle mic
  const toggleMicEnabled = () => {
    if (!localMicrophoneTrack) return;
    localMicrophoneTrack.setEnabled(!localMicrophoneTrack.enabled);
    setMicOn(!micOn);
  };

  // Toggle screen share
  const toggleScreenShare = () => {
    setScreenShareOn((prev) => !prev);
  };

  // Kết thúc cuộc gọi
  const handleEndCall = async () => {
    try {
      if (localCameraTrack) {
        localCameraTrack.stop();
        localCameraTrack.close();
      }
      if (localMicrophoneTrack) {
        localMicrophoneTrack.stop();
        localMicrophoneTrack.close();
      }
      if (screenVideoTrack) {
        screenVideoTrack.stop();
        screenVideoTrack.close();
      }
      if (screenAudioTrack) {
        screenAudioTrack.stop();
        screenAudioTrack.close();
      }
      onEndCall();
    } catch (error) {
      console.error("Failed to end call:", error);
    }
  };

  if (isLoadingMic || isLoadingCam) {
    return <div>Loading devices...</div>;
  }

  // Loại bỏ user trùng uid
  const uniqueRemoteUsers = Array.from(
    new Map(remoteUsers.map((u) => [u.uid, u])).values()
  );
  console.log(
    remoteUsers.map((u) => ({
      uid: u.uid,
      hasVideo: u.hasVideo,
      hasAudio: u.hasAudio,
    }))
  );

  return (
    <div className="flex h-full w-full relative">
      {/* Video area (local screen share + camera) */}
      <div className="w-3/4 p-2 relative flex gap-2">
        {screenShareOn && screenVideoTrack ? (
          <>
            {/* Screen share lớn bên trái */}
            <div className="flex-1 bg-black rounded-xl overflow-hidden aspect-video">
              <LocalVideoTrack track={screenVideoTrack} play={true} />
            </div>
            {/* Camera local nhỏ overlay góc dưới phải */}
            {localCameraTrack && (
              <div
                className="absolute bottom-4 right-4 w-32 h-20 bg-black rounded-lg overflow-hidden border border-gray-700 shadow-lg"
                style={{ zIndex: 10 }}
              >
                <LocalVideoTrack track={localCameraTrack} play={true} />
              </div>
            )}
          </>
        ) : (
          <>
            {/* Không share màn hình, camera local full size */}
            <div className="flex-1 bg-black rounded-xl overflow-hidden aspect-video">
              {localCameraTrack && (
                <LocalVideoTrack track={localCameraTrack} play={true} />
              )}
            </div>
          </>
        )}
      </div>

      {/* Remote users */}
      <div className="w-1/4 p-2 overflow-y-auto space-y-2">
        {uniqueRemoteUsers.length === 0 ? (
          <div className="text-center text-gray-500">No remote users</div>
        ) : (
          uniqueRemoteUsers
            .filter((user) => user.hasVideo)
            .map((user) => (
              <div
                key={user.uid}
                className="h-40 bg-black rounded-lg overflow-hidden flex items-center justify-center"
              >
                <RemoteUser user={user} playVideo={true} playAudio={true} />
              </div>
            ))
        )}
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4">
        <button
          onClick={toggleCamEnabled}
          className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
        >
          {camOn ? "Cam On" : "Cam Off"}
        </button>
        <button
          onClick={toggleMicEnabled}
          className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
        >
          {micOn ? "Mic On" : "Mic Off"}
        </button>
        <button
          onClick={toggleScreenShare}
          className={`p-2 rounded-full transition-colors ${
            screenShareOn
              ? "bg-green-400 hover:bg-green-500"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          {screenShareOn ? "Stop Share" : "Share Screen"}
        </button>
        <button
          onClick={handleEndCall}
          className="p-2 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
        >
          End Call
        </button>
      </div>
    </div>
  );
}
