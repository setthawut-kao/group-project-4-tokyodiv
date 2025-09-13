import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Typography } from "@/components/ui/typography";
import { ArrowRight } from "lucide-react";

import { ToggleShowPassword } from "@/components/features/auth/ToggleShowPassword";
import axios from "axios";

export const LoginForm = ({ onSwitch, onSuccess }) => {
  // 1. สร้าง State สำหรับฟอร์ม
  const [formData, setFormData] = useState({ email: "", password: "" });

  // 2. ดึง Action `login` มาจาก Store
  const login = useAuthStore((state) => state.login);

  // const login = async (formData) => {
  //   await axios
  //     .post("http://localhost:8001/api/auth/signin", formData)
  //     .then((res) => {
  //       localStorage.setItem("token", res.data.accessToken);
  //       return { success: true };
  //     })
  //     .catch((err) => {
  //       if (err.response) {
  //         return err.response.data;
  //       }
  //       return {
  //         success: false,
  //         message: "An error occurred. Please try again.",
  //       };
  //     });
  // };

  const checkAuth = async () => {
    await axios
      .get("http://localhost:8001/api/auth/profile", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        console.log(res.data);
      })
      .catch((err) => {
        if (err.response) {
          return err.response.data;
        }
        return {
          success: false,
          message: "An error occurred. Please try again.",
        };
      });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await login(formData);

    if (result && result.success) {
      // เช็คว่า result ไม่ใช่ undefined ก่อน
      if (onSuccess) onSuccess(); // ถ้าสำเร็จ ให้ปิด Dialog
    } else {
      // ถ้า result มี message ก็ให้แสดง, ถ้าไม่มีก็แสดงข้อความทั่วไป
      alert(result?.message || "Login failed. Please check your credentials.");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      checkAuth();
    }
  }, []);

  return (
    <div className="grid gap-6">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <ToggleShowPassword
              id="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="flex flex-col gap-3 mt-6">
          <Button type="submit" className="w-full cursor-pointer">
            Login <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </form>
      <div className="flex justify-center">
        <Typography as="small" className="font-semibold">
          Don't have an account ?{" "}
          <Button
            type="button"
            variant="reverse"
            onClick={onSwitch}
            className="bg-white hover:underline focus:outline-none cursor-pointer"
          >
            Register
          </Button>
        </Typography>
      </div>
    </div>
  );
};
