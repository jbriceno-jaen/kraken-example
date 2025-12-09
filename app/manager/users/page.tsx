"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { Users, UserPlus, Trash2, Edit, CheckCircle2, XCircle, Clock, AlertTriangle, Search, Filter, Mail, Calendar, Shield, Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/logo";
import { useToast } from "@/components/ui/toast";
import { AddUserModal } from "@/components/manager/add-user-modal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

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

type FilterType = "all" | "pending" | "clients" | "managers" | "expired";

export default function UsersPage() {
  const { data: session, status } = useSession();
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState<User | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [userToReject, setUserToReject] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");

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
      showToast("Error loading users", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "manager") {
      fetchUsers();
    }
  }, [status, session]);

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      const res = await fetch(`/api/manager/users/${userToDelete}`, {
        method: "DELETE",
      });

      if (res.ok) {
        const data = await res.json();
        showToast(data.message || "User deleted successfully. All their reservations have been canceled.", "success");
        setShowDeleteConfirm(false);
        setUserToDelete(null);
        fetchUsers();
      } else {
        const { error } = await res.json();
        showToast(error || "Error deleting user", "error");
      }
    } catch (error) {
      showToast("Error deleting user", "error");
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
        showToast(data.message || (approve ? "User approved successfully" : "User rejected successfully. All their reservations have been canceled."), "success");
        if (!approve) {
          setShowRejectConfirm(false);
          setUserToReject(null);
        }
        setTimeout(() => {
          fetchUsers();
        }, 500);
      } else {
        const { error } = await res.json();
        showToast(error || "Error updating user", "error");
      }
    } catch (error) {
      showToast("Error updating user", "error");
    }
  };

  const calculateDaysRemaining = (expires: string | null): number | null => {
    if (!expires) return null;
    const now = new Date();
    const expDate = new Date(expires);
    const diff = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  // Filter and search users
  const filteredUsers = useMemo(() => {
    let filtered = users;

    // Apply filter
    switch (filter) {
      case "pending":
        filtered = filtered.filter(u => u.role === "client" && !u.approved);
        break;
      case "clients":
        filtered = filtered.filter(u => u.role === "client" && u.approved);
        break;
      case "managers":
        filtered = filtered.filter(u => u.role === "manager");
        break;
      case "expired":
        filtered = filtered.filter(u => {
          if (u.role !== "client" || !u.subscriptionExpires) return false;
          const daysRemaining = calculateDaysRemaining(u.subscriptionExpires);
          return daysRemaining !== null && daysRemaining <= 0;
        });
        break;
      default:
        break;
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(u =>
        u.name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [users, filter, searchQuery]);

  const pendingCount = users.filter(u => u.role === "client" && !u.approved).length;
  const clientsCount = users.filter(u => u.role === "client" && u.approved).length;
  const managersCount = users.filter(u => u.role === "manager").length;
  const expiredCount = users.filter(u => {
    if (u.role !== "client" || !u.subscriptionExpires) return false;
    const daysRemaining = calculateDaysRemaining(u.subscriptionExpires);
    return daysRemaining !== null && daysRemaining <= 0;
  }).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="relative size-16">
          <div className="size-full animate-spin rounded-full border-4 border-red-500/20 border-t-red-500" />
          <Users className="absolute left-1/2 top-1/2 size-8 -translate-x-1/2 -translate-y-1/2 text-red-400 animate-pulse" />
        </div>
        <p className="mt-4 text-sm font-semibold text-zinc-400 font-[family-name:var(--font-orbitron)]">
          Loading users...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-hidden">
      <Card className="bg-black p-4 sm:p-6 lg:p-8 shadow-2xl border border-red-500/50 w-full max-w-[1069px] mx-auto overflow-x-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tighter font-[family-name:var(--font-orbitron)] text-white">
              USER
              <br />
              <span className="text-red-500">MANAGEMENT</span>
            </h2>
            <p className="text-sm sm:text-base text-zinc-500 mt-2 font-light">
              Manage clients and managers in the system
            </p>
          </div>
          <Button
            onClick={() => {
              setShowEditUser(null);
              setShowAddUser(true);
            }}
            className="w-full sm:w-auto bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
          >
            <UserPlus className="mr-2 size-4" />
            Add User
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <Card className="border border-yellow-500/30 bg-yellow-500/5 p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="size-4 text-yellow-400" />
              <p className="text-xs text-zinc-400 font-[family-name:var(--font-orbitron)]">Pending</p>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-yellow-400 font-[family-name:var(--font-orbitron)]">{pendingCount}</p>
          </Card>
          <Card className="border border-blue-500/30 bg-blue-500/5 p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-1">
              <Users className="size-4 text-blue-400" />
              <p className="text-xs text-zinc-400 font-[family-name:var(--font-orbitron)]">Clients</p>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-blue-400 font-[family-name:var(--font-orbitron)]">{clientsCount}</p>
          </Card>
          <Card className="border border-red-500/30 bg-red-500/5 p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="size-4 text-red-400" />
              <p className="text-xs text-zinc-400 font-[family-name:var(--font-orbitron)]">Managers</p>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-red-400 font-[family-name:var(--font-orbitron)]">{managersCount}</p>
          </Card>
          <Card className="border border-orange-500/30 bg-orange-500/5 p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="size-4 text-orange-400" />
              <p className="text-xs text-zinc-400 font-[family-name:var(--font-orbitron)]">Expired</p>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-orange-400 font-[family-name:var(--font-orbitron)]">{expiredCount}</p>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
          <div className="flex-1 relative min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500 z-10 pointer-events-none" />
            <Input
              type="text"
              placeholder="Search name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="!pl-11 pr-4 border-red-500/20 bg-black/30 text-white placeholder:text-zinc-500 focus:border-red-500/50 w-full min-w-0"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 -mx-1 px-1 sm:mx-0 sm:px-0">
            {(["all", "pending", "clients", "managers", "expired"] as FilterType[]).map((filterType) => (
              <Button
                key={filterType}
                variant="outline"
                size="sm"
                onClick={() => setFilter(filterType)}
                className={cn(
                  "whitespace-nowrap flex-shrink-0 border-red-500/20 bg-black/30 text-white hover:bg-red-500/10 hover:border-red-500/40",
                  filter === filterType && "bg-red-500/20 border-red-500/50 text-red-400"
                )}
              >
                <Filter className="mr-2 size-3.5" />
                <span className="text-xs sm:text-sm">{filterType.charAt(0).toUpperCase() + filterType.slice(1)}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Pending Users Section */}
        {filter === "all" && pendingCount > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="size-5 text-yellow-400" />
              <h3 className="text-lg font-bold text-white font-[family-name:var(--font-orbitron)]">
                Users Pending Approval
              </h3>
              <Badge className="bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 font-[family-name:var(--font-orbitron)] text-xs">
                {pendingCount}
              </Badge>
            </div>
            <div className="space-y-3">
              {users
                .filter(u => u.role === "client" && !u.approved)
                .map((user) => (
                  <Card
                    key={user.id}
                    className="group border border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 via-black/50 to-black transition-all duration-300 sm:hover:shadow-xl sm:hover:border-yellow-500/40 p-5 sm:p-6 lg:p-7"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="text-lg sm:text-xl font-bold font-[family-name:var(--font-orbitron)] text-white break-words">
                            {user.name}
                          </h3>
                          <Badge className="bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 font-[family-name:var(--font-orbitron)] text-xs flex-shrink-0">
                            Pending
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-400 text-sm mb-2">
                          <Mail className="size-4" />
                          <span className="break-words">{user.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-500 text-xs">
                          <Calendar className="size-3.5" />
                          <span>Registered: {new Date(user.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 sm:flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleApproveUser(user.id, true)}
                          className="flex-1 sm:flex-initial border-green-500/40 bg-green-500/10 text-green-300 hover:bg-green-500/20 hover:border-green-500/50"
                        >
                          <CheckCircle2 className="size-4 sm:size-3.5 mr-2" />
                          <span className="text-sm sm:text-xs">Approve</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setUserToReject(user.id);
                            setShowRejectConfirm(true);
                          }}
                          className="flex-1 sm:flex-initial border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20 hover:border-red-500/50"
                        >
                          <XCircle className="size-4 sm:size-3.5 mr-2" />
                          <span className="text-sm sm:text-xs">Reject</span>
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        )}

        {/* Users List */}
        <div className="space-y-4 sm:space-y-5">
          {filteredUsers.filter(u => filter === "all" ? (u.role === "manager" || u.approved) : true).length > 0 ? (
            filteredUsers
              .filter(u => filter === "all" ? (u.role === "manager" || u.approved) : true)
              .map((user) => {
                const daysRemaining = calculateDaysRemaining(user.subscriptionExpires);
                const isExpired = daysRemaining !== null && daysRemaining <= 0;
                return (
                  <Card
                    key={user.id}
                    className={cn(
                      "group border transition-all duration-300 sm:hover:shadow-xl p-5 sm:p-6 lg:p-7",
                      isExpired
                        ? "border-orange-500/30 bg-orange-500/5 sm:hover:border-orange-500/40"
                        : "border-red-500/50 bg-black/30 sm:hover:border-red-500/70 sm:hover:bg-black/50"
                    )}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="text-lg sm:text-xl font-bold font-[family-name:var(--font-orbitron)] text-white break-words">
                            {user.name}
                          </h3>
                          <Badge
                            className={
                              user.role === "manager"
                                ? "bg-red-500/20 border border-red-500/30 text-red-400 font-[family-name:var(--font-orbitron)] text-xs flex-shrink-0"
                                : "bg-blue-500/20 border border-blue-500/30 text-blue-400 font-[family-name:var(--font-orbitron)] text-xs flex-shrink-0"
                            }
                          >
                            {user.role === "manager" ? "Manager" : "Client"}
                          </Badge>
                          {user.wodEnabled && (
                            <Badge className="bg-green-500/20 border border-green-500/30 text-green-400 font-[family-name:var(--font-orbitron)] text-xs flex-shrink-0">
                              <Crown className="size-3 mr-1" />
                              PRO
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-zinc-400 text-sm mb-2">
                          <Mail className="size-4" />
                          <span className="break-words">{user.email}</span>
                        </div>
                        {user.role === "client" && (
                          <div className="text-sm space-y-1">
                            {daysRemaining !== null ? (
                              <>
                                <div className="flex items-center gap-2 flex-wrap">
                                  {isExpired && (
                                    <Badge className="bg-red-500/20 border border-red-500/30 text-red-400 font-[family-name:var(--font-orbitron)] text-xs">
                                      Expired
                                    </Badge>
                                  )}
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
                                      ? `${daysRemaining} days remaining`
                                      : "Subscription expired"}
                                  </span>
                                </div>
                                {user.subscriptionExpires && (
                                  <div className="text-xs text-zinc-500">
                                    Expires: {new Date(user.subscriptionExpires).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    })}
                                  </div>
                                )}
                              </>
                            ) : (
                              <span className="text-zinc-500">No subscription</span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setShowAddUser(false);
                            setShowEditUser(user);
                          }}
                          className="border-blue-500/40 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 hover:border-blue-500/50"
                        >
                          <Edit className="size-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setUserToDelete(user.id);
                            setShowDeleteConfirm(true);
                          }}
                          className="border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20 hover:border-red-500/50"
                        >
                          <Trash2 className="size-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })
          ) : (
            <Card className="border border-red-500/30 bg-black/30 p-12 text-center">
              <Users className="size-12 mx-auto mb-4 text-zinc-500" />
              <p className="text-zinc-400 text-lg mb-2">No users found</p>
              <p className="text-zinc-500 text-sm">
                {searchQuery || filter !== "all"
                  ? "Try adjusting your search or filter"
                  : "Add a user to get started"}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="border border-red-500/50 bg-black text-white">
          <DialogHeader>
            <Logo variant="compact" showLink={false} className="justify-center mb-1" />
            <Badge className="bg-black border border-red-500/30 text-red-500/90 backdrop-blur-sm font-[family-name:var(--font-orbitron)] text-xs px-3 py-1 w-fit mx-auto">
              Confirm Deletion
            </Badge>
            <DialogTitle className="text-lg sm:text-xl font-bold tracking-tight font-[family-name:var(--font-orbitron)] text-white text-center pt-1">
              Are You Sure?
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-zinc-500 text-center font-light">
              This action cannot be undone. All user reservations will be canceled.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 p-3 rounded-lg border border-red-500/50 bg-black/30">
            <div className="flex items-start gap-2">
              <AlertTriangle className="size-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-red-500 font-[family-name:var(--font-orbitron)] font-semibold mb-1">
                  Warning
                </p>
                <p className="text-xs text-zinc-600 font-light">
                  By deleting this user, all their reservations will be canceled and they will lose access to the system.
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2 sm:gap-3 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowDeleteConfirm(false);
                setUserToDelete(null);
              }}
              className="flex-1 border-red-500/50 bg-black/30 text-white hover:bg-black/50 hover:border-red-500/70"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDeleteUser}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Confirmation Dialog */}
      <Dialog open={showRejectConfirm} onOpenChange={setShowRejectConfirm}>
        <DialogContent className="border border-red-500/50 bg-black text-white">
          <DialogHeader>
            <Logo variant="compact" showLink={false} className="justify-center mb-1" />
            <Badge className="bg-black border border-red-500/30 text-red-500/90 backdrop-blur-sm font-[family-name:var(--font-orbitron)] text-xs px-3 py-1 w-fit mx-auto">
              Confirm Rejection
            </Badge>
            <DialogTitle className="text-lg sm:text-xl font-bold tracking-tight font-[family-name:var(--font-orbitron)] text-white text-center pt-1">
              Reject User?
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-zinc-500 text-center font-light">
              By rejecting this user, all their reservations will be canceled and they will not be able to access the system.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 p-3 rounded-lg border border-red-500/50 bg-black/30">
            <div className="flex items-start gap-2">
              <AlertTriangle className="size-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-red-500 font-[family-name:var(--font-orbitron)] font-semibold mb-1">
                  Warning
                </p>
                <p className="text-xs text-zinc-600 font-light">
                  This action will cancel all user reservations and prevent them from signing in.
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2 sm:gap-3 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowRejectConfirm(false);
                setUserToReject(null);
              }}
              className="flex-1 border-red-500/50 bg-black/30 text-white hover:bg-black/50 hover:border-red-500/70"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => userToReject && handleApproveUser(userToReject, false)}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
            >
              Reject
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
