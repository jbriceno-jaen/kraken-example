"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { Trophy, Plus, Trash2, Edit, AlertTriangle } from "lucide-react";
import { Logo } from "@/components/logo";

interface PersonalRecord {
  id: number;
  exercise: string;
  weight: string;
  createdAt: string;
  updatedAt: string;
}

export default function PersonalRecordsPage() {
  const { showToast } = useToast();
  const [records, setRecords] = useState<PersonalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<PersonalRecord | null>(null);
  const [formData, setFormData] = useState({ exercise: "", weight: "" });
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<number | null>(null);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/personal-records");
      const data = await res.json();
      
      if (res.ok) {
        setRecords(data.records || []);
      } else {
        showToast(data.error || "Error loading personal records", "error");
      }
    } catch (error) {
      console.error("Error fetching personal records:", error);
      showToast("Error loading personal records", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const openAddModal = () => {
    setEditingRecord(null);
    setFormData({ exercise: "", weight: "" });
    setShowModal(true);
  };

  const openEditModal = (record: PersonalRecord) => {
    setEditingRecord(record);
    setFormData({ exercise: record.exercise, weight: record.weight });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.exercise.trim() || !formData.weight.trim()) {
      showToast("Please fill in all fields", "error");
      return;
    }

    setSaving(true);

    try {
      let res: Response;
      if (editingRecord) {
        res = await fetch(`/api/personal-records/${editingRecord.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            exercise: formData.exercise.trim(),
            weight: formData.weight.trim(),
          }),
        });
      } else {
        res = await fetch("/api/personal-records", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            exercise: formData.exercise.trim(),
            weight: formData.weight.trim(),
          }),
        });
      }

      const data = await res.json();

      if (res.ok) {
        showToast(
          editingRecord ? "Personal record updated successfully" : "Personal record added successfully",
          "success"
        );
        setShowModal(false);
        setEditingRecord(null);
        setFormData({ exercise: "", weight: "" });
        fetchRecords();
      } else {
        showToast(data.error || "Error saving personal record", "error");
      }
    } catch (error) {
      console.error("Error saving personal record:", error);
      showToast("Error saving personal record", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: number) => {
    setRecordToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!recordToDelete) return;

    try {
      const res = await fetch(`/api/personal-records/${recordToDelete}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        showToast("Personal record deleted successfully", "success");
        fetchRecords();
        setShowDeleteConfirm(false);
        setRecordToDelete(null);
      } else {
        showToast(data.error || "Error deleting personal record", "error");
      }
    } catch (error) {
      console.error("Error deleting personal record:", error);
      showToast("Error deleting personal record", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="relative size-16">
          <div className="size-full animate-spin rounded-full border-4 border-red-500/20 border-t-red-500" />
          <Trophy className="absolute left-1/2 top-1/2 size-8 -translate-x-1/2 -translate-y-1/2 text-red-400 animate-pulse" />
        </div>
        <p className="mt-4 text-sm font-semibold text-zinc-400 font-[family-name:var(--font-orbitron)]">
          Loading personal records...
        </p>
      </div>
    );
  }

  return (
    <Card className="bg-black p-4 sm:p-6 lg:p-8 shadow-2xl border border-red-500/50">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-orbitron)] text-white mb-2">
            My Personal Records
          </h1>
          <p className="text-sm text-zinc-400">Track and manage your PRs</p>
        </div>
        <Button
          onClick={openAddModal}
          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 w-full sm:w-auto"
        >
          <Plus className="size-4 mr-2" />
          Add PR
        </Button>
      </div>

      {records.length === 0 ? (
        <Card className="border border-red-500/30 bg-black/30 p-12 text-center">
          <Trophy className="size-12 mx-auto mb-4 text-zinc-500" />
          <p className="text-zinc-400 text-lg mb-2">No personal records found</p>
          <p className="text-zinc-500 text-sm">
            Start tracking your progress by adding your first PR
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {records.map((record) => (
            <Card
              key={record.id}
              className="border border-red-500/50 bg-black/30 p-5 sm:p-6 hover:border-red-500/70 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold font-[family-name:var(--font-orbitron)] text-white mb-2 break-words">
                    {record.exercise}
                  </h3>
                  <Badge className="bg-red-500/20 border border-red-500/30 text-red-400 font-[family-name:var(--font-orbitron)] text-xs">
                    {record.weight} lbs
                  </Badge>
                </div>
                <div className="flex gap-2 ml-3 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(record)}
                    className="border-blue-500/40 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 hover:border-blue-500/50"
                  >
                    <Edit className="size-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(record.id)}
                    className="border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20 hover:border-red-500/50"
                  >
                    <Trash2 className="size-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
              <p className="text-xs text-zinc-500 mt-2">
                {new Date(record.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="border border-red-500/50 bg-black text-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <Logo variant="compact" showLink={false} className="justify-center mb-1" />
            <Badge className="bg-gradient-to-r from-red-500/30 via-red-600/25 to-red-500/30 border border-red-500/40 text-white backdrop-blur-sm font-[family-name:var(--font-orbitron)] text-xs px-3 py-1 w-fit mx-auto">
              {editingRecord ? "Edit PR" : "Add PR"}
            </Badge>
            <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight font-[family-name:var(--font-orbitron)] text-white text-center pt-1">
              {editingRecord ? "Edit Personal Record" : "Add Personal Record"}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-zinc-500 text-center font-light">
              {editingRecord 
                ? "Update your personal record information"
                : "Enter your exercise and weight to track your progress"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <label htmlFor="exercise" className="text-xs sm:text-sm font-medium text-white font-[family-name:var(--font-orbitron)]">
                Exercise *
              </label>
              <Input
                id="exercise"
                type="text"
                required
                value={formData.exercise}
                onChange={(e) => {
                  // Only allow text (letters, spaces, hyphens, apostrophes)
                  const textValue = e.target.value.replace(/[^a-zA-Z\s\-']/g, '');
                  setFormData({ ...formData, exercise: textValue });
                }}
                placeholder="e.g., Deadlift, Bench Press, Squat"
                className="border-red-500/50 bg-black/30 text-white placeholder:text-zinc-500 focus:border-red-500/70 focus:ring-2 focus:ring-red-500/20"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="weight" className="text-xs sm:text-sm font-medium text-white font-[family-name:var(--font-orbitron)]">
                Weight (lbs) *
              </label>
              <Input
                id="weight"
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.weight}
                onChange={(e) => {
                  // Only allow numbers and decimal point
                  const numValue = e.target.value.replace(/[^0-9.]/g, '');
                  // Prevent multiple decimal points
                  const parts = numValue.split('.');
                  const finalValue = parts.length > 2 
                    ? parts[0] + '.' + parts.slice(1).join('')
                    : numValue;
                  setFormData({ ...formData, weight: finalValue });
                }}
                onKeyDown={(e) => {
                  // Allow: backspace, delete, tab, escape, enter, decimal point, and numbers
                  if (
                    ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter'].includes(e.key) ||
                    (e.key >= '0' && e.key <= '9') ||
                    (e.key === '.' && !formData.weight.includes('.')) ||
                    // Allow Ctrl/Cmd + A, C, V, X
                    (e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())
                  ) {
                    return;
                  }
                  e.preventDefault();
                }}
                placeholder="e.g., 225, 315"
                className="border-red-500/50 bg-black/30 text-white placeholder:text-zinc-500 focus:border-red-500/70 focus:ring-2 focus:ring-red-500/20"
              />
            </div>

            <div className="flex gap-2 sm:gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowModal(false);
                  setEditingRecord(null);
                  setFormData({ exercise: "", weight: "" });
                }}
                className="flex-1 border-red-500/50 bg-black/30 text-white hover:bg-black/50 hover:border-red-500/70"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : editingRecord ? "Update" : "Add"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="border border-red-500/50 bg-black text-white">
          <DialogHeader>
            <Logo variant="compact" showLink={false} className="justify-center mb-1" />
            <Badge className="bg-gradient-to-r from-red-500/30 via-red-600/25 to-red-500/30 border border-red-500/40 text-white backdrop-blur-sm font-[family-name:var(--font-orbitron)] text-xs px-3 py-1 w-fit mx-auto">
              Confirm Deletion
            </Badge>
            <DialogTitle className="text-lg sm:text-xl font-bold tracking-tight font-[family-name:var(--font-orbitron)] text-white text-center pt-1">
              Delete Personal Record?
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-zinc-500 text-center font-light">
              Are you sure you want to delete this personal record? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 p-3 rounded-lg border border-red-500/50 bg-black/30">
            <div className="flex items-start gap-2">
              <AlertTriangle className="size-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-red-400 font-[family-name:var(--font-orbitron)] font-semibold mb-1">
                  Warning
                </p>
                <p className="text-xs text-zinc-400 font-light">
                  This will permanently remove the personal record from your profile.
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2 sm:gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowDeleteConfirm(false);
                setRecordToDelete(null);
              }}
              className="flex-1 border-red-500/50 bg-black/30 text-white hover:bg-black/50 hover:border-red-500/70"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={confirmDelete}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
