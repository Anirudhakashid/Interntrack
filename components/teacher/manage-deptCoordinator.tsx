"use client";

import { useState, useEffect } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2, Plus } from "lucide-react";

interface Coordinator {
  id: string;
  branch: string;
  email: string;
  name: string;
}

export function ManageDeptCoordinators() {
  const [coordinators, setCoordinators] = useState<Coordinator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [coordinatorToDelete, setCoordinatorToDelete] = useState<string | null>(
    null,
  );

  const [formData, setFormData] = useState({
    branch: "",
    email: "",
    name: "",
  });

  useEffect(() => {
    fetchCoordinators();
  }, []);

  const fetchCoordinators = async () => {
    try {
      const response = await fetch("/api/dept-coordinator");
      if (response.ok) {
        const data = await response.json();
        if (data.coordinators && Array.isArray(data.coordinators)) {
          setCoordinators(data.coordinators);
        } else if (Array.isArray(data)) {
          setCoordinators(data);
        } else {
          console.error("Invalid data format:", data);
          setCoordinators([]);
        }
      } else {
        setCoordinators([]);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setError("Failed to fetch coordinators");
      setCoordinators([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.branch || !formData.email || !formData.name) {
      setError("All fields are required");
      return;
    }

    try {
      const response = await fetch("/api/dept-coordinator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess("Coordinator added successfully");
        setFormData({ branch: "", email: "", name: "" });
        fetchCoordinators();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to add coordinator");
      }
    } catch (error) {
      setError("Network error");
    }
  };

  const handleDelete = async (id: string) => {
    setCoordinatorToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!coordinatorToDelete) return;

    try {
      const response = await fetch(
        `/api/dept-coordinator/${coordinatorToDelete}`,
        {
          method: "DELETE",
        },
      );

      if (response.ok) {
        setSuccess("Coordinator deleted successfully");
        fetchCoordinators();
      } else {
        setError("Failed to delete coordinator");
      }
    } catch (error) {
      setError("Network error");
    } finally {
      setDeleteDialogOpen(false);
      setCoordinatorToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Department Coordinator</CardTitle>
          <CardDescription>
            Add or manage department coordinators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert>
                <AlertDescription className="text-green-600">
                  {success}
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="branch">Branch Name *</Label>
                <Input
                  id="branch"
                  placeholder="e.g., Computer Science"
                  value={formData.branch}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, branch: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Coordinator Name *</Label>
                <Input
                  id="name"
                  placeholder="Full name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="coordinator@college.edu"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Coordinator
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Coordinators</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner className="w-8 h-8" />
            </div>
          ) : !coordinators || coordinators.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              No coordinators added yet
            </p>
          ) : (
            <div className="space-y-2">
              {coordinators.map((coord) => (
                <div
                  key={coord.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{coord.branch}</p>
                    <p className="text-sm text-gray-600">
                      {coord.name} ({coord.email})
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(coord.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Coordinator</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this coordinator? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-4 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
