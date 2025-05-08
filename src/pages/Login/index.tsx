import React, { useState } from "react";
import bg from "@/assets/images/medical-banner-with-doctor-patient.jpg";
import logo from "@/assets/icons/v987-18a-removebg-preview.png";
import { TextField } from "@mui/material";
import Button from "@mui/material/Button";
import { adminLogin } from "@/api/apiAdmin";
import { AxiosResponse } from "axios";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
export interface LoginResponse {
  statusCode: number;
  data: {
    username: string;
    available_roles: string[];
    accessToken: string;
  };
}

const Login = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const dispatch = useDispatch();
  const navaite = useNavigate();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res: AxiosResponse<LoginResponse> | string | number =
        await adminLogin(email, password, dispatch, navaite);
      return res;
    } catch (error: any) {
      console.error("Error during login:", error);
    }
  };

  return (
    <div className="bg-gray-50 w-screen h-screen relative">
      <div className="trapezoid frame">
        <div
          className="absolute top-0 left-0 right-0 h-10 bg-gray-200"
          style={{
            clipPath: "polygon(0 0, 100% 0, 97% 100%, 3% 100%)",
          }}
        ></div>
        <div
          className="absolute top-0 right-0 w-10 bottom-0 bg-gray-300"
          style={{
            clipPath: "polygon(0 7%, 100% 0, 100% 100%, 0 93%)",
          }}
        ></div>
        <div
          className="absolute bottom-0 left-0 right-0 h-10 bg-gray-200"
          style={{
            clipPath: "polygon(3% 0, 97% 0, 100% 100%, 0 100%)",
          }}
        ></div>
        <div
          className="absolute top-0 left-0 w-10 bottom-0 bg-gray-300"
          style={{
            clipPath: "polygon(0 0, 100% 7%, 100% 93%, 0 100%)",
          }}
        ></div>
      </div>
      <div className="flex items-center justify-center w-full h-full">
        <div className="m-10 flex w-full h-full">
          <div
            className="basis-2/3 w-full"
            style={{
              backgroundImage: `url(${bg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          ></div>
          <div className="flex flex-col items-center justify-center gap-7 basis-1/3 bg-gradient-to-tr from-blue-400/60 to-white/70">
            <div className="flex flex-row-reverse items-center justify-center">
              <h1 className="uppercase text-4xl font-bold text-blue-800">
                Health SG
              </h1>
              <img src={logo} alt="" className="size-24 bg-" />
            </div>

            <h2 className="font-bold text-blue-600 text-3xl">Đăng nhập</h2>
            <form
              onSubmit={handleSubmit}
              className="flex items-center justify-center flex-col gap-5"
            >
              <TextField
                id="email"
                label="Tài khoản"
                variant="outlined"
                size="small"
                sx={{ width: 300 }}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                id="password"
                label="Mật khẩu"
                variant="outlined"
                size="small"
                sx={{ width: 300 }}
                type="password"
                onChange={(e) => setPassword(e.target.value)}
              />
              <div>
                <Button type="submit" variant="contained">
                  Đăng nhập
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
