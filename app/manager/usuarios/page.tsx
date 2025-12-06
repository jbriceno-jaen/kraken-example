"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Users, UserPlus, Trash2, Edit, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { AddUserModal } from "@/components/manager/add-user-modal";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  approved: boolean;
  subscriptionExpires: string | null;
  wodEnabled: boolean;
  createdAt: string;
}

export default function UsuariosPage() {
  const { data: session, status } = useSession();
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/manager/users");
      if (res.ok) {
        const { users: usersData } = await res.json();
        setUsers(usersData);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "manager") {
      fetchUsers();
    }
  }, [status, session]);

  const handleDeleteUser = async (userId: number) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este usuario? Todas sus reservas serán canceladas.")) {
      return;
    }

    try {
      const res = await fetch(`/api/manager/users/${userId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        const data = await res.json();
        showToast(data.message || "Usuario eliminado exitosamente. Todas sus reservas han sido canceladas.", "success");
        fetchUsers();
      } else {
        const { error } = await res.json();
        showToast(error || "Error al eliminar usuario", "error");
      }
    } catch (error) {
      showToast("Error al eliminar usuario", "error");
    }
  };

  const handleApproveUser = async (userId: number, approve: boolean) => {
    try {
      const res = await fetch(`/api/manager/users/${userId}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved: approve }),
      });

      if (res.ok) {
        const data = await res.json();
        showToast(data.message || (approve ? "Usuario aprobado exitosamente" : "Usuario rechazado exitosamente. Todas sus reservas han sido canceladas."), "success");
        // Refresh to show updated state
        setTimeout(() => {
          fetchUsers();
        }, 500);
      } else {
        const { error } = await res.json();
        showToast(error || "Error al actualizar usuario", "error");
      }
    } catch (error) {
      showToast("Error al actualizar usuario", "error");
    }
  };

  const calculateDaysRemaining = (expires: string | null): number | null => {
    if (!expires) return null;
    const now = new Date();
    const expDate = new Date(expires);
    const diff = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="relative size-16">
          <div className="size-full animate-spin rounded-full border-4 border-red-500/30 border-t-red-500" />
          <Users className="absolute left-1/2 top-1/2 size-8 -translate-x-1/2 -translate-y-1/2 text-red-400 animate-pulse" />
        </div>
        <p className="mt-4 text-sm font-semibold text-zinc-400 font-[family-name:var(--font-orbitron)]">
          Cargando usuarios...
        </p>
      </div>
    );
  }

  return (
    <>
      <Card className="border border-red-500/20 bg-gradient-to-br from-black via-slate-950 to-black p-4 sm:p-6 lg:p-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <Badge variant="secondary" className="bg-red-500/20 border border-red-500/30 text-white backdrop-blur-sm font-[family-name:var(--font-orbitron)] shadow-lg shadow-red-500/20">
              Usuarios
            </Badge>
            <h2 className="mt-4 text-2xl sm:text-3xl font-bold font-[family-name:var(--font-orbitron)] text-white">
              Gestión de Usuarios
            </h2>
            <p className="text-sm text-zinc-300 mt-2">
              Gestiona clientes y managers del sistema.
            </p>
          </div>
          <Button
            onClick={() => {
              setShowEditUser(null);
              setShowAddUser(true);
            }}
            className="w-full sm:w-auto min-h-[48px] sm:min-h-0 text-base sm:text-sm bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 active:scale-[0.98] transition-all duration-200"
          >
            <UserPlus className="mr-2 size-4" />
            Agregar Usuario
          </Button>
        </div>

        {/* Pending Users Section */}
        {users.filter(u => u.role === "client" && !u.approved).length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="size-5 text-yellow-400" />
              <h3 className="text-lg font-bold text-white font-[family-name:var(--font-orbitron)]">
                Usuarios Pendientes de Aprobación
              </h3>
              <Badge className="bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 font-[family-name:var(--font-orbitron)] text-xs">
                {users.filter(u => u.role === "client" && !u.approved).length}
              </Badge>
            </div>
            <div className="space-y-3">
              {users
                .filter(u => u.role === "client" && !u.approved)
                .map((user) => (
                  <Card
                    key={user.id}
                    className="group border border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 via-black/50 to-black transition-all duration-300 sm:hover:shadow-xl sm:hover:border-yellow-500/40 active:scale-[0.98] p-4 sm:p-5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start sm:items-center gap-3 mb-2">
                          <h3 className="text-lg sm:text-xl font-bold font-[family-name:var(--font-orbitron)] text-white break-words flex-1">
                            {user.name}
                          </h3>
                          <Badge className="bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 font-[family-name:var(--font-orbitron)] text-xs">
                            Pendiente
                          </Badge>
                        </div>
                        <p className="text-zinc-400 text-sm mb-2 break-words">{user.email}</p>
                        <p className="text-xs text-zinc-500">
                          Registrado: {new Date(user.createdAt).toLocaleDateString("es-ES", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="flex gap-2 sm:flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleApproveUser(user.id, true)}
                          className="flex-1 sm:flex-initial min-h-[44px] sm:min-h-[36px] border-green-500/40 bg-green-500/10 text-green-300 hover:bg-green-500/20 hover:border-green-500/50 active:scale-[0.98] transition-all duration-200"
                        >
                          <CheckCircle2 className="size-4 sm:size-3.5 mr-2" />
                          <span className="text-sm sm:text-xs">Aprobar</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (confirm("¿Estás seguro de que quieres rechazar este usuario? Todas sus reservas serán canceladas.")) {
                              handleApproveUser(user.id, false);
                            }
                          }}
                          className="flex-1 sm:flex-initial min-h-[44px] sm:min-h-[36px] border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20 hover:border-red-500/50 active:scale-[0.98] transition-all duration-200"
                        >
                          <XCircle className="size-4 sm:size-3.5 mr-2" />
                          <span className="text-sm sm:text-xs">Rechazar</span>
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        )}

        {/* Approved Users Section */}
        <div className="space-y-3">
          {users.filter(u => u.role === "manager" || u.approved).length > 0 ? (
            users
              .filter(u => u.role === "manager" || u.approved)
              .map((user) => {
              const daysRemaining = calculateDaysRemaining(user.subscriptionExpires);
              return (
                <Card
                  key={user.id}
                  className="group border border-red-500/20 bg-gradient-to-br from-white/5 via-black/50 to-black transition-all duration-300 sm:hover:shadow-xl sm:hover:border-red-500/30 active:scale-[0.98] p-4 sm:p-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start sm:items-center gap-3 mb-2">
                        <h3 className="text-lg sm:text-xl font-bold font-[family-name:var(--font-orbitron)] text-white break-words flex-1">
                          {user.name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                          <Badge
                            className={
                              user.role === "manager"
                                ? "bg-red-500/20 border border-red-500/30 text-red-400 font-[family-name:var(--font-orbitron)] text-xs"
                                : "bg-blue-500/20 border border-blue-500/30 text-blue-400 font-[family-name:var(--font-orbitron)] text-xs"
                            }
                          >
                            {user.role === "manager" ? "Manager" : "Cliente"}
                          </Badge>
                          {user.role === "client" && user.approved && (
                            <Badge className="bg-green-500/20 border border-green-500/30 text-green-400 font-[family-name:var(--font-orbitron)] text-xs">
                              Aprobado
                            </Badge>
                          )}
                          {user.wodEnabled && (
                            <Badge className="bg-green-500/20 border border-green-500/30 text-green-400 font-[family-name:var(--font-orbitron)] text-xs">
                              WOD
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-zinc-400 text-sm mb-2 break-words">{user.email}</p>
                      {user.role === "client" && (
                        <div className="text-sm space-y-1">
                          {daysRemaining !== null ? (
                            <>
                              <div>
                                <span
                                  className={
                                    daysRemaining > 7
                                      ? "text-green-400 font-semibold"
                                      : daysRemaining > 0
                                      ? "text-yellow-400 font-semibold"
                                      : "text-red-400 font-semibold"
                                  }
                                >
                                  {daysRemaining > 0
                                    ? `${daysRemaining} días restantes`
                                    : "Suscripción expirada"}
                                </span>
                              </div>
                              {user.subscriptionExpires && (
                                <div className="text-xs text-zinc-500">
                                  Expira: {new Date(user.subscriptionExpires).toLocaleDateString("es-ES", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}
                                </div>
                              )}
                            </>
                          ) : (
                            <span className="text-zinc-500">Sin suscripción</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 sm:flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowAddUser(false);
                          setShowEditUser(user);
                        }}
                        className="flex-1 sm:flex-initial min-h-[44px] sm:min-h-[36px] border-blue-500/40 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 hover:border-blue-500/50 active:scale-[0.98] transition-all duration-200"
                      >
                        <Edit className="size-4 sm:size-3.5 mr-2" />
                        <span className="text-sm sm:text-xs">Editar</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                        className="min-h-[44px] sm:min-h-[36px] min-w-[44px] sm:min-w-[36px] border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20 hover:border-red-500/50 active:scale-[0.98] transition-all duration-200"
                      >
                        <Trash2 className="size-4 sm:size-3.5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })
          ) : (
            <Card className="border border-white/10 bg-white/5 p-12 text-center">
              <Users className="size-12 mx-auto mb-4 text-zinc-500" />
              <p className="text-zinc-400 text-lg mb-2">No hay usuarios aprobados</p>
              <p className="text-zinc-500 text-sm">
                {users.filter(u => u.role === "client" && !u.approved).length > 0
                  ? "Hay usuarios pendientes de aprobación arriba"
                  : "Agrega un usuario para comenzar"}
              </p>
            </Card>
          )}
        </div>
      </Card>

      <AddUserModal
        open={showAddUser || showEditUser !== null}
        onOpenChange={(open) => {
          if (!open) {
            setShowAddUser(false);
            setShowEditUser(null);
          }
        }}
        onSuccess={() => {
          fetchUsers();
          setShowAddUser(false);
          setShowEditUser(null);
        }}
        editingUser={showEditUser}
      />
    </>
  );
}

