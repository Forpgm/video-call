import {
  useJoin,
  useLocalCameraTrack,
  useLocalMicrophoneTrack,
  usePublish,
  useRemoteAudioTracks,
  useRemoteUsers,
  RemoteUser,
  LocalVideoTrack,
  useRTCClient,
} from "agora-rtc-react";
import { useState } from "react";

interface VideoProps {
  channelName: string;
  AppID: string;
  token: string;
  onEndCall: () => void;
}
export function Videos({ channelName, AppID, token, onEndCall }: VideoProps) {
  const { isLoading: isLoadingMic, localMicrophoneTrack } =
    useLocalMicrophoneTrack();
  const { isLoading: isLoadingCam, localCameraTrack } = useLocalCameraTrack();
  const [camOn, setCamOn] = useState<boolean>(true);
  const [micOn, setMicOn] = useState<boolean>(true);
  const client = useRTCClient();
  const deviceLoading = isLoadingMic || isLoadingCam;

  const joinData = useJoin({
    appid: AppID,
    channel: channelName,
    token: token === "" ? null : token,
  });

  const publishData = usePublish(
    [localMicrophoneTrack, localCameraTrack],
    !deviceLoading && joinData.isConnected
  );

  const remoteUsers = useRemoteUsers();

  const { audioTracks } = useRemoteAudioTracks(remoteUsers);
  audioTracks.map((track) => track.play());

  const toggleCamEnabled = () => {
    localCameraTrack?.setEnabled(!localCameraTrack.enabled);
    setCamOn(!camOn);
  };

  const toggleMicEnabled = () => {
    localMicrophoneTrack?.setEnabled(!localMicrophoneTrack.enabled);
    setMicOn(!micOn);
  };

  if (deviceLoading) {
    return <div>Loading devices...</div>;
  }

  if (publishData.isLoading) {
    return <div>Getting published...</div>;
  }

  if (joinData.isLoading) {
    return <div>Getting connected...</div>;
  }

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

      await client.leave();
      onEndCall();
    } catch (error) {
      console.error("Failed to end call:", error);
    }
  };

  return (
    <div className="flex h-full w-full">
      {/* Local video area*/}
      <div className="w-3/4 p-2">
        <div className="w-full h-full aspect-video bg-black rounded-xl overflow-hidden">
          <LocalVideoTrack track={localCameraTrack} play={true} />
        </div>
      </div>

      {/* Remote user area  */}
      <div className="w-1/4 p-2 overflow-y-auto space-y-2">
        {remoteUsers.length === 0 ? (
          <div className="text-center text-gray-500">No remote users</div>
        ) : (
          remoteUsers.map((user) => (
            <div
              key={user.uid}
              className="h-40 bg-black rounded-lg overflow-hidden flex items-center justify-center"
            >
              {user.hasVideo ? (
                <RemoteUser user={user} playVideo={true} playAudio={true} />
              ) : (
                <div className="text-white">No Video</div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Button controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4">
        <button
          onClick={toggleCamEnabled}
          className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
        >
          {camOn ? (
            // Cam On icon
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
              />
            </svg>
          ) : (
            // Cam Off icon
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M12 18.75H4.5a2.25 2.25 0 0 1-2.25-2.25V9m12.841 9.091L16.5 19.5m-1.409-1.409c.407-.407.659-.97.659-1.591v-9a2.25 2.25 0 0 0-2.25-2.25h-9c-.621 0-1.184.252-1.591.659m12.182 12.182L2.909 5.909M1.5 4.5l1.409 1.409"
              />
            </svg>
          )}
        </button>

        <button
          onClick={toggleMicEnabled}
          className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
        >
          {micOn ? (
            // Mic on icon
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 18.75v1.5m0 0h3m-3 0H9m3-16.5a3 3 0 00-3 3v6a3 3 0 006 0v-6a3 3 0 00-3-3zM19.5 12a7.5 7.5 0 01-15 0"
              />
            </svg>
          ) : (
            // Mic off icon
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.75 9.75v4.5a2.25 2.25 0 003.894 1.591M16.5 16.5a6.75 6.75 0 01-12-4.5m13.5 4.5a6.715 6.715 0 001.5-4.5m-7.5 9v-1.5m0 0H12m0 0h3m3.75-17.25l-15 15"
              />
            </svg>
          )}
        </button>

        <button
          onClick={handleEndCall}
          className="p-2 rounded-full bg-red-500  hover:bg-red-600 transition-colors"
        >
          End Call
        </button>
      </div>
    </div>
  );
}
