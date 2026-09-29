import { useState } from "react";
import { useToast } from "../context/ToastContext.jsx";

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    title: "Welcome to Finsight",
    message: "Your financial dashboard is ready. Add your first transaction or create a budget to start tracking.",
    time: "Just now",
    type: "info",
    read: false,
  },
  {
    id: 2,
    title: "Smart Insights Active",
    message: "Automated spending analysis and category tracking are now enabled for your account.",
    time: "1 hour ago",
    type: "success",
    read: false,
  },
  {
    id: 3,
    title: "Budget Alert",
    message: "Track your monthly limits regularly under the Budgets tab to stay within your targets.",
    time: "Yesterday",
    type: "warn",
    read: true,
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const toast = useToast();

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  }

  function clearAll() {
    setNotifications([]);
    toast.info("Notifications cleared");
  }

  return (
    <div className="px-9 py-9 pb-12">
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="text-[12px] text-ink-3 mt-1">Alerts, budget warnings, and account updates</p>
        </div>
        {notifications.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={markAllRead}
              className="btn-ghost text-[12px] py-1.5 px-3"
            >
              Mark all as read
            </button>
            <button
              onClick={clearAll}
              className="btn-ghost text-[12px] py-1.5 px-3 hover:text-fred"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="card p-12 text-center">
          <i className="ti-bell-off text-[36px] text-cream-3 mb-3 block" />
          <h3 className="font-serif text-[16px] font-semibold text-ink mb-1">No notifications</h3>
          <p className="text-[12px] text-ink-3">You are all caught up!</p>
        </div>
      ) : (
        <div className="card divide-y divide-border overflow-hidden">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 flex items-start gap-4 transition-colors ${
                !n.read ? "bg-cream-2/60" : "hover:bg-cream-2/40"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-[3px] flex items-center justify-center text-[15px] flex-shrink-0 mt-0.5 ${
                  n.type === "success"
                    ? "bg-fgreen-bg text-fgreen"
                    : n.type === "warn"
                    ? "bg-famber-bg text-famber"
                    : "bg-fblue-bg text-fblue"
                }`}
              >
                <i
                  className={
                    n.type === "success"
                      ? "ti-check"
                      : n.type === "warn"
                      ? "ti-alert-triangle"
                      : "ti-info-circle"
                  }
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="text-[13px] font-medium text-ink flex items-center gap-2">
                    {n.title}
                    {!n.read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-fblue" />
                    )}
                  </div>
                  <span className="text-[11px] text-ink-4">{n.time}</span>
                </div>
                <p className="text-[12px] text-ink-3 leading-relaxed">{n.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
