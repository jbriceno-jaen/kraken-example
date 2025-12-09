"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/logo";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { UserPlus, X } from "lucide-react";
import { formatDateLocal, parseDateLocal } from "@/lib/utils";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  approved: boolean;
  subscriptionExpires: string | null;
  wodEnabled: boolean;
}

interface AddUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editingUser?: User | null;
}

export function AddUserModal({ open, onOpenChange, onSuccess, editingUser }: AddUserModalProps) {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "client",
    subscriptionDays: "",
    wodEnabled: false,
  });
  const [calculatedEndDate, setCalculatedEndDate] = useState<string | null>(null);

  useEffect(() => {
    if (editingUser) {
      const days = editingUser.subscriptionExpires
        ? Math.ceil((parseDateLocal(editingUser.subscriptionExpires).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        : 0;
      setFormData({
        name: editingUser.name,
        email: editingUser.email,
        password: "", // Don't pre-fill password
        role: editingUser.role,
        subscriptionDays: days > 0 ? days.toString() : "",
        wodEnabled: editingUser.wodEnabled,
      });
      setCalculatedEndDate(editingUser.subscriptionExpires || null);
    } else {
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "client",
        subscriptionDays: "",
        wodEnabled: false,
      });
      setCalculatedEndDate(null);
    }
  }, [editingUser, open]);

  // Calculate end date when subscription days change
  useEffect(() => {
    if (formData.subscriptionDays && formData.role === "client") {
      const days = parseInt(formData.subscriptionDays);
      if (days > 0) {
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + days);
        setCalculatedEndDate(formatDateLocal(endDate));
      } else {
        setCalculatedEndDate(null);
      }
    } else {
      setCalculatedEndDate(null);
    }
  }, [formData.subscriptionDays, formData.role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload: any = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        role: formData.role,
        wodEnabled: formData.wodEnabled,
      };

      // Only include password if creating new user or if password is provided
      if (!editingUser || formData.password) {
        if (!formData.password || formData.password.length < 6) {
          showToast("Password must be at least 6 characters", "error");
          setIsLoading(false);
          return;
        }
        payload.password = formData.password;
      }

      // Add subscription days if provided
      if (formData.subscriptionDays && formData.role === "client") {
        const days = parseInt(formData.subscriptionDays);
        if (days > 0) {
          payload.subscriptionDays = days;
        }
      }

      const url = editingUser ? `/api/manager/users/${editingUser.id}` : "/api/manager/users";
      const method = editingUser ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        showToast(
          editingUser ? "User updated successfully" : "User created successfully",
          "success"
        );
        onSuccess();
        onOpenChange(false);
        setFormData({
          name: "",
          email: "",
          password: "",
          role: "client",
          subscriptionDays: "",
          wodEnabled: false,
        });
      } else {
        showToast(data.error || "Error saving user", "error");
      }
    } catch (error) {
      console.error("Error saving user:", error);
      showToast("Error saving user", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border border-red-500/50 bg-black text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <Logo variant="compact" showLink={false} className="justify-center mb-1" />
          <Badge className="bg-gradient-to-r from-red-500/30 via-red-600/25 to-red-500/30 border border-red-500/40 text-white backdrop-blur-sm font-[family-name:var(--font-orbitron)] text-xs px-3 py-1 w-fit mx-auto">
            {editingUser ? "Edit User" : "Add User"}
          </Badge>
          <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight font-[family-name:var(--font-orbitron)] bg-gradient-to-br from-white via-white to-zinc-300 bg-clip-text text-transparent text-center pt-1">
            {editingUser ? "Edit User" : "New User"}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-zinc-400 text-center">
            {editingUser ? "Modify user information" : "Create a new user in the system"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-white font-[family-name:var(--font-orbitron)]">
              Full Name *
            </label>
            <Input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Doe"
              className="border-red-500/50 bg-black/30 text-white placeholder:text-zinc-500 focus:border-red-500/70 focus:ring-2 focus:ring-red-500/20"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs sm:text-sm font-medium text-white font-[family-name:var(--font-orbitron)]">
              Email *
            </label>
            <Input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="user@example.com"
              className="border-red-500/50 bg-black/30 text-white placeholder:text-zinc-500 focus:border-red-500/70 focus:ring-2 focus:ring-red-500/20"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-xs sm:text-sm font-medium text-white font-[family-name:var(--font-orbitron)]">
              Password {editingUser ? "(leave empty to keep unchanged)" : "*"}
            </label>
            <Input
              id="password"
              type="password"
              required={!editingUser}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder={editingUser ? "New password (optional)" : "Minimum 6 characters"}
              className="border-red-500/50 bg-black/30 text-white placeholder:text-zinc-500 focus:border-red-500/70 focus:ring-2 focus:ring-red-500/20"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="role" className="text-xs sm:text-sm font-medium text-white font-[family-name:var(--font-orbitron)]">
              Role *
            </label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full min-h-[48px] sm:h-12 text-base sm:text-sm border border-red-500/50 bg-black text-white rounded-md px-4 focus:border-red-500/70 focus:ring-2 focus:ring-red-500/20 [&>option]:bg-black [&>option]:text-white"
            >
              <option value="client" className="bg-black text-white">Client</option>
              <option value="manager" className="bg-black text-white">Manager</option>
            </select>
          </div>

          {formData.role === "client" && (
            <>
              <div className="space-y-1.5">
                <label htmlFor="subscriptionDays" className="text-xs sm:text-sm font-medium text-white font-[family-name:var(--font-orbitron)]">
                  Subscription days
                </label>
                <Input
                  id="subscriptionDays"
                  type="number"
                  min="0"
                  value={formData.subscriptionDays}
                  onChange={(e) => setFormData({ ...formData, subscriptionDays: e.target.value })}
                  placeholder="30 (days)"
                  className="border-red-500/50 bg-black/30 text-white placeholder:text-zinc-500 focus:border-red-500/70 focus:ring-2 focus:ring-red-500/20"
                />
                <p className="text-xs text-zinc-500">Leave empty for no subscription</p>
                {calculatedEndDate && (() => {
                  const endDate = parseDateLocal(calculatedEndDate);
                  const now = new Date();
                  const diffTime = endDate.getTime() - now.getTime();
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  
                  let borderColor = "border-green-500/20";
                  let bgColor = "bg-green-500/10";
                  let textColor = "text-green-400";
                  let textColorSecondary = "text-green-300";
                  
                  if (diffDays < 0) {
                    // Expired - Red
                    borderColor = "border-red-500/30";
                    bgColor = "bg-red-500/10";
                    textColor = "text-red-400";
                    textColorSecondary = "text-red-300";
                  } else if (diffDays <= 5) {
                    // Expiring soon (5 days or less) - Yellow
                    borderColor = "border-yellow-500/30";
                    bgColor = "bg-yellow-500/10";
                    textColor = "text-yellow-400";
                    textColorSecondary = "text-yellow-300";
                  }
                  // More than 5 days - Green (default)
                  
                  return (
                    <div className={`mt-2 p-3 rounded-lg border ${borderColor} ${bgColor}`}>
                      <p className={`text-xs ${textColor} font-[family-name:var(--font-orbitron)] font-semibold mb-1`}>
                        Calculated expiration date:
                      </p>
                      <p className={`text-sm ${textColorSecondary} font-[family-name:var(--font-orbitron)]`}>
                        {endDate.toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  );
                })()}
              </div>

              {editingUser && editingUser.subscriptionExpires && (() => {
                const expires = new Date(editingUser.subscriptionExpires);
                const now = new Date();
                const diffTime = expires.getTime() - now.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                const isExpired = diffDays < 0;
                
                if (isExpired) {
                  return (
                    <div className="mb-3 p-3 rounded-lg border border-red-500/30 bg-red-500/10">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-red-500/20 border border-red-500/30 text-red-400 font-[family-name:var(--font-orbitron)] text-xs">
                          Subscription Expired
                        </Badge>
                        <p className="text-xs text-red-400 font-[family-name:var(--font-orbitron)]">
                          This user's subscription has expired
                        </p>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="wodEnabled"
                  checked={formData.wodEnabled}
                  onChange={(e) => setFormData({ ...formData, wodEnabled: e.target.checked })}
                  className="w-5 h-5 rounded border-red-500/50 bg-black/30 text-red-500 focus:ring-2 focus:ring-red-500/20"
                />
                <label htmlFor="wodEnabled" className="text-sm font-medium text-white font-[family-name:var(--font-orbitron)]">
                  Enable PRO (Schedule) for this client
                </label>
              </div>
            </>
          )}

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-red-500/50 bg-black/30 text-white hover:bg-black/50 hover:border-red-500/70"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:opacity-50"
            >
              {isLoading ? "Saving..." : editingUser ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

