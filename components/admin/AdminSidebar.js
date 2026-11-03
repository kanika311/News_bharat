"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  FolderTree,
  Tags,
  Radio,
  Tv,
  Video,
  Image,
  Flame,
  Users,
  MessageSquare,
  BadgeDollarSign,
  Layers,
  FileCode,
  FolderArchive,
  Mail,
  Settings,
  History,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/lib/authContext";
import { CMS_PATH } from "@/lib/cms";

const navItems = [
  { label: "Dashboard", href: CMS_PATH, icon: LayoutDashboard },
  { label: "Articles", href: `${CMS_PATH}/articles`, icon: FileText },
  { label: "Categories & Tags", href: `${CMS_PATH}/categories`, icon: FolderTree },
  { label: "Breaking Ticker", href: `${CMS_PATH}/ticker`, icon: Radio },
  { label: "Live Broadcast Studio", href: `${CMS_PATH}/live-broadcast`, icon: Tv },
  { label: "Videos", href: `${CMS_PATH}/videos`, icon: Video },
  { label: "Photo Galleries", href: `${CMS_PATH}/galleries`, icon: Image },
  { label: "Live Blogs", href: `${CMS_PATH}/live-blogs`, icon: Flame },
  { label: "Comments", href: `${CMS_PATH}/comments`, icon: MessageSquare },
  { label: "Homepage Manager", href: `${CMS_PATH}/homepage`, icon: Layers, roles: ["superadmin", "editor"] },
  { label: "Advertisements", href: `${CMS_PATH}/ads`, icon: BadgeDollarSign, roles: ["superadmin", "editor"] },
  { label: "Static Pages", href: `${CMS_PATH}/pages`, icon: FileCode, roles: ["superadmin", "editor"] },
  { label: "Media Library", href: `${CMS_PATH}/media`, icon: FolderArchive },
  { label: "Authors & Roles", href: `${CMS_PATH}/users`, icon: Users, roles: ["superadmin"] },
  { label: "Subscribers", href: `${CMS_PATH}/subscribers`, icon: Mail, roles: ["superadmin", "editor"] },
  { label: "Site Settings", href: `${CMS_PATH}/settings`, icon: Settings, roles: ["superadmin", "editor"] },
  { label: "Activity Logs", href: `${CMS_PATH}/activity`, icon: History, roles: ["superadmin", "editor"] },
];

export default function AdminSidebar({ isOpen, setIsOpen }) {
  const pathname = usePathname();
  const { user } = useAuth();

  const userRole = user?.role || "reporter";

  const filteredNavItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(userRole);
  });

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-slate-900 text-slate-100 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand header */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-slate-800 bg-slate-950">
          <Link href={CMS_PATH} className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="Swar Media"
              className="h-10 w-auto object-contain drop-shadow"
            />
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider bg-slate-800/80 px-2 py-0.5 rounded">
              CMS v2.0
            </span>
          </Link>
        </div>

        {/* User Card */}
        <div className="p-4 mx-3 my-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center gap-3">
          <div className="relative">
            <img
              src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"}
              alt={user?.name || "User"}
              className="w-10 h-10 rounded-full object-cover border border-slate-600"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-white truncate">{user?.name || "News Admin"}</p>
            <span className="inline-block text-[11px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-medium capitalize">
              {user?.role || "reporter"}
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === CMS_PATH
                ? pathname === CMS_PATH
                : pathname.startsWith(item.href) || (item.href === `${CMS_PATH}/categories` && pathname.startsWith(`${CMS_PATH}/tags`));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-red-600 text-white shadow-sm shadow-red-600/30"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
              </Link>
            );
          })}
        </div>

        {/* Footer actions */}
        <div className="p-3 border-t border-slate-800">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-center gap-2 w-full px-3 py-2 text-xs font-semibold text-slate-300 bg-slate-800/80 hover:bg-slate-800 rounded-lg border border-slate-700/60 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-red-400" />
            <span>View Public Website</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
