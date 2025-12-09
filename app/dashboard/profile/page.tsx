"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { User, Mail, Phone, Target, Calendar, Save, Upload, Lock, X, AlertTriangle } from "lucide-react";
import { Logo } from "@/components/logo";

interface Profile {
  id: number;
  userId: number;
  name: string | null;
  phone: string | null;
  goals: string | null;
  dateOfBirth: string | null;
  image: string | null;
  userEmail: string;
}

export default function ProfilePage() {
  const { showToast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showDeleteImageConfirm, setShowDeleteImageConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    goals: "",
    dateOfBirth: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const fetchProfile = async (showLoadingState = true) => {
    try {
      if (showLoadingState) {
        setLoading(true);
      }
      const res = await fetch("/api/profile");
      const data: any = await res.json();
      
      if (res.ok) {
        // Get image from users table (always available even if profile doesn't exist)
        const userImage = data.image || null;
        
        // Merge image from users table into profile
        if (data.profile) {
          // Profile exists - merge image into it
          const profileWithImage = {
            ...data.profile,
            image: userImage || data.profile.image || null
          };
          setProfile(profileWithImage);
          setFormData({
            name: profileWithImage.name || "",
            phone: profileWithImage.phone || "",
            goals: profileWithImage.goals || "",
            dateOfBirth: profileWithImage.dateOfBirth 
              ? new Date(profileWithImage.dateOfBirth).toISOString().split('T')[0]
              : "",
          });
        } else {
          // No profile exists yet, but we can still show the image if it exists
          if (userImage) {
            setProfile({
              id: 0,
              userId: 0,
              name: null,
              phone: null,
              goals: null,
              dateOfBirth: null,
              image: userImage,
              userEmail: data.userEmail || ""
            });
          } else {
            setProfile(null);
          }
          // Initialize form with empty values
          setFormData({
            name: "",
            phone: "",
            goals: "",
            dateOfBirth: "",
          });
        }
      } else {
        showToast(data.error || "Error loading profile", "error");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      showToast("Error loading profile", "error");
    } finally {
      if (showLoadingState) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast("Please select an image file", "error");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast("Image size must be less than 5MB", "error");
      return;
    }

    setUploadingImage(true);

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        
        try {
          const res = await fetch("/api/profile/image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageUrl: base64String }),
          });

          const data = await res.json();

          if (res.ok && data.image) {
            showToast("Profile image updated successfully", "success");
            // Update profile state immediately with new image from API response
            // This ensures the image persists in the UI
            if (profile) {
              // Update existing profile with new image
              setProfile({
                ...profile,
                image: data.image
              });
            } else {
              // If no profile exists yet, fetch user email first, then create profile with image
              try {
                const profileRes = await fetch("/api/profile");
                const profileData: any = await profileRes.json();
                const userEmail = profileData.userEmail || "";
                setProfile({
                  id: 0,
                  userId: 0,
                  name: null,
                  phone: null,
                  goals: null,
                  dateOfBirth: null,
                  image: data.image,
                  userEmail: userEmail
                });
              } catch (err) {
                // Fallback: create minimal profile with image
                setProfile({
                  id: 0,
                  userId: 0,
                  name: null,
                  phone: null,
                  goals: null,
                  dateOfBirth: null,
                  image: data.image,
                  userEmail: ""
                });
              }
            }
            // Trigger profile image update event for navbar
            window.dispatchEvent(new Event("profileImageUpdated"));
          } else {
            showToast(data.error || "Error uploading image", "error");
          }
        } catch (error) {
          console.error("Error uploading image:", error);
          showToast("Error uploading image", "error");
        } finally {
          setUploadingImage(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error reading file:", error);
      showToast("Error reading image file", "error");
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setShowDeleteImageConfirm(true);
  };

  const confirmRemoveImage = async () => {
    try {
      const res = await fetch("/api/profile/image", {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        showToast("Profile image removed successfully", "success");
        // Update profile state immediately to remove image
        if (profile) {
          setProfile({
            ...profile,
            image: null
          });
        }
        // Trigger profile image update event for navbar
        window.dispatchEvent(new Event("profileImageUpdated"));
        setShowDeleteImageConfirm(false);
      } else {
        showToast(data.error || "Error removing image", "error");
      }
    } catch (error) {
      console.error("Error removing image:", error);
      showToast("Error removing image", "error");
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        showToast("Profile updated successfully", "success");
        fetchProfile();
      } else {
        showToast(data.error || "Error updating profile", "error");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      showToast("Error updating profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast("New passwords do not match", "error");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showToast("Password must be at least 6 characters", "error");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        showToast("Password changed successfully", "success");
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        showToast(data.error || "Error changing password", "error");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      showToast("Error changing password", "error");
    } finally {
      setSaving(false);
    }
  };

  const calculateAge = (dateOfBirth: string): number | null => {
    if (!dateOfBirth) return null;
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="relative size-12">
          <div className="size-full animate-spin rounded-full border-4 border-red-500/20 border-t-red-500" />
          <User className="absolute left-1/2 top-1/2 size-6 -translate-x-1/2 -translate-y-1/2 text-red-400 animate-pulse" />
        </div>
        <p className="mt-3 text-xs font-semibold text-zinc-400 font-[family-name:var(--font-orbitron)]">
          Loading profile...
        </p>
      </div>
    );
  }

  const age = formData.dateOfBirth ? calculateAge(formData.dateOfBirth) : null;

  return (
    <div className="w-full overflow-x-hidden">
      <Card className="bg-black p-4 sm:p-5 lg:p-6 shadow-2xl border border-red-500/50 w-full max-w-2xl mx-auto overflow-x-hidden">
      <div className="mb-4">
        <h1 className="text-xl sm:text-2xl font-bold font-[family-name:var(--font-orbitron)] text-white mb-1">
          My Profile
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400">Manage your profile information</p>
      </div>

      {/* Profile Image Section */}
      <Card className="border border-red-500/50 bg-black/30 p-3 sm:p-4 mb-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="relative flex-shrink-0">
            {profile?.image ? (
              <div className="relative">
                <img
                  src={profile.image}
                  alt="Profile"
                  className="size-16 sm:size-20 rounded-full object-cover border-2 border-red-500/50"
                  onError={(e) => {
                    // If image fails to load, remove it from state
                    console.error("Image failed to load");
                    if (profile) {
                      setProfile({ ...profile, image: null });
                    }
                  }}
                />
                <button
                  onClick={handleRemoveImage}
                  className="absolute -top-1 -right-1 size-5 rounded-full bg-red-500 hover:bg-red-600 border border-red-600 flex items-center justify-center transition-colors"
                >
                  <X className="size-2.5 text-white" />
                </button>
              </div>
            ) : (
              <div className="size-16 sm:size-20 rounded-full bg-red-500/20 border-2 border-red-500/50 flex items-center justify-center">
                <User className="size-8 sm:size-10 text-red-400" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm sm:text-base font-semibold text-white font-[family-name:var(--font-orbitron)] mb-1">
              Profile Picture
            </h3>
            <p className="text-xs text-zinc-400 mb-2">
              Upload a profile image to personalize your account
            </p>
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                variant="outline"
                size="sm"
                className="border-red-500/50 bg-red-500/10 text-red-300 hover:bg-red-500/20 hover:border-red-500/70 text-xs"
              >
                {uploadingImage ? (
                  <>
                    <span className="animate-spin mr-1.5 text-xs">⏳</span>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="size-3 mr-1.5" />
                    Upload Image
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Profile Form */}
      <form onSubmit={handleProfileSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-xs sm:text-sm font-medium text-white font-[family-name:var(--font-orbitron)] flex items-center gap-2">
            <Mail className="size-4 text-red-400" />
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={profile?.userEmail || ""}
            disabled
            className="border-red-500/50 bg-black/30 text-zinc-500 cursor-not-allowed"
          />
          <p className="text-xs text-zinc-500">Email cannot be changed</p>
        </div>

        <div className="space-y-2">
          <label htmlFor="name" className="text-xs sm:text-sm font-medium text-white font-[family-name:var(--font-orbitron)] flex items-center gap-2">
            <User className="size-4 text-red-400" />
            Full Name
          </label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Your full name"
            className="border-red-500/50 bg-black/30 text-white placeholder:text-zinc-500 focus:border-red-500/70 focus:ring-2 focus:ring-red-500/20"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="dateOfBirth" className="text-xs sm:text-sm font-medium text-white font-[family-name:var(--font-orbitron)] flex items-center gap-2">
            <Calendar className="size-4 text-red-400" />
            Date of Birth {age !== null && <span className="text-zinc-500">(Age: {age})</span>}
          </label>
          <Input
            id="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
            className="border-red-500/50 bg-black/30 text-white focus:border-red-500/70 focus:ring-2 focus:ring-red-500/20"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="phone" className="text-xs sm:text-sm font-medium text-white font-[family-name:var(--font-orbitron)] flex items-center gap-2">
            <Phone className="size-4 text-red-400" />
            Phone
          </label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="Your phone number"
            className="border-red-500/50 bg-black/30 text-white placeholder:text-zinc-500 focus:border-red-500/70 focus:ring-2 focus:ring-red-500/20"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="goals" className="text-xs sm:text-sm font-medium text-white font-[family-name:var(--font-orbitron)] flex items-center gap-2">
            <Target className="size-4 text-red-400" />
            Training Goals
          </label>
          <textarea
            id="goals"
            value={formData.goals}
            onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
            placeholder="Describe your training goals..."
            rows={3}
            className="w-full text-sm border border-red-500/50 bg-black/30 text-white placeholder:text-zinc-500 focus:border-red-500/70 focus:ring-2 focus:ring-red-500/20 rounded-md px-3 py-2 resize-none"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-3">
          <Button
            type="submit"
            size="sm"
            disabled={saving}
            className="flex-1 sm:flex-initial bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:opacity-50 text-xs sm:text-sm"
          >
            {saving ? (
              <>
                <span className="animate-spin mr-1.5 text-xs">⏳</span>
                Saving...
              </>
            ) : (
              <>
                <Save className="size-3 sm:size-4 mr-1.5" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Change Password Section */}
      <Card className="border border-red-500/50 bg-black/30 p-3 sm:p-4 mt-4">
        <div className="flex items-center gap-2 mb-3">
          <Lock className="size-4 text-blue-400" />
          <h3 className="text-sm sm:text-base font-semibold text-white font-[family-name:var(--font-orbitron)]">
            Change Password
          </h3>
        </div>
        <p className="text-xs text-zinc-400 mb-3">
          Update your password to keep your account secure
        </p>
        <form onSubmit={handlePasswordSubmit} className="space-y-3">
          <div className="space-y-2">
            <label htmlFor="currentPassword" className="text-xs font-medium text-white font-[family-name:var(--font-orbitron)]">
              Current Password *
            </label>
            <Input
              id="currentPassword"
              type="password"
              required
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              placeholder="Enter current password"
              className="border-red-500/50 bg-black/30 text-white placeholder:text-zinc-500 focus:border-red-500/70 focus:ring-2 focus:ring-red-500/20 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="newPassword" className="text-xs font-medium text-white font-[family-name:var(--font-orbitron)]">
              New Password *
            </label>
            <Input
              id="newPassword"
              type="password"
              required
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              placeholder="Minimum 6 characters"
              className="border-red-500/50 bg-black/30 text-white placeholder:text-zinc-500 focus:border-red-500/70 focus:ring-2 focus:ring-red-500/20 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-xs font-medium text-white font-[family-name:var(--font-orbitron)]">
              Confirm New Password *
            </label>
            <Input
              id="confirmPassword"
              type="password"
              required
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              placeholder="Confirm new password"
              className="border-red-500/50 bg-black/30 text-white placeholder:text-zinc-500 focus:border-red-500/70 focus:ring-2 focus:ring-red-500/20 text-sm"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="submit"
              size="sm"
              disabled={saving}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 text-xs sm:text-sm"
            >
              {saving ? (
                <>
                  <span className="animate-spin mr-1.5 text-xs">⏳</span>
                  Changing...
                </>
              ) : (
                <>
                  <Lock className="size-3 sm:size-4 mr-1.5" />
                  Change Password
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
      </Card>

      {/* Delete Image Confirmation Dialog */}
      <Dialog open={showDeleteImageConfirm} onOpenChange={setShowDeleteImageConfirm}>
        <DialogContent className="border border-red-500/50 bg-black text-white">
          <DialogHeader>
            <Logo variant="compact" showLink={false} className="justify-center mb-1" />
            <Badge className="bg-gradient-to-r from-red-500/30 via-red-600/25 to-red-500/30 border border-red-500/40 text-white backdrop-blur-sm font-[family-name:var(--font-orbitron)] text-xs px-3 py-1 w-fit mx-auto">
              Confirm Removal
            </Badge>
            <DialogTitle className="text-lg sm:text-xl font-bold tracking-tight font-[family-name:var(--font-orbitron)] text-white text-center pt-1">
              Remove Profile Image?
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-zinc-500 text-center font-light">
              Are you sure you want to remove your profile image? This action cannot be undone.
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
                  This will permanently remove your profile image and you'll need to upload a new one if you want to add it back.
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2 sm:gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowDeleteImageConfirm(false);
              }}
              className="flex-1 border-red-500/50 bg-black/30 text-white hover:bg-black/50 hover:border-red-500/70"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={confirmRemoveImage}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
            >
              Remove Image
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}