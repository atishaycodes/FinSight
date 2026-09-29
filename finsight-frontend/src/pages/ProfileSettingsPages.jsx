import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authApi, transactionsApi } from "../api/index.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { ConfirmDialog, Spinner, FormField } from "../components/ui/index.jsx";
import { extractApiError, downloadCsv } from "../utils/index.js";

export function ProfilePage() {
  const { user, setUser, logout } = useAuth();
  const toast   = useToast();
  const navigate = useNavigate();

  const [name,       setName]       = useState(user?.name     ?? "");
  const [currency,   setCurrency]   = useState(user?.currency ?? "INR");
  const [savingProf, setSavingProf] = useState(false);

  const [curPwd,    setCurPwd]    = useState("");
  const [newPwd,    setNewPwd]    = useState("");
  const [confPwd,   setConfPwd]   = useState("");
  const [savingPwd, setSavingPwd] = useState(false);
  const [pwdError,  setPwdError]  = useState("");

  const [confirmDel, setConfirmDel] = useState(false);
  const [deleting,   setDeleting]   = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setCurrency(user.currency || "INR");
    }
  }, [user]);

  async function saveProfile(e) {
    e.preventDefault();
    setSavingProf(true);
    try {
      const updated = await authApi.updateProfile({ name, currency });
      setUser(updated);
      toast.success("Profile saved");
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setSavingProf(false);
    }
  }

  async function changePassword(e) {
    e.preventDefault();
    setPwdError("");
    if (newPwd.length < 8) { setPwdError("New password must be at least 8 characters"); return; }
    if (newPwd !== confPwd) { setPwdError("Passwords do not match"); return; }
    setSavingPwd(true);
    try {
      await authApi.changePassword({ currentPassword: curPwd, newPassword: newPwd });
      toast.success("Password updated");
      setCurPwd(""); setNewPwd(""); setConfPwd("");
    } catch (err) {
      setPwdError(extractApiError(err));
    } finally {
      setSavingPwd(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await authApi.deleteAccount();
      logout();
      navigate("/login");
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setDeleting(false);
    }
  }

  const initials = user?.name
    ? user.name.split(" ").filter(Boolean).map((p) => p[0]).join("").slice(0, 2).toUpperCase()
    : "??";

  return (
    <div className="px-9 py-9 pb-12">
      <h1 className="page-title mb-7">Profile</h1>

      <div className="grid grid-cols-[240px_1fr] gap-6 items-start">
        {/* Sidebar */}
        <div className="card p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-cream-3 border border-border
                          flex items-center justify-center font-serif text-[22px]
                          font-semibold text-ink mx-auto mb-3">
            {initials}
          </div>
          <div className="font-serif text-[16px] font-semibold text-ink">{user?.name}</div>
          <div className="text-[11px] text-ink-3 mt-1 mb-4 truncate">{user?.email}</div>
          {user?.googleId && (
            <div className="inline-flex items-center gap-1.5 bg-fgreen-bg text-fgreen
                            text-[11px] px-2.5 py-1 rounded-[2px] mb-4">
              <i className="ti-brand-google text-[12px]" /> Google linked
            </div>
          )}
          <div className="text-[11px] text-ink-4 border-t border-border pt-4 mt-2">
            Member since{" "}
            {user?.createdAt
              ? new Date(user.createdAt).toLocaleString("default", { month: "long", year: "numeric" })
              : "—"}
          </div>
        </div>

        {/* Forms */}
        <div className="flex flex-col gap-4">
          {/* Personal info */}
          <div className="card p-6">
            <h2 className="font-serif text-[15px] font-semibold text-ink mb-5">
              Personal information
            </h2>
            <form onSubmit={saveProfile} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Full name">
                  <input className="input" value={name}
                    onChange={(e) => setName(e.target.value)} />
                </FormField>
                <FormField label="Email address">
                  <input
                    className="input opacity-60 cursor-not-allowed"
                    value={user?.email ?? ""}
                    disabled
                    readOnly
                  />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Currency">
                  <select className="input" value={currency}
                    onChange={(e) => setCurrency(e.target.value)}>
                    {[["INR","₹ INR"],["USD","$ USD"],["EUR","€ EUR"],["GBP","£ GBP"]].map(([v,l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </FormField>
              </div>
              <div>
                <button type="submit" className="btn-primary" disabled={savingProf}>
                  {savingProf ? <Spinner size={14} /> : "Save changes"}
                </button>
              </div>
            </form>
          </div>

          {/* Change password */}
          <div className="card p-6">
            <h2 className="font-serif text-[15px] font-semibold text-ink mb-5">
              Change password
            </h2>
            <form onSubmit={changePassword} className="flex flex-col gap-4">
              <FormField label="Current password">
                <input className="input" type="password" placeholder="••••••••"
                  value={curPwd} onChange={(e) => setCurPwd(e.target.value)} />
              </FormField>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="New password">
                  <input className="input" type="password" placeholder="Min. 8 characters"
                    value={newPwd} onChange={(e) => setNewPwd(e.target.value)} />
                </FormField>
                <FormField label="Confirm password">
                  <input className="input" type="password" placeholder="Repeat password"
                    value={confPwd} onChange={(e) => setConfPwd(e.target.value)} />
                </FormField>
              </div>
              {pwdError && (
                <p className="text-[12px] text-fred">{pwdError}</p>
              )}
              <div>
                <button type="submit" className="btn-primary" disabled={savingPwd}>
                  {savingPwd ? <Spinner size={14} /> : "Update password"}
                </button>
              </div>
            </form>
          </div>

          {/* Danger zone */}
          <div className="bg-fred-bg border border-fred-bd rounded-[4px] p-5">
            <div className="text-[13px] font-medium text-fred mb-1.5">Danger zone</div>
            <p className="text-[12px] text-[#8a2820] leading-relaxed mb-4">
              Permanently delete your account and all transactions, budgets, and data.
              This action cannot be reversed.
            </p>
            <button className="btn-danger" onClick={() => setConfirmDel(true)}>
              Delete my account
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDel}
        onClose={() => setConfirmDel(false)}
        onConfirm={handleDelete}
        loading={deleting}
        danger
        title="Delete account"
        message="This will permanently delete your account and all your data. Are you absolutely sure?"
      />
    </div>
  );
}

export function SettingsPage() {
  const { user, setUser } = useAuth();
  const toast = useToast();

  const [emailNotif,    setEmailNotif]    = useState(true);
  const [budgetAlerts,  setBudgetAlerts]  = useState(true);
  const [monthlyReport, setMonthlyReport] = useState(false);
  const [aiInsights,    setAiInsights]    = useState(true);
  const [currency,      setCurrency]      = useState(user?.currency || "INR");
  const [dateFormat,    setDateFormat]    = useState("DD/MM/YYYY");
  const [weekStart,     setWeekStart]     = useState("Monday");
  const [saving,        setSaving]        = useState(false);
  const [exporting,     setExporting]     = useState(false);

  useEffect(() => {
    if (user?.currency) setCurrency(user.currency);
  }, [user]);

  async function saveSettings(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (currency !== user?.currency) {
        const updated = await authApi.updateProfile({ currency });
        setUser(updated);
      }
      toast.success("Settings saved successfully");
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleExportCsv() {
    setExporting(true);
    try {
      const res = await transactionsApi.list({ limit: 1000 });
      if (!res.items.length) {
        toast.info("No transactions to export");
        return;
      }
      downloadCsv(res.items, `finsight-all-transactions-${new Date().toISOString().slice(0, 10)}.csv`);
      toast.success(`Exported ${res.items.length} transactions to CSV`);
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setExporting(false);
    }
  }

  function Toggle({ on, onChange }) {
    return (
      <button
        type="button"
        onClick={onChange}
        className={`w-9 h-5 rounded-full relative transition-colors flex-shrink-0
          ${on ? "bg-fgreen" : "bg-border"}`}
      >
        <span
          className={`absolute top-[3px] w-3.5 h-3.5 rounded-full bg-white transition-all
            ${on ? "left-[19px]" : "left-[3px]"}`}
        />
      </button>
    );
  }

  function SRow({ label, sub, children }) {
    return (
      <div className="flex items-center justify-between py-3 border-b border-border last:border-none">
        <div>
          <div className="text-[13px] font-medium text-ink">{label}</div>
          {sub && <div className="text-[11px] text-ink-3 mt-0.5">{sub}</div>}
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className="px-9 py-9 pb-12">
      <h1 className="page-title mb-7">Settings</h1>
      <form onSubmit={saveSettings}>
        <div className="grid grid-cols-2 gap-5">
          <div className="card p-6">
            <h2 className="font-serif text-[15px] font-semibold text-ink mb-1">Notifications</h2>
            <p className="text-[11px] text-ink-3 mb-4">Control when and how Finsight contacts you</p>
            <SRow label="Email summaries" sub="Weekly spending report to your inbox">
              <Toggle on={emailNotif} onChange={() => setEmailNotif((v) => !v)} />
            </SRow>
            <SRow label="Budget alerts" sub="Alert at 80% of any budget limit">
              <Toggle on={budgetAlerts} onChange={() => setBudgetAlerts((v) => !v)} />
            </SRow>
            <SRow label="Monthly reports" sub="Auto-generate end-of-month summary">
              <Toggle on={monthlyReport} onChange={() => setMonthlyReport((v) => !v)} />
            </SRow>
            <SRow label="AI insights" sub="Rule-based tips on dashboard">
              <Toggle on={aiInsights} onChange={() => setAiInsights((v) => !v)} />
            </SRow>
          </div>

          <div className="card p-6">
            <h2 className="font-serif text-[15px] font-semibold text-ink mb-1">Display</h2>
            <p className="text-[11px] text-ink-3 mb-4">Appearance and regional preferences</p>
            <SRow label="Currency" sub="Primary currency for all amounts">
              <select className="input w-auto" value={currency}
                onChange={(e) => setCurrency(e.target.value)}>
                {[["INR","₹ INR"],["USD","$ USD"],["EUR","€ EUR"],["GBP","£ GBP"]].map(([v,l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </SRow>
            <SRow label="Date format" sub="How dates appear across the app">
              <select className="input w-auto" value={dateFormat}
                onChange={(e) => setDateFormat(e.target.value)}>
                <option>DD/MM/YYYY</option>
                <option>MM/DD/YYYY</option>
                <option>YYYY-MM-DD</option>
              </select>
            </SRow>
            <SRow label="Week starts on" sub="First day in calendar views">
              <select className="input w-auto" value={weekStart}
                onChange={(e) => setWeekStart(e.target.value)}>
                <option>Monday</option>
                <option>Sunday</option>
              </select>
            </SRow>
            <SRow label="Dark mode" sub="Coming in next release">
              <Toggle on={false} onChange={() => toast.info("Dark mode will be available in the next release.")} />
            </SRow>
          </div>

          <div className="card p-6 col-span-2">
            <h2 className="font-serif text-[15px] font-semibold text-ink mb-1">Data & privacy</h2>
            <p className="text-[11px] text-ink-3 mb-4">Manage connected accounts and export your data</p>
            <SRow label="Export transactions" sub="Download all your records as CSV">
              <button
                type="button"
                className="btn-primary text-[12px] py-1.5 px-4"
                onClick={handleExportCsv}
                disabled={exporting}
              >
                {exporting ? <Spinner size={12} /> : "Export CSV"}
              </button>
            </SRow>
            <SRow label="Google account" sub="Connected for sign-in">
              <button
                type="button"
                className="btn-ghost text-[12px] py-1.5 px-4"
                onClick={() => toast.info("Google sign-in status is active.")}
              >
                Manage
              </button>
            </SRow>
          </div>
        </div>

        <div className="mt-5">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? <Spinner size={14} /> : "Save preferences"}
          </button>
        </div>
      </form>
    </div>
  );
}
