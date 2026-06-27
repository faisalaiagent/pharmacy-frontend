"use client";
// src/app/register/page.tsx
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, UserPlus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "sonner";

const schema = z.object({
  first_name: z.string().min(2, "First name must be at least 2 characters"),
  last_name: z.string().min(2, "Last name must be at least 2 characters"),
  username: z.string().min(3, "Username must be at least 3 characters").regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, underscores"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(10, "Password must be at least 10 characters"),
  password2: z.string(),
}).refine((d) => d.password === d.password2, {
  message: "Passwords do not match",
  path: ["password2"],
});
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [showPass, setShowPass] = useState(false);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const password = watch("password", "");
  const passwordChecks = [
    { label: "At least 10 characters", ok: password.length >= 10 },
    { label: "Contains a number", ok: /\d/.test(password) },
    { label: "Contains a letter", ok: /[a-zA-Z]/.test(password) },
  ];

  const onSubmit = async (data: FormData) => {
    try {
      const res = await authApi.register(data);
      const { access, refresh, ...user } = res.data.data;
      setAuth(user, access, refresh);
      toast.success("Account created! Welcome to PharmaCare.");
      router.push("/dashboard");
    } catch (error: unknown) {
      const errData = (error as { response?: { data?: { errors?: Record<string, string[]>; message?: string } } })?.response?.data;
      if (errData?.errors) {
        const firstError = Object.values(errData.errors)[0];
        toast.error(Array.isArray(firstError) ? firstError[0] : String(firstError));
      } else {
        toast.error(errData?.message || "Registration failed.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-teal-50 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">Rx</span>
            </div>
            <span className="font-bold text-xl text-gray-900">PharmaCare</span>
          </Link>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl">Create account</CardTitle>
            <CardDescription>Join PharmaCare for a healthier you</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>First Name</Label>
                  <Input placeholder="Shah" {...register("first_name")} className={errors.first_name ? "border-red-400" : ""} />
                  {errors.first_name && <p className="text-xs text-red-500">{errors.first_name.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Last Name</Label>
                  <Input placeholder="Faisal" {...register("last_name")} className={errors.last_name ? "border-red-400" : ""} />
                  {errors.last_name && <p className="text-xs text-red-500">{errors.last_name.message}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Username</Label>
                <Input placeholder="shahfaisal" {...register("username")} className={errors.username ? "border-red-400" : ""} />
                {errors.username && <p className="text-xs text-red-500">{errors.username.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" placeholder="you@example.com" {...register("email")} className={errors.email ? "border-red-400" : ""} />
                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label>Password</Label>
                <div className="relative">
                  <Input
                    type={showPass ? "text" : "password"}
                    placeholder="Create a strong password"
                    {...register("password")}
                    className={`pr-10 ${errors.password ? "border-red-400" : ""}`}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {password && (
                  <div className="space-y-1 mt-1">
                    {passwordChecks.map(({ label, ok }) => (
                      <div key={label} className={`flex items-center gap-1.5 text-xs ${ok ? "text-green-600" : "text-gray-400"}`}>
                        <Check className={`w-3 h-3 ${ok ? "opacity-100" : "opacity-30"}`} />
                        {label}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>Confirm Password</Label>
                <Input
                  type="password"
                  placeholder="Repeat your password"
                  {...register("password2")}
                  className={errors.password2 ? "border-red-400" : ""}
                />
                {errors.password2 && <p className="text-xs text-red-500">{errors.password2.message}</p>}
              </div>

              <Button type="submit" className="w-full bg-sky-500 hover:bg-sky-600 text-white h-11" disabled={isSubmitting}>
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <><UserPlus className="w-4 h-4 mr-2" /> Create Account</>
                )}
              </Button>

              <p className="text-xs text-center text-gray-400">
                By registering, you agree to our{" "}
                <Link href="/terms" className="text-sky-600 hover:underline">Terms</Link> and{" "}
                <Link href="/privacy-policy" className="text-sky-600 hover:underline">Privacy Policy</Link>
              </p>
            </form>

            <p className="text-center text-sm text-gray-500 mt-4">
              Already have an account?{" "}
              <Link href="/login" className="text-sky-600 hover:underline font-medium">Log in</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
