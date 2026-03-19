"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  Clock,
  Monitor,
  User,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface VerificationLog {
  id: string;
  ipAddress: string;
  location: string;
  userAgent: string;
  action: string;
  timestamp: string;
  attendance: {
    student: { name: string; email: string };
    internshipForm: { companyName: string };
  };
}

interface InternshipForm {
  id: string;
  studentName?: string | null;
  student?: { name?: string | null } | null;
  companyName: string;
}

interface AuditLogsProps {
  forms: InternshipForm[];
}

export function AuditLogs({ forms }: AuditLogsProps) {
  const [logs, setLogs] = useState<VerificationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<string>("");

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const url =
        selectedStudent && selectedStudent !== "all"
          ? `/api/logs?studentId=${selectedStudent}`
          : "/api/logs";

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setLogs(data);
      } else {
        toast.error("Could not load verification logs.");
      }
    } catch (error) {
      console.error("Failed to fetch logs:", error);
      toast.error("Failed to load logs : A network error occurred.");
    } finally {
      setLoading(false);
    }
  }, [selectedStudent]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const exportLogsToCSV = (rows: VerificationLog[]) => {
    if (!rows || rows.length === 0) return;

    const headers = [
      "Student Name",
      "Student Email",
      "Company",
      "Action",
      "IP Address",
      "Location",
      "User Agent",
      "Timestamp",
    ];

    const csvRows = [headers.join(",")];

    for (const r of rows) {
      const cols = [
        `"${r.attendance?.student?.name ?? ""}"`,
        `"${r.attendance?.student?.email ?? ""}"`,
        `"${r.attendance?.internshipForm?.companyName ?? ""}"`,
        `"${r.action}"`,
        `"${r.ipAddress}"`,
        `"${r.location ?? ""}"`,
        `"${r.userAgent ?? ""}"`,
        `"${new Date(r.timestamp).toISOString()}"`,
      ];
      csvRows.push(cols.join(","));
    }

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `interntrack-logs-${new Date().toISOString()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getActionIcon = (action: string) => {
    return action === "present" ? (
      <CheckCircle className="w-4 h-4 text-green-600" />
    ) : (
      <XCircle className="w-4 h-4 text-red-600" />
    );
  };

  const getActionColor = (action: string) => {
    return action === "present"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  };

  const getFormStudentName = (form: InternshipForm) =>
    form.studentName || form.student?.name || "Unknown Student";

  const uniqueStudents = forms
    .filter(
      (form, index, self) =>
        index ===
        self.findIndex(
          (f) => getFormStudentName(f) === getFormStudentName(form),
        ),
    )
    .map((form) => ({
      id: form.id,
      name: getFormStudentName(form),
    }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Attendance Verification Logs</CardTitle>
          <CardDescription>
            Track all attendance verification activities with IP addresses,
            locations, and timestamps
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <div />
              <Button
                size="sm"
                variant="ghost"
                onClick={() => exportLogsToCSV(logs)}
                disabled={logs.length === 0}
              >
                Export CSV
              </Button>
            </div>

            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Filter by student (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Students</SelectItem>
                {uniqueStudents.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner className="w-8 h-8" />
        </div>
      ) : logs.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Monitor className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Verification Logs
              </h3>
              <p className="text-gray-600">
                Attendance verification logs will appear here once students
                start requesting attendance.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <Card key={log.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      {getActionIcon(log.action)}
                      <div>
                        <p className="font-medium text-gray-900">
                          {log.attendance.student.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {log.attendance.internshipForm.companyName}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-gray-600">Location</p>
                          <p className="font-medium text-gray-900">
                            {log.location || "Unknown"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Monitor className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-gray-600">IP Address</p>
                          <p className="font-medium text-gray-900 font-mono">
                            {log.ipAddress}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-gray-600">Verified At</p>
                          <p className="font-medium text-gray-900">
                            {new Date(log.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {log.userAgent && (
                      <div className="pt-2 border-t">
                        <p className="text-xs text-gray-500">
                          <span className="font-medium">User Agent:</span>{" "}
                          {log.userAgent}
                        </p>
                      </div>
                    )}
                  </div>

                  <Badge className={getActionColor(log.action)}>
                    {log.action.toUpperCase()}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
