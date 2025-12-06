"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { User, X, Upload, Camera, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/toast";
import { DatePicker } from "@/components/ui/date-picker";
import { formatDateLocal } from "@/lib/utils";

export default function PerfilPage() {
  const { data: session, status } = useSession();
  const { showToast } = useToast();

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    goals: "",
  });
  const [originalProfile, setOriginalProfile] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    goals: "",
  });
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageInputValue, setImageInputValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [passwordChange, setPasswordChange] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const profileRes = await fetch("/api/profile");
      if (profileRes.ok) {
        const { profile: profileData, userEmail } = await profileRes.json();
        const emailFromDB = userEmail || session?.user?.email || "";
        
        if (profileData) {
          let dateOfBirthFormatted = "";
          if (profileData.dateOfBirth) {
            const date = new Date(profileData.dateOfBirth);
            if (!isNaN(date.getTime())) {
              dateOfBirthFormatted = formatDateLocal(date);
            }
          }
          
          const profileFormData = {
            name: profileData.name || "",
            email: emailFromDB,
            phone: profileData.phone || "",
            dateOfBirth: dateOfBirthFormatted,
            goals: profileData.goals || "",
          };
          setProfile(profileFormData);
          setOriginalProfile(profileFormData);
        } else {
          const profileFormData = {
            name: "",
            email: emailFromDB,
            phone: "",
            dateOfBirth: "",
            goals: "",
          };
          setProfile(profileFormData);
          setOriginalProfile(profileFormData);
        }
      }

      const userRes = await fetch("/api/user-data");
      if (userRes.ok) {
        const userData = await userRes.json();
        setProfileImage(userData.image || null);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchProfile();
    }
  }, [status, session]);

  useEffect(() => {
    const handleImageUpdate = () => {
      fetchProfile();
    };
    window.addEventListener("profileImageUpdated", handleImageUpdate);
    return () => {
      window.removeEventListener("profileImageUpdated", handleImageUpdate);
    };
  }, []);

  const handleProfileSave = async () => {
    try {
      const { email, ...profileToSave } = profile;
      
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileToSave),
      });

      if (res.ok) {
        const profileRes = await fetch("/api/profile");
        if (profileRes.ok) {
          const { profile: updatedProfile, userEmail } = await profileRes.json();
          const emailFromDB = userEmail || session?.user?.email || "";
          
          let dateOfBirthFormatted = "";
          if (updatedProfile.dateOfBirth) {
            const date = new Date(updatedProfile.dateOfBirth);
            if (!isNaN(date.getTime())) {
              dateOfBirthFormatted = formatDateLocal(date);
            }
          }
          
          const profileData = {
            name: updatedProfile.name || "",
            email: emailFromDB,
            phone: updatedProfile.phone || "",
            dateOfBirth: dateOfBirthFormatted,
            goals: updatedProfile.goals || "",
          };
          setProfile(profileData);
          setOriginalProfile(profileData);
        }
        setProfileSaved(true);
        showToast("Perfil actualizado exitosamente", "success");
        setTimeout(() => setProfileSaved(false), 1800);
      } else {
        const error = await res.json();
        showToast(error.error || "Error al guardar el perfil", "error");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      showToast("Error al guardar el perfil", "error");
    }
  };

  const handleProfileCancel = async () => {
    try {
      const profileRes = await fetch("/api/profile");
      if (profileRes.ok) {
        const { profile: profileData, userEmail } = await profileRes.json();
        const emailFromDB = userEmail || session?.user?.email || "";
        
        if (profileData) {
          let dateOfBirthFormatted = "";
          if (profileData.dateOfBirth) {
            const date = new Date(profileData.dateOfBirth);
            if (!isNaN(date.getTime())) {
              dateOfBirthFormatted = formatDateLocal(date);
            }
          }
          
          const profileFormData = {
            name: profileData.name || "",
            email: emailFromDB,
            phone: profileData.phone || "",
            dateOfBirth: dateOfBirthFormatted,
            goals: profileData.goals || "",
          };
          setProfile(profileFormData);
          setOriginalProfile(profileFormData);
        } else {
          const profileFormData = {
            name: "",
            email: emailFromDB,
            phone: "",
            dateOfBirth: "",
            goals: "",
          };
          setProfile(profileFormData);
          setOriginalProfile(profileFormData);
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const handleUploadImageFromUrl = async () => {
    if (!imageInputValue.trim()) {
      showToast("Por favor ingresa una URL de imagen", "error");
      return;
    }

    setIsUploadingImage(true);
    try {
      const res = await fetch("/api/profile/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: imageInputValue.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        setProfileImage(data.image);
        setImageInputValue("");
        showToast("Foto de perfil actualizada exitosamente", "success");
        window.dispatchEvent(new Event("profileImageUpdated"));
      } else {
        showToast(data.error || "Error al actualizar foto", "error");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      showToast("Error al actualizar foto", "error");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast("Por favor selecciona un archivo de imagen", "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast("La imagen debe ser menor a 5MB", "error");
      return;
    }

    setIsUploadingImage(true);
    try {
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

          if (res.ok) {
            setProfileImage(data.image);
            showToast("Foto de perfil actualizada exitosamente", "success");
            window.dispatchEvent(new Event("profileImageUpdated"));
          } else {
            showToast(data.error || "Error al actualizar foto", "error");
          }
        } catch (error) {
          console.error("Error uploading image:", error);
          showToast("Error al actualizar foto", "error");
        } finally {
          setIsUploadingImage(false);
        }
      };
      reader.onerror = () => {
        showToast("Error al leer el archivo", "error");
        setIsUploadingImage(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error processing image:", error);
      showToast("Error al procesar la imagen", "error");
      setIsUploadingImage(false);
    }
    
    e.target.value = "";
  };

  const handleRemoveImage = async () => {
    if (!confirm("¿Estás seguro de que quieres eliminar tu foto de perfil?")) {
      return;
    }

    try {
      const res = await fetch("/api/profile/image", {
        method: "DELETE",
      });

      if (res.ok) {
        setProfileImage(null);
        showToast("Foto de perfil eliminada exitosamente", "success");
        window.dispatchEvent(new Event("profileImageUpdated"));
      } else {
        const data = await res.json();
        showToast(data.error || "Error al eliminar foto", "error");
      }
    } catch (error) {
      console.error("Error removing image:", error);
      showToast("Error al eliminar foto", "error");
    }
  };

  const handleChangePassword = async () => {
    if (passwordChange.newPassword !== passwordChange.confirmPassword) {
      showToast("Las contraseñas no coinciden", "error");
      return;
    }

    if (passwordChange.newPassword.length < 6) {
      showToast("La contraseña debe tener al menos 6 caracteres", "error");
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordChange.currentPassword,
          newPassword: passwordChange.newPassword,
        }),
      });

      if (res.ok) {
        showToast("Contraseña actualizada exitosamente", "success");
        setPasswordChange({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        const error = await res.json();
        showToast(error.error || "Error al cambiar la contraseña", "error");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      showToast("Error al cambiar la contraseña", "error");
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="relative size-16">
          <div className="size-full animate-spin rounded-full border-4 border-red-500/30 border-t-red-500" />
          <User className="absolute left-1/2 top-1/2 size-8 -translate-x-1/2 -translate-y-1/2 text-red-400 animate-pulse" />
        </div>
        <p className="mt-4 text-sm font-semibold text-zinc-400 font-[family-name:var(--font-orbitron)]">
          Cargando perfil...
        </p>
      </div>
    );
  }

  return (
    <Card className="border border-red-500/20 bg-gradient-to-br from-black via-slate-950 to-black p-4 sm:p-6 lg:p-8 shadow-2xl">
      <div className="flex items-start justify-between">
        <div>
          <Badge variant="secondary" className="bg-red-500/20 border border-red-500/30 text-white backdrop-blur-sm font-[family-name:var(--font-orbitron)] shadow-lg shadow-red-500/20">
            Perfil
          </Badge>
          <h3 className="mt-4 text-2xl font-bold text-white font-[family-name:var(--font-orbitron)] bg-gradient-to-br from-white via-white to-zinc-300 bg-clip-text text-transparent">
            Actualiza tus datos
          </h3>
          <p className="text-sm text-zinc-300 mt-2">
            Mantén tu información y objetivos al día para tus coach.
          </p>
        </div>
        {profileSaved && (
          <div className="flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-500/10 dark:text-green-100">
            <CheckCircle2 className="size-4" />
            Guardado
          </div>
        )}
      </div>
      
      <div className="mt-6 mb-6 pb-6 border-b border-red-500/20">
        <label className="text-base sm:text-sm font-medium text-white font-[family-name:var(--font-orbitron)] mb-3 block">
          Foto de Perfil
        </label>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative">
            <Avatar className="size-24 sm:size-28 border-2 border-red-500/30">
              <AvatarImage 
                src={profileImage || undefined} 
                alt={profile.name || "Usuario"}
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-br from-red-500/20 to-red-600/20 text-red-400 text-2xl font-bold font-[family-name:var(--font-orbitron)]">
                {profile.name ? profile.name.charAt(0).toUpperCase() : "U"}
              </AvatarFallback>
            </Avatar>
            {profileImage && (
              <button
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 rounded-full bg-red-500/90 hover:bg-red-600 p-1.5 transition-all shadow-lg"
                title="Eliminar foto"
              >
                <X className="size-3 text-white" />
              </button>
            )}
          </div>
          <div className="flex-1 space-y-3">
            <div className="space-y-2">
              <Input
                type="text"
                value={imageInputValue}
                onChange={(e) => setImageInputValue(e.target.value)}
                placeholder="Pega la URL de tu imagen aquí"
                className="min-h-[48px] sm:min-h-0 text-base sm:text-sm border-red-500/20 bg-white/5 text-white placeholder:text-zinc-500 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 transition-all"
              />
              <p className="text-xs text-zinc-500">
                Ingresa una URL de imagen o usa el botón para subir desde tu dispositivo
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={handleUploadImageFromUrl}
                disabled={!imageInputValue.trim() || isUploadingImage}
                className="min-h-[44px] sm:min-h-[40px] bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 text-sm"
              >
                <Upload className="mr-2 size-4" />
                {isUploadingImage ? "Subiendo..." : "Usar URL"}
              </Button>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileUpload}
                  className="hidden"
                  disabled={isUploadingImage}
                />
                <Button
                  type="button"
                  asChild
                  disabled={isUploadingImage}
                  className="min-h-[44px] sm:min-h-[40px] bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:opacity-50 text-sm"
                >
                  <span>
                    <Camera className="mr-2 size-4" />
                    {isUploadingImage ? "Subiendo..." : "Subir Archivo"}
                  </span>
                </Button>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        <div className="grid gap-3 sm:gap-2">
          <label className="text-base sm:text-sm font-medium text-white font-[family-name:var(--font-orbitron)]">Nombre completo</label>
          <Input
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            placeholder="Tu nombre"
            className="min-h-[48px] sm:min-h-0 text-base sm:text-sm border-red-500/20 bg-white/5 text-white placeholder:text-zinc-500 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 transition-all"
          />
        </div>
        <div className="grid gap-3 sm:gap-2">
          <label className="text-base sm:text-sm font-medium text-white font-[family-name:var(--font-orbitron)]">Email</label>
          <Input
            value={profile.email}
            disabled
            className="min-h-[48px] sm:min-h-0 text-base sm:text-sm border-red-500/20 bg-white/5 text-white opacity-60 cursor-not-allowed"
          />
          <p className="text-xs text-zinc-500">El email no se puede modificar</p>
        </div>
        <div className="grid gap-3 sm:gap-2">
          <label className="text-base sm:text-sm font-medium text-white font-[family-name:var(--font-orbitron)]">Teléfono</label>
          <Input
            value={profile.phone}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            placeholder="Tu teléfono"
            className="min-h-[48px] sm:min-h-0 text-base sm:text-sm border-red-500/20 bg-white/5 text-white placeholder:text-zinc-500 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 transition-all"
          />
        </div>
        <div className="grid gap-3 sm:gap-2">
          <label className="text-base sm:text-sm font-medium text-white font-[family-name:var(--font-orbitron)]">Fecha de Nacimiento</label>
          <DatePicker
            value={profile.dateOfBirth}
            onChange={(date) => setProfile({ ...profile, dateOfBirth: date || "" })}
            className="min-h-[48px] sm:min-h-0 text-base sm:text-sm border-red-500/20 bg-white/5 text-white placeholder:text-zinc-500 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 transition-all"
          />
        </div>
        <div className="grid gap-3 sm:gap-2">
          <label className="text-base sm:text-sm font-medium text-white font-[family-name:var(--font-orbitron)]">Objetivos</label>
          <Textarea
            value={profile.goals}
            onChange={(e) => setProfile({ ...profile, goals: e.target.value })}
            placeholder="Define tus objetivos para las próximas 12 semanas."
            rows={4}
            className="min-h-[120px] sm:min-h-0 text-base sm:text-sm border-red-500/20 bg-white/5 text-white placeholder:text-zinc-500 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 transition-all"
          />
        </div>
        
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Button onClick={handleProfileSave} className="w-full sm:w-auto min-h-[48px] sm:min-h-0 text-base sm:text-sm bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 active:scale-[0.98] shadow-lg shadow-red-500/50 transition-all duration-300">
            Guardar cambios
          </Button>
          <Button variant="outline" onClick={handleProfileCancel} className="w-full sm:w-auto min-h-[48px] sm:min-h-0 text-base sm:text-sm border-red-500/30 active:bg-red-500/10 active:border-red-500/50 active:scale-[0.98] transition-all duration-300">
            Cancelar
          </Button>
        </div>
      </div>
            
      <div className="mt-8 pt-8 border-t border-white/10">
        <h4 className="text-lg font-bold text-white font-[family-name:var(--font-orbitron)] mb-4">
          Cambiar Contraseña
        </h4>
        <div className="space-y-4">
          <div className="grid gap-3 sm:gap-2">
            <label className="text-base sm:text-sm font-medium text-white font-[family-name:var(--font-orbitron)]">
              Contraseña Actual
            </label>
            <Input
              type="password"
              value={passwordChange.currentPassword}
              onChange={(e) => setPasswordChange({ ...passwordChange, currentPassword: e.target.value })}
              placeholder="Ingresa tu contraseña actual"
              className="min-h-[48px] sm:min-h-0 text-base sm:text-sm border-red-500/20 bg-white/5 text-white placeholder:text-zinc-500 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 transition-all"
            />
          </div>
          <div className="grid gap-3 sm:gap-2">
            <label className="text-base sm:text-sm font-medium text-white font-[family-name:var(--font-orbitron)]">
              Nueva Contraseña
            </label>
            <Input
              type="password"
              value={passwordChange.newPassword}
              onChange={(e) => setPasswordChange({ ...passwordChange, newPassword: e.target.value })}
              placeholder="Mínimo 6 caracteres"
              className="min-h-[48px] sm:min-h-0 text-base sm:text-sm border-red-500/20 bg-white/5 text-white placeholder:text-zinc-500 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 transition-all"
            />
            <p className="text-xs text-zinc-500">
              La contraseña debe tener al menos 6 caracteres
            </p>
          </div>
          <div className="grid gap-3 sm:gap-2">
            <label className="text-base sm:text-sm font-medium text-white font-[family-name:var(--font-orbitron)]">
              Confirmar Nueva Contraseña
            </label>
            <Input
              type="password"
              value={passwordChange.confirmPassword}
              onChange={(e) => setPasswordChange({ ...passwordChange, confirmPassword: e.target.value })}
              placeholder="Confirma tu nueva contraseña"
              className="min-h-[48px] sm:min-h-0 text-base sm:text-sm border-red-500/20 bg-white/5 text-white placeholder:text-zinc-500 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 transition-all"
            />
          </div>
          <Button
            onClick={handleChangePassword}
            disabled={isChangingPassword}
            className="w-full sm:w-auto min-h-[48px] sm:min-h-0 text-base sm:text-sm bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/50 transition-all duration-300"
          >
            {isChangingPassword ? (
              <>
                <span className="animate-spin">⏳</span>
                Cambiando contraseña...
              </>
            ) : (
              "Cambiar Contraseña"
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}

