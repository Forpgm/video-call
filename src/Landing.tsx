import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

export default function Landing() {
  const navigate = useNavigate();
  const [time, setTime] = useState<Date>(new Date());
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  const handleCreateMeeting = () => {
    const meetingId = uuidv4();
    navigate(`/meeting/${meetingId}`);
  };

  return (
    <div className="p-4 flex flex-col h-full">
      {/* header */}
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center">
          <img
            className="w-[124px] h-[40px] object-contain"
            src="https://www.gstatic.com/meet/google_meet_horizontal_wordmark_2020q4_2x_icon_124_40_292e71bcb52a56e2a9005164118f183b.png"
          />
          <span className="font-['Product_Sans',Arial,sans-serif] pl-[4px] text-[#5f6368] text-[22px]">
            Meet
          </span>
        </div>
        <div className="text-[#5f6368] text-[16px]">
          {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          <span> • </span>
          {time.toLocaleDateString("vi-VN", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>
      <div className="flex flex-row gap-5 p-5 my-10 justify-center items-center h-full w-full">
        <div className="flex-1">
          <h1 className="mb-2">
            Tính năng họp và gọi video dành cho tất cả mọi người
          </h1>
          <div className="text-[1.375rem] font-['Google Sans',Roboto,Arial,sans-serif]">
            Kết nối, cộng tác và ăn mừng ở mọi nơi với{" "}
            <span className="whitespace-nowrap">Google Meet</span>
          </div>
          <button
            onClick={() => handleCreateMeeting()}
            className="mt-4 border-blue-200 text-blue-600 hover:border-transparent hover:bg-blue-600 hover:text-white active:bg-blue-700"
          >
            Cuộc họp mới
          </button>
        </div>
        <div className="flex-1">
          <img
            src="https://www.gstatic.com/meet/user_individual_dont_get_cut_short_b44fc1aa61a6d001c9bf098ddc33ac52.png"
            className="rounded-full object-contain w-100 h-100 mx-auto"
          />
        </div>
      </div>
    </div>
  );
}
