import React from "react";
import { getAllUsersForAdmin, deleteUserByAdmin, toggleUserBan, toggleUserRole, isAdmin } from "@/lib/actions/admin.actions";
import { redirect } from "next/navigation";
import { User, Shield, Book, Trash2, Mail, Calendar, Ban, UserCheck, AlertCircle, RefreshCw } from "lucide-react";

export default async function AdminDashboard() {
  if (!(await isAdmin())) {
    redirect("/");
  }

  const result = await getAllUsersForAdmin();
  const users = result.success ? result.data : [];

  return (
    <main className="wrapper pt-[120px] pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-bold text-[#212a3b] flex items-center gap-3 font-serif">
            <Shield className="text-[#663820]" size={36} />
            Admin Control Center
          </h1>
          <p className="text-[#3d485e] mt-2">
            Manage user roles, access, and monitor system usage.
          </p>
        </div>
        
        <div className="bg-white px-6 py-4 rounded-2xl shadow-soft border border-black/5 flex items-center gap-8">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Total Users</p>
            <p className="text-2xl font-bold text-[#212a3b]">{users.length}</p>
          </div>
          <div className="w-px h-10 bg-gray-100" />
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Live Books</p>
            <p className="text-2xl font-bold text-[#212a3b]">
              {users.reduce((acc: number, u: any) => acc + (u.bookCount || 0), 0)}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-soft-lg border border-black/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#fdfcf6] border-b border-black/5">
                <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-[#212a3b]">User / Status</th>
                <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-[#212a3b]">Contact</th>
                <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-[#212a3b]">Usage</th>
                <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-[#212a3b]">Joined</th>
                <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-[#212a3b] text-right">Access Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {users.map((user: any) => (
                <tr key={user._id} className={`transition-colors group ${user.status === 'banned' ? 'bg-red-50/30' : 'hover:bg-gray-50/50'}`}>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold ${user.role === 'admin' ? 'bg-[#212a3b] text-white' : 'bg-[#f3e4c7] text-[#663820]'}`}>
                        {user.firstName[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-[#212a3b]">
                            {user.firstName} {user.lastName}
                          </p>
                          {user.role === 'admin' && <Shield size={14} className="text-indigo-500" title="Administrator" />}
                          {user.status === 'banned' && <AlertCircle size={14} className="text-red-500" title="Banned User" />}
                        </div>
                        <div className="flex items-center gap-2">
                          <p className={`text-xs capitalize font-bold ${user.role === 'admin' ? 'text-indigo-600' : 'text-gray-400'}`}>
                            {user.role}
                          </p>
                          <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${user.status === 'active' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                            {user.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-sm text-[#3d485e]">
                      <Mail size={14} className="text-gray-300" />
                      {user.email}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-[#212a3b]">
                      <Book size={12} />
                      {user.bookCount || 0} Materials
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm text-[#3d485e]">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-gray-300" />
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-end gap-2">
                      {/* ROLE TOGGLE (Except for master admin email itself if desired, but we check ID) */}
                      {user.email !== 'keith.admin.study@gmail.com' && (
                        <>
                          <form action={async () => {
                            "use server";
                            await toggleUserRole(user._id.toString());
                          }}>
                            <button 
                              className="p-2 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold border border-black/5 text-[#212a3b] hover:bg-white hover:shadow-sm" 
                              title="Change Role"
                            >
                              <RefreshCw size={16} className="text-blue-500" />
                              {user.role === 'admin' ? 'Demote' : 'Promote'}
                            </button>
                          </form>

                          {/* BAN / UNBAN BUTTON */}
                          <form action={async () => {
                            "use server";
                            await toggleUserBan(user._id.toString());
                          }}>
                            <button 
                              className={`p-2 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold border ${
                                user.status === 'active' 
                                  ? 'text-orange-600 border-orange-100 hover:bg-orange-50' 
                                  : 'text-green-600 border-green-100 hover:bg-green-50'
                              }`} 
                              title={user.status === 'active' ? 'Ban User' : 'Unban User'}
                            >
                              {user.status === 'active' ? <Ban size={16} /> : <UserCheck size={16} />}
                              {user.status === 'active' ? 'Ban' : 'Restore'}
                            </button>
                          </form>

                          {/* DELETE BUTTON */}
                          <form action={async () => {
                            "use server";
                            await deleteUserByAdmin(user._id.toString());
                          }}>
                            <button 
                              className="p-2 text-gray-300 hover:text-red-500 transition-colors border border-transparent hover:border-red-100 rounded-lg" 
                              title="Permanently Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </form>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {users.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-gray-400 italic">No users found in the system.</p>
          </div>
        )}
      </div>
    </main>
  );
}
