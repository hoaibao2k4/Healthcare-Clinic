import banner from "@/assets/images/banner.svg";
import MasksIcon from "@mui/icons-material/Masks";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import StackOffsetDemo from "@/components/layouts/components/StackChart";
import BasicPie from "@/components/layouts/components/PieChart";
export default function DashBoard() {
  const mockData = [
    {
      name: "Bác sĩ",
      quantity: 10,
      percent: 8,
    },
    {
      name: "Bệnh nhân",
      quantity: 89,
      percent: 20,
    },
    {
      name: "Lượt khám",
      quantity: 110,
      percent: 25,
    },
    {
      name: "Thuốc",
      quantity: 229,
      percent: 40,
    },
  ];
  return (
    <div>
      <div className="Dashboard">
        <div
          style={{ backgroundImage: `url(${banner})` }}
          className="relative flex w-full items-center bg-cover bg-center pt-[20%] duration-500 rounded-2xl"
        >
          <div className="absolute top-1/4 left-10 text-slate-50">
            <h2 className="text-xl font-semibold">Chào buổi sáng,</h2>
            <p className="text-4xl py-1 font-bold">
              Bác sĩ Lộc Nguyễn
            </p>
            <p className="text-lg">Chúc bạn một ngày làm việc tốt lành</p>
          </div>
        </div>
        <div className="flex justify-around py-4">
          {mockData.map((item, index) => (
            <div key={index} className="bg-white size-[22%] rounded-2xl">
              <div className="m-5">
                <div className="bg-[#2e37a40d] size-14 border-[#2e37a41a] rounded-xl border-2 flex items-center justify-center">
                  <MasksIcon sx={{ fontSize: 30, color: "blue" }} />
                </div>
                <h4 className="leading-5 my-5 font-semibold">{item.name}</h4>
                <span className="my-5 font-semibold leading-8 text-4xl">
                  {item.quantity}
                </span>
                <div className="flex mt-3">
                  <ArrowOutwardIcon sx={{ color: "blue", fontSize: 20 }} />
                  <p className="text-sm font-medium leading-5 text-slate-500">
                    {item.percent}% so với tháng trước
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-around m-3">
          <div className="basis-2/3 bg-white rounded-2xl flex items-center justify-center pt-3 mx-3">
            <StackOffsetDemo />
          </div>
          <div className="basis-1/3 bg-white rounded-2xl flex items-center justify-center py-20">
            <BasicPie />
          </div>
        </div>
      </div>
    </div>
  );
}
