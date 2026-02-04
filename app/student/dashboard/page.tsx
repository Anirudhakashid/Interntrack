"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { InternshipForm } from "@/components/student/internship-form";
import { AttendanceTracker } from "@/components/student/attendance-tracker";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import {
  GraduationCap,
  FileText,
  Calendar,
  LogOut,
  Plus,
  CheckCircle,
  Clock,
  XCircle,
  Menu,
} from "lucide-react";

interface InternshipFormData {
  id: string;
  companyName: string;
  status: string;
  createdAt: string;
  teacher: { name: string; email: string };
  attendances: any[];
}

export default function StudentDashboard() {
  const [forms, setForms] = useState<InternshipFormData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const response = await fetch("/api/internship-form");
      if (response.ok) {
        const data = await response.json();
        setForms(data);
      }
    } catch (error) {
      console.error("Failed to fetch forms:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (!res.ok) throw new Error(`Logout failed: ${res.status}`);
    } catch (e) {
      console.error(e);
      toast({
        title: "Logout failed",
        description: "We couldn't sign you out. Redirecting to login...",
        variant: "destructive",
      });
    } finally {
      router.push("/student/login");
      router.refresh();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "REJECTED":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "PENDING":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner className="w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Student Dashboard
                </h1>
                <p className="text-sm text-gray-600">
                  Manage your internship journey
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          {/* Desktop Tabs */}
          <div className="hidden md:block">
            <TabsList className="grid w-full grid-cols-3 gap-1 h-auto p-1">
              <TabsTrigger value="overview" className="text-sm">
                Overview
              </TabsTrigger>
              <TabsTrigger value="forms" className="text-sm">
                Internship Forms
              </TabsTrigger>
              <TabsTrigger value="attendance" className="text-sm">
                Attendance
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="w-full">
                  <Menu className="w-4 h-4 mr-2" />
                  Menu
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <SheetTitle className="sr-only">Student menu</SheetTitle>
                <SheetDescription className="sr-only">
                  Navigate between dashboard sections.
                </SheetDescription>
                <nav className="space-y-2 mt-8">
                  <button
                    onClick={() => {
                      setActiveTab("overview");
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === "overview"
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("forms");
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === "forms"
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    Internship Forms
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("attendance");
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === "attendance"
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    Attendance
                  </button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {forms.length}
                      </p>
                      <p className="text-sm text-gray-600">
                        Total Applications
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {forms.filter((f) => f.status === "APPROVED").length}
                      </p>
                      <p className="text-sm text-gray-600">Approved</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {forms.filter((f) => f.status === "PENDING").length}
                      </p>
                      <p className="text-sm text-gray-600">Pending</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {forms.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No Internship Forms Yet
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Get started by submitting your first internship form for
                      teacher approval.
                    </p>
                    <Button onClick={() => setShowNewForm(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create New Form
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Applications</CardTitle>
                  <CardDescription>
                    Your latest internship form submissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {forms.slice(0, 3).map((form) => (
                      <div
                        key={form.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {getStatusIcon(form.status)}
                          <div>
                            <p className="font-medium text-gray-900">
                              {form.companyName}
                            </p>
                            <p className="text-sm text-gray-600">
                              Teacher: {form.teacher.name}
                            </p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(form.status)}>
                          {form.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="forms" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                Internship Forms
              </h2>
              <Button onClick={() => setShowNewForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Form
              </Button>
            </div>

            {showNewForm ? (
              <InternshipForm
                onSubmit={() => {
                  setShowNewForm(false);
                  fetchForms();
                }}
              />
            ) : (
              <div className="space-y-4">
                {forms.map((form) => (
                  <Card key={form.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>{form.companyName}</CardTitle>
                          <CardDescription>
                            Teacher: {form.teacher.name} • Submitted{" "}
                            {new Date(form.createdAt).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <Badge className={getStatusColor(form.status)}>
                          {form.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-gray-600">
                        Recent attendance records: {form.attendances.length}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="attendance" className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">
                Attendance Tracking
              </h2>
            </div>
            <AttendanceTracker forms={forms} onAttendanceRequest={fetchForms} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
