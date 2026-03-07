"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  CheckCircle,
  XCircle,
  ExternalLink,
  Mail,
  Building,
} from "lucide-react";

interface InternshipForm {
  id: string;
  companyName: string;
  studentName?: string | null;
  offerLetterURL: string;
  deptCoordinatorEmail: string;
  hrEmail: string;
  companyLocation?: string;
  domain?: string;
  durationWeeks?: number | string;
  startDate?: string;
  endDate?: string;
  stipend?: string;
  mode?: string;
  studentClass?: string;
  studentBranch?: string;
  studentDivision?: string;
  status: string;
  createdAt: string;
  student?: { name?: string | null; email?: string | null } | null;
}

interface FormApprovalProps {
  forms: InternshipForm[];
  onStatusChange: () => void;
}

export function FormApproval({ forms, onStatusChange }: FormApprovalProps) {
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");

  const getStudentName = (form: InternshipForm) =>
    form.studentName || form.student?.name || "Unknown Student";

  const getStudentEmail = (form: InternshipForm) =>
    form.student?.email || "No email";

  const handleStatusChange = async (
    formId: string,
    status: "APPROVED" | "REJECTED",
  ) => {
    setError("");
    setLoading(formId);

    try {
      const response = await fetch(`/api/internship-form/${formId}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        onStatusChange();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to update status");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setLoading("");
    }
  };

  const pendingForms = forms.filter((form) => form.status === "PENDING");

  if (pendingForms.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Pending Forms
            </h3>
            <p className="text-gray-600">
              All forms have been reviewed. New submissions will appear here.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {pendingForms.map((form) => (
        <Card key={form.id} className="border-yellow-200">
          <CardHeader className="bg-yellow-50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  {form.companyName}
                </CardTitle>
                <CardDescription className="mt-1">
                  Student: {getStudentName(form)} ({getStudentEmail(form)})
                </CardDescription>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800">
                PENDING REVIEW
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Student Details
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {getStudentName(form)} ({getStudentEmail(form)})
                  </p>
                  <p className="text-sm text-gray-600">
                    {form.studentClass || ""}
                    {form.studentClass ? " • " : ""}
                    {form.studentBranch || ""}
                    {form.studentDivision
                      ? ` • Division ${form.studentDivision}`
                      : ""}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Mode / Stipend
                    </label>
                    <p className="text-sm text-gray-900 mt-1">
                      {form.mode || "-"}{" "}
                      {form.stipend ? `• ${form.stipend}` : ""}
                    </p>
                    <p className="text-xs text-gray-500">
                      Duration: {form.durationWeeks || "-"} weeks
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Dates
                    </label>
                    <p className="text-sm text-gray-900 mt-1">
                      {form.startDate
                        ? new Date(form.startDate).toLocaleDateString()
                        : "-"}{" "}
                      {form.endDate
                        ? `to ${new Date(form.endDate).toLocaleDateString()}`
                        : ""}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Domain / Location
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {form.domain || "-"}
                  </p>
                  <p className="text-sm text-gray-600">
                    {form.companyLocation || ""}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Dept Coordinator Email
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900">
                      {form.deptCoordinatorEmail}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    HR Email
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900">
                      {form.hrEmail}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Offer Letter
                  </label>
                  <div className="mt-1">
                    <a
                      href={form.offerLetterURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Offer Letter
                    </a>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Submitted
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {new Date(form.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button
                onClick={() => handleStatusChange(form.id, "APPROVED")}
                disabled={loading === form.id}
                className="bg-green-600 hover:bg-green-700 flex-1"
              >
                {loading === form.id ? (
                  <>
                    <LoadingSpinner className="w-4 h-4 mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </>
                )}
              </Button>
              <Button
                onClick={() => handleStatusChange(form.id, "REJECTED")}
                disabled={loading === form.id}
                variant="destructive"
                className="flex-1"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
