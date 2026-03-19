"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from "sonner";
import { Mail, Lock, UserCircle2 } from "lucide-react";
import Link from "next/link";

type Role = "STUDENT" | "TEACHER";

export default function SignupForm({ role }: { role: Role }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data?.error || "Failed to create account";
        toast.error(msg);
      } else {
        toast.success("Account created : You can now sign in.");
        setName("");
        setEmail("");
        setPassword("");
      }
    } catch (err) {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const theme =
    role === "TEACHER"
      ? {
          bg: "from-emerald-50 to-teal-100",
          accent: "emerald",
          loginPath: "/teacher/login",
        }
      : {
          bg: "from-blue-50 to-indigo-100",
          accent: "blue",
          loginPath: "/student/login",
        };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${theme.bg} flex items-center justify-center p-4`}
    >
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div
            className={`mx-auto w-12 h-12 bg-${theme.accent}-600 rounded-full flex items-center justify-center mb-4`}
          >
            <UserCircle2 className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {role === "TEACHER" ? "Teacher Signup" : "Student Signup"}
          </h1>
          <p className="text-gray-600 mt-2">Create your account</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Create account</CardTitle>
            <CardDescription>
              Fill in your details to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <div className="relative">
                  <UserCircle2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={
                      role === "TEACHER"
                        ? "teacher@university.edu"
                        : "student@university.edu"
                    }
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    minLength={8}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className={`w-full bg-${theme.accent}-600 hover:bg-${theme.accent}-700`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <LoadingSpinner className="w-4 h-4 mr-2" />
                    Creating account...
                  </>
                ) : (
                  "Create account"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href={theme.loginPath}
            className={`text-${theme.accent}-600 hover:underline`}
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
