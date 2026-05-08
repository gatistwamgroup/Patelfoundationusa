import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, Users, DollarSign, TrendingUp,
    Search, Filter, Download, RefreshCw, Mail, Phone, CreditCard,
    CheckCircle2, XCircle, Clock, AlertTriangle, Activity,
    BarChart3, Star, LogOut, Plus, Send, Shield, Bell, Check,
    Trash2, Edit, Menu, X, Ticket, Eye, MapPin
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { toast } from 'sonner';
import { io } from 'socket.io-client';
import { formatDistanceToNow } from 'date-fns';
import { MEDIA } from '@/data/media';

// ─── Types ──────────────────────────────────────────────────────────────────
interface Donation {
    _id: string;
    name: string;
    email: string;
    phone: string;
    amount: number;
    currency: string;
    status: string;
    source: string;
    paymentMethod: string;
    transactionId?: string;
    createdAt: string;
    // New donor fields
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    zip?: string;
    firstName?: string;
    lastName?: string;
    comment?: string;
    isAnonymous?: boolean;
    hideAmount?: boolean;
}
interface Registration {
    _id: string;
    fullName: string;
    email: string;
    phone: string;
    city: string;
    guests: number;
    ticketType: string;
    amount: number;
    currency: string;
    status: string;
    transactionId?: string;
    donationInterest: boolean;
    volunteer: boolean;
    message?: string;
    createdAt: string;
}
interface Inquiry {
    _id: string;
    name: string;
    email: string;
    type: string;
    subject: string;
    message: string;
    status: string;
    source?: string;
    createdAt: string;
}
interface AppNotification {
    _id: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: string;
    data?: {
        donationId?: string;
        registrationId?: string;
        inquiryId?: string;
        email?: string;
        source?: string;
        amount?: number;
        currency?: string;
        paymentMethod?: string;
        status?: string;
    }
}
interface TrendPoint { month: string; revenue: number; count: number; }
interface Subscriber { _id: string; email: string; subscribedAt: string; status: string; source?: string; }
interface EmailLog { _id: string; to: string; subject: string; type: string; status: string; sentAt: string; error?: string; source?: string; }
interface Stats {
    totalRevenue: number; totalDonors: number; avgDonation: number;
    totalTransactions: number; topDonors: Donation[];
    trend: TrendPoint[];
    statusBreakdown: { completed: number; pending: number; failed: number };
    sourceBreakdown: Record<string, number>;
    totalRegistrations?: number;
    completedRegistrations?: number;
    pendingRegistrations?: number;
}

// ─── Mini Bar Chart (white-theme) ────────────────────────────────────────────
const MiniBarChart = ({ data, symbol = '$' }: { data: TrendPoint[], symbol?: string }) => {
    const max = Math.max(...data.map(d => d.revenue), 1);
    return (
        <div className="flex items-end justify-between gap-1 h-32 pt-4">
            {data.map((pt, i) => {
                const revenuePct = (pt.revenue / max) * 100;
                return (
                    <div key={i} className="flex-1 flex flex-col items-center group relative h-full">
                        {/* Hover Value Popover */}
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-10">
                            <div className="bg-black text-[9px] font-black tracking-widest text-white px-2 py-1 rounded shadow-xl whitespace-nowrap">
                                {symbol}{pt.revenue.toLocaleString()}
                            </div>
                        </div>

                        <div className="flex-1 w-full flex items-end justify-center px-0.5">
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${Math.max(revenuePct, 6)}%` }}
                                transition={{ duration: 1, delay: i * 0.1, ease: 'easeOut' }}
                                className={`w-full max-w-[40px] rounded-t-lg transition-all duration-300 cursor-pointer relative overflow-hidden ${
                                    pt.revenue > 0 ? 'bg-black shadow-[0_10px_20px_rgba(0,0,0,0.1)]' : 'bg-gray-100'
                                }`}
                            >
                                {pt.revenue > 0 && (
                                    <motion.div 
                                        animate={{ y: [0, -100] }} 
                                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                        className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-transparent h-[200%]" 
                                    />
                                )}
                            </motion.div>
                        </div>

                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-3 transition-colors group-hover:text-black">{pt.month}</span>
                    </div>
                );
            })}
        </div>
    );
};

// ─── Status Badge ────────────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: string }) => {
    const cfg: Record<string, { cls: string; Icon: any; label: string }> = {
        completed: { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', Icon: CheckCircle2, label: 'Completed' },
        pending: { cls: 'bg-amber-50 text-amber-700 border-amber-200', Icon: Clock, label: 'Pending' },
        failed: { cls: 'bg-red-50 text-red-700 border-red-200', Icon: XCircle, label: 'Failed' },
    };
    const s = cfg[status.toLowerCase()] ?? { cls: 'bg-gray-50 text-gray-500 border-gray-200', Icon: AlertTriangle, label: status };
    return (
        <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${s.cls}`}>
            <s.Icon size={11} />{s.label}
        </span>
    );
};

// ─── KPI Card ────────────────────────────────────────────────────────────────
const KpiCard = ({ label, value, sub, icon: Icon, color }: {
    label: string; value: string; sub: string; icon: any; color: string;
}) => (
    <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow"
    >
        <div className="flex items-start justify-between mb-4">
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">{label}</span>
            <div className={`p-2 rounded-xl ${color}`}><Icon size={15} /></div>
        </div>
        <div className="text-3xl font-black text-gray-900 mb-1">{value}</div>
        <div className="text-xs text-gray-400 font-medium">{sub}</div>
    </motion.div>
);

const MENU_ITEMS = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'transactions', label: 'Transactions', icon: CreditCard },
    { id: 'registrations', label: 'Event Registrations', icon: Ticket },
    { id: 'top-donors', label: 'Top Donors', icon: Star },
    { id: 'inquiries', label: 'Inquiries', icon: Mail },
    { id: 'contacts', label: 'Contacts', icon: Users },
    { id: 'newsletter', label: 'Newsletter', icon: Send },
    { id: 'logs', label: 'Delivery Logs', icon: Shield },
] as const;
type Tab = typeof MENU_ITEMS[number]['id'];

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

// ─── Main ────────────────────────────────────────────────────────────────────
const AdminDashboard = () => {
    const { token, logout } = useAuth();
    const navigate = useNavigate();

    const [donations, setDonations] = useState<Donation[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
    
    // Notifications State
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);

    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<Tab>('overview');
    const [search, setSearch] = useState('');
    const [srcFilter, setSrcFilter] = useState('all');
    const [stsFilter, setStsFilter] = useState('all');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [pendingBTOnly, setPendingBTOnly] = useState(false);
    const [statusUpdating, setStatusUpdating] = useState<string | null>(null);
    const [showManualForm, setShowManualForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [editingDonation, setEditingDonation] = useState<Donation | null>(null);
    const [showBlastForm, setShowBlastForm] = useState(false);
    const [blastLoading, setBlastLoading] = useState(false);
    
    // Delete Security
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [inquiryToDelete, setInquiryToDelete] = useState<string | null>(null);
    const [showInquiryDeleteModal, setShowInquiryDeleteModal] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
    const [editingRegistration, setEditingRegistration] = useState<Registration | null>(null);
    const [showRegistrationEditForm, setShowRegistrationEditForm] = useState(false);
    const [showRegistrationDeleteModal, setShowRegistrationDeleteModal] = useState(false);
    const [registrationToDelete, setRegistrationToDelete] = useState<string | null>(null);

    const authHeader = { Authorization: `Bearer ${token}` };

    const unreadCount = notifications.filter(n => !n.isRead).length;
    const countsByType = {
        DONATION: notifications.filter(n => !n.isRead && n.type === 'DONATION').length,
        REGISTRATION: notifications.filter(n => !n.isRead && n.type === 'REGISTRATION').length,
        INQUIRY: notifications.filter(n => !n.isRead && n.type === 'INQUIRY').length,
        CONTACT: notifications.filter(n => !n.isRead && n.type === 'CONTACT').length,
        NEWSLETTER: notifications.filter(n => !n.isRead && n.type === 'NEWSLETTER').length,
    };

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await api.get('/notifications', { headers: { Authorization: `Bearer ${token}` } });
            if (res.data.success) setNotifications(res.data.data);
        } catch (e) {}
    }, [token]);

    const fetchAll = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        const currentAuth = { Authorization: `Bearer ${token}` };
        try {
            await fetchNotifications();
            const [dRes, sRes, iRes, nRes, lgRes, regRes] = await Promise.all([
                api.get('/donations', { headers: currentAuth }),
                api.get('/donations/stats', { headers: currentAuth }),
                api.get('/inquiries', { headers: currentAuth }).catch(() => ({ data: { success: false, data: [] } })),
                api.get('/newsletter', { headers: currentAuth }).catch(() => ({ data: { success: false, data: [] } })),
                api.get('/logs', { headers: currentAuth }).catch(() => ({ data: { success: false, data: [] } })),
                api.get('/event-registration', { headers: currentAuth }).catch(() => ({ data: { success: false, data: [] } }))
            ]);
            if (dRes.data.success) setDonations(dRes.data.data);
            if (sRes.data.success) setStats(sRes.data.data);
            if (iRes?.data?.success) setInquiries(iRes.data.data);
            if (nRes?.data?.success) setSubscribers(nRes.data.data);
            if (lgRes?.data?.success) setEmailLogs(lgRes.data.data);
            if (regRes?.data?.success) setRegistrations(regRes.data.data);
        } catch (e: any) {
            if (e?.response?.status === 401) { logout(); navigate('/admin/login'); }
            else if (!silent) toast.error('Failed to load data');
        } finally { 
            if (!silent) setLoading(false); 
        }
    }, [token, logout, navigate, fetchNotifications]);

    // Use a ref so the socket hook always calls the latest fetchAll without dependency issues
    const fetchAllRef = useRef(fetchAll);
    useEffect(() => { fetchAllRef.current = fetchAll; }, [fetchAll]);

    useEffect(() => {
        const socket = io(SOCKET_URL);
        
        socket.on('notification', (notif: AppNotification) => {
            setNotifications(prev => [notif, ...prev]);
            toast.success(notif.title, { description: notif.message, icon: <Bell size={14} /> });
            try { new Audio('/notification-pop.mp3').play().catch(() => {}); } catch(e) {}
            
            // Auto refresh background data silently
            if (fetchAllRef.current) fetchAllRef.current(true);
        });

        return () => { socket.disconnect(); };
    }, []);

    const markAsRead = async (id: string) => {
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        try { await api.put(`/notifications/${id}/read`, {}, { headers: authHeader }); } catch (e) {}
    };

    const handleNotificationClick = (notif: AppNotification) => {
        if (!notif.isRead) markAsRead(notif._id);
        setShowNotifications(false);

        // Navigation logic
        if (notif.type === 'DONATION') {
            setTab('transactions');
            if (notif.data?.donationId) {
                // Find the donation and set search to help user find it
                const donation = donations.find(d => d._id === notif.data?.donationId);
                if (donation) {
                    setSearch(donation.name);
                }
            }
        } else if (notif.type === 'REGISTRATION') {
            setTab('registrations');
            if (notif.data?.registrationId) {
                const reg = registrations.find(r => r._id === notif.data?.registrationId);
                if (reg) setSearch(reg.fullName);
            }
        } else if (notif.type === 'INQUIRY') {
            setTab('inquiries');
            if (notif.data?.inquiryId) {
                const inquiry = inquiries.find(i => i._id === notif.data?.inquiryId);
                if (inquiry) setSearch(inquiry.name);
            }
        } else if (notif.type === 'CONTACT') {
            setTab('contacts');
        } else if (notif.type === 'NEWSLETTER') {
            setTab('newsletter');
            if (notif.data?.email) setSearch(notif.data.email);
        }
    };

    const markAllAsRead = async (typeFilter?: string) => {
        if (typeFilter) {
            setNotifications(prev => prev.map(n => n.type === typeFilter ? { ...n, isRead: true } : n));
            try { await api.put('/notifications/read-all', { type: typeFilter }, { headers: authHeader }); } catch (e) {}
        } else {
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            try { await api.put('/notifications/read-all', {}, { headers: authHeader }); } catch (e) {}
        }
    };

    const handleTabChange = (newTab: Tab) => {
        setTab(newTab);
        setSearch('');
        setFromDate('');
        setToDate('');
        setPendingBTOnly(false);
        if (newTab === 'transactions') markAllAsRead('DONATION');
        if (newTab === 'registrations') markAllAsRead('REGISTRATION');
        if (newTab === 'inquiries') markAllAsRead('INQUIRY');
        if (newTab === 'contacts') markAllAsRead('CONTACT');
        if (newTab === 'newsletter') markAllAsRead('NEWSLETTER');
    };

    const handleDeleteDonation = (id: string) => {
        setDeletingId(id);
        setDeleteConfirmText('');
        setShowDeleteModal(true);
    };

    const updateDonationStatus = async (id: string, newStatus: string, extraData = {}) => {
        setStatusUpdating(id);
        try {
            const res = await api.put(`/donations/${id}`, { status: newStatus, ...extraData }, { headers: authHeader });
            if (res.data.success) {
                toast.success(`Donation marked as ${newStatus}`);
                fetchAll(true);
            }
        } catch (e) {
            toast.error("Status update failed");
        } finally {
            setStatusUpdating(null);
        }
    };

    const confirmDeleteDonation = async () => {
        if (deleteConfirmText.toUpperCase() !== 'DELETE') {
            return toast.error("Please type DELETE to confirm");
        }
        if (!deletingId) return;

        try {
            const res = await api.delete(`/donations/${deletingId}`, { headers: authHeader });
            if (res.data.success) {
                toast.success("Donation records removed permanently");
                setShowDeleteModal(false);
                setDeletingId(null);
                fetchAll(true);
            }
        } catch (e) {
            toast.error("Security alert: Deletion operation failed");
        }
    };

    const handleDeleteRegistration = (id: string) => {
        setRegistrationToDelete(id);
        setShowRegistrationDeleteModal(true);
    };

    const confirmDeleteRegistration = async () => {
        if (!registrationToDelete) return;
        try {
            const res = await api.delete(`/event-registration/${registrationToDelete}`, { headers: authHeader });
            if (res.data.success) {
                toast.success("Registration deleted successfully");
                setShowRegistrationDeleteModal(false);
                setRegistrationToDelete(null);
                fetchAll(true);
            }
        } catch (e) {
            toast.error("Failed to delete registration");
        }
    };

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const filtered = donations.filter(d => {
        // Apply Quick Filter for Pending Bank Transfers
        if (pendingBTOnly) {
           return d.paymentMethod === 'BANK_TRANSFER' && d.status === 'pending';
        }

        const ms = srcFilter === 'all' || d.source === srcFilter;
        const mt = stsFilter === 'all' || d.status === stsFilter;
        const mq =
            d.name.toLowerCase().includes(search.toLowerCase()) ||
            d.email.toLowerCase().includes(search.toLowerCase()) ||
            (d.phone && d.phone.includes(search)) ||
            (d.address && d.address.toLowerCase().includes(search.toLowerCase()));

        const createdMs = d.createdAt ? new Date(d.createdAt).getTime() : 0;
        const fromMs = fromDate ? new Date(fromDate).setHours(0, 0, 0, 0) : -Infinity;
        const toMs = toDate ? new Date(toDate).setHours(23, 59, 59, 999) : Infinity;
        const md = createdMs >= fromMs && createdMs <= toMs;

        return ms && mt && mq && md;
    });

    const dynamicStats = useMemo(() => {
        // Logic: BANK_TRANSFER is always INR. PAYPAL is always USD. 
        // Fallback to currency or source if paymentMethod is unknown.
        const isINR = (d: any) => d.paymentMethod === 'BANK_TRANSFER' || d.currency === 'INR' || d.currency === '₹';
        
        const usdComp = filtered.filter(d => !isINR(d) && d.status === 'completed').reduce((s, d) => s + d.amount, 0);
        const inrComp = filtered.filter(d => isINR(d) && d.status === 'completed').reduce((s, d) => s + d.amount, 0);
        const uniqueDonors = new Set(filtered.map(d => d.email.toLowerCase())).size;
        const pendingCount = filtered.filter(d => d.status === 'pending').length;
        const completedCount = filtered.filter(d => d.status === 'completed').length;

        return {
            usdRevenue: usdComp,
            inrRevenue: inrComp,
            donors: uniqueDonors,
            total: filtered.length,
            pending: pendingCount,
            completed: completedCount
        };
    }, [filtered]);

    const dynamicTrend = useMemo(() => {
        const isINR = (d: any) => d.paymentMethod === 'BANK_TRANSFER' || d.currency === 'INR' || d.currency === '₹';
        const showINR = srcFilter === 'INDIA';

        // Select only those matching the target currency type for the trend
        const targetSet = filtered.filter(d => d.status === 'completed' && (showINR ? isINR(d) : !isINR(d)));

        const months = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const mStr = d.toLocaleString('en-US', { month: 'short', year: '2-digit' });
            const monthDon = targetSet.filter(don => {
                const da = new Date(don.createdAt);
                return da.getFullYear() === d.getFullYear() && da.getMonth() === d.getMonth();
            });
            months.push({
                month: mStr,
                revenue: monthDon.reduce((s, don) => s + don.amount, 0),
                count: monthDon.length
            });
        }
        return months;
    }, [filtered, srcFilter]);

    const escapeCSV = (val: any) => {
        if (val === null || val === undefined) return '';
        const str = String(val);
        // If it contains commas, quotes, or newlines, wrap it in quotes and escape internal quotes
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    const exportCSV = () => {
        const isRegistrationTab = tab === 'registrations';
        let headers: string[] = [];
        let dataRows: any[][] = [];
        let fileName = '';

        if (isRegistrationTab) {
            headers = ['Full Name', 'Email', 'Phone', 'City', 'Guests', 'Ticket Type', 'Amount', 'Currency', 'Status', 'Volunteer Interest', 'Donation Interest', 'Message', 'Date', 'Transaction ID'];
            dataRows = registrations.map(r => [
                r.fullName,
                r.email,
                r.phone || '-',
                r.city || '-',
                r.guests,
                r.ticketType,
                r.amount,
                r.currency,
                r.status,
                r.volunteer ? 'Yes' : 'No',
                r.donationInterest ? 'Yes' : 'No',
                r.message || '-',
                new Date(r.createdAt).toLocaleString(),
                r.transactionId || '-'
            ]);
            fileName = `event_registrations_${new Date().toISOString().split('T')[0]}.csv`;
        } else {
            // Default to donations
            const checkINR = (d: any) => d.paymentMethod === 'BANK_TRANSFER' || d.currency === 'INR' || d.currency === '₹';
            headers = ['Name', 'Email', 'Phone', 'Address', 'City', 'State', 'Zip', 'Country', 'Comment', 'Anonymous', 'Amount', 'Currency', 'Status', 'Source', 'Payment Method', 'Date', 'Transaction ID'];
            dataRows = filtered.map(d => [
                d.name,
                d.email,
                d.phone || '-',
                d.address || '-',
                d.city || '-',
                d.state || '-',
                d.zip || '-',
                d.country || '-',
                d.comment || '-',
                d.isAnonymous ? 'Yes' : 'No',
                d.amount,
                checkINR(d) ? 'INR' : 'USD',
                d.status,
                d.source,
                d.paymentMethod || 'UNKNOWN',
                new Date(d.createdAt).toLocaleString(),
                d.transactionId || '-'
            ]);
            fileName = `donations_${new Date().toISOString().split('T')[0]}.csv`;
        }

        const csvContent = [
            headers.join(','),
            ...dataRows.map(row => row.map(escapeCSV).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(`${isRegistrationTab ? 'Registrations' : 'CSV'} exported successfully!`);
    };

    const handleLogout = () => { logout(); navigate('/admin/login', { replace: true }); };

    const markInquiryAsRead = async (id: string, currentStatus: string) => {
        if (currentStatus !== 'new') return;
        setInquiries(prev => prev.map(i => i._id === id ? { ...i, status: 'read' } : i));
        try {
            await api.patch(`/inquiries/${id}/status`, { status: 'read' }, { headers: authHeader });
        } catch (error) {
            toast.error("Failed to mark as read");
            fetchAll();
        }
    };

    const handleDeleteInquiry = (id: string) => {
        setInquiryToDelete(id);
        setShowInquiryDeleteModal(true);
    };

    const confirmDeleteInquiry = async () => {
        if (!inquiryToDelete) return;
        try {
            const res = await api.delete(`/inquiries/${inquiryToDelete}`, { headers: authHeader });
            if (res.data.success) {
                toast.success("Inquiry removed from database");
                setInquiries(prev => prev.filter(i => i._id !== inquiryToDelete));
            }
        } catch (e) {
            toast.error("Deletion failed");
        } finally {
            setShowInquiryDeleteModal(false);
        }
    };

    const handleTabChangeMobile = (id: Tab) => {
        handleTabChange(id);
        setIsSidebarOpen(false);
    };

    const SidebarContent = ({ onSelect = handleTabChange }: { onSelect?: (id: Tab) => void }) => (
        <>
            <div className="p-6 border-b border-gray-50 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-transparent flex items-center justify-center shrink-0">
                    <img src={MEDIA.brand.logo} alt="Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                    <h1 className="text-sm font-black text-gray-900 leading-none">Patel Foundation</h1>
                    <p className="text-[10px] text-gray-400 font-medium mt-1 uppercase tracking-widest">Admin Dashboard</p>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {MENU_ITEMS.map(({ id, label, icon: Icon }) => {
                    let badgeCount = 0;
                    if (id === 'transactions') badgeCount = countsByType.DONATION || 0;
                    if (id === 'registrations') badgeCount = countsByType.REGISTRATION || 0;
                    if (id === 'inquiries') badgeCount = countsByType.INQUIRY || 0;
                    if (id === 'contacts') badgeCount = countsByType.CONTACT || 0;
                    if (id === 'newsletter') badgeCount = countsByType.NEWSLETTER || 0;

                    return (
                        <button
                            key={id}
                            onClick={() => onSelect(id)}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${tab === id ? 'bg-black text-white shadow-md' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <Icon size={16} className={tab === id ? 'text-white' : 'text-gray-400'} />
                                {label}
                            </div>
                            {badgeCount > 0 && (
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${tab === id ? 'bg-white/20 text-white' : 'bg-red-50 text-red-600'
                                    }`}>
                                    {badgeCount}
                                </span>
                            )}
                        </button>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-gray-50">
                <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all text-sm">
                    <LogOut size={16} /> Logout
                </button>
            </div>
        </>
    );

    return (
        <div className="flex h-screen bg-[#F7F7F8] font-sans overflow-hidden">
            {/* ── Desktop Sidebar ── */}
            <aside className="hidden lg:flex w-64 bg-white border-r border-gray-100 flex-col shrink-0 relative z-20">
                <SidebarContent />
            </aside>

            {/* ── Mobile Sidebar Drawer ── */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsSidebarOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] lg:hidden"
                        />
                        <motion.aside 
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 left-0 bottom-0 w-72 bg-white z-[101] lg:hidden flex flex-col shadow-2xl"
                        >
                            <SidebarContent onSelect={handleTabChangeMobile} />
                            <button 
                                onClick={() => setIsSidebarOpen(false)}
                                className="absolute top-5 -right-12 w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-900 shadow-xl lg:hidden"
                            >
                                <X size={20} />
                            </button>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* ── Main Content Area ── */}
            <main className="flex-1 overflow-y-auto relative bg-[#F7F7F8]">
                {/* Mobile Header */}
                <div className="lg:hidden sticky top-0 z-40 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                    <button 
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 -ml-2 text-gray-600 hover:bg-gray-50 rounded-xl"
                    >
                        <Menu size={24} />
                    </button>
                    <div className="flex items-center gap-2">
                        <img src={MEDIA.brand.logo} alt="Logo" className="w-7 h-7 object-contain" />
                        <span className="font-black text-gray-900 text-sm tracking-tight text-right">Patel Admin</span>
                    </div>
                </div>

                {/* Top Action Bar (Desktop Optimized, Mobile Wrapped) */}
                <div className="sticky top-0 lg:top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 sm:px-8 py-4 flex flex-wrap lg:flex-nowrap items-center justify-end gap-3 flex-shrink-0">
                    <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full mr-auto order-1 lg:order-none mb-4 lg:mb-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Digital Shield Active</span>
                    </div>

                    <div className="flex items-center gap-2 order-2 lg:order-none ml-auto mb-4 lg:mb-0">
                        {/* Notification Bell Dropdown */}
                        <div className="relative">
                            <button 
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative p-2.5 bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all shadow-sm flex items-center justify-center"
                            >
                                <Bell size={18} />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </span>
                                )}
                            </button>

                            <AnimatePresence>
                                {showNotifications && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute right-0 top-[calc(100%+8px)] w-[calc(100vw-32px)] sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 flex flex-col max-h-[85vh]"
                                        >
                                            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0">
                                                <h3 className="font-black text-gray-900">Notifications</h3>
                                                {unreadCount > 0 && (
                                                    <button onClick={() => markAllAsRead()} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-gray-900 flex items-center gap-1 transition-colors">
                                                        <Check size={12} /> Mark all read
                                                    </button>
                                                )}
                                            </div>
                                            
                                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                                {notifications.length === 0 ? (
                                                    <div className="p-8 text-center flex flex-col items-center justify-center gap-3">
                                                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
                                                            <Bell size={20} className="text-gray-300" />
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-400">You're all caught up!</span>
                                                    </div>
                                                ) : (
                                                    <div className="divide-y divide-gray-50">
                                                        {(() => {
                                                            // Grouping Logic
                                                            const groups: Record<string, AppNotification[]> = {};
                                                            notifications.forEach(n => {
                                                                const date = new Date(n.createdAt);
                                                                const today = new Date();
                                                                const yesterday = new Date();
                                                                yesterday.setDate(yesterday.getDate() - 1);

                                                                let groupName = 'Older';
                                                                if (date.toDateString() === today.toDateString()) groupName = 'Today';
                                                                else if (date.toDateString() === yesterday.toDateString()) groupName = 'Yesterday';
                                                                else groupName = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                                                                if (!groups[groupName]) groups[groupName] = [];
                                                                groups[groupName].push(n);
                                                            });

                                                            return Object.entries(groups).map(([groupName, items]) => (
                                                                <div key={groupName}>
                                                                    <div className="px-4 py-2 bg-gray-50/80 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-y border-gray-100/50">
                                                                        {groupName}
                                                                    </div>
                                                                    {items.map(notif => (
                                                                        <div 
                                                                            key={notif._id} 
                                                                            onClick={() => handleNotificationClick(notif)}
                                                                            className={`p-4 cursor-pointer transition-all duration-200 border-l-4 ${!notif.isRead ? 'bg-blue-50/40 border-blue-500 hover:bg-blue-50/80' : 'bg-white border-transparent hover:bg-gray-50'}`}
                                                                        >
                                                                            <div className="flex gap-3">
                                                                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                                                                                    notif.type === 'DONATION' ? 'bg-emerald-50 text-emerald-600' : 
                                                                                    notif.type === 'REGISTRATION' ? 'bg-orange-50 text-orange-600' : 
                                                                                    notif.type === 'INQUIRY' ? 'bg-blue-50 text-blue-600' : 
                                                                                    notif.type === 'NEWSLETTER' ? 'bg-purple-50 text-purple-600' :
                                                                                    'bg-gray-50 text-gray-600'
                                                                                }`}>
                                                                                    {notif.type === 'DONATION' ? <DollarSign size={16} /> : 
                                                                                     notif.type === 'REGISTRATION' ? <Ticket size={16} /> : 
                                                                                     notif.type === 'INQUIRY' ? <Mail size={16} /> : 
                                                                                     notif.type === 'NEWSLETTER' ? <Send size={16} /> : 
                                                                                     <Bell size={16} />}
                                                                                </div>
                                                                                <div className="flex-1 min-w-0">
                                                                                    <div className="flex items-center justify-between mb-0.5">
                                                                                        <div className={`text-sm tracking-tight truncate ${!notif.isRead ? 'font-black text-gray-900' : 'font-bold text-gray-600'}`}>
                                                                                            {notif.title}
                                                                                        </div>
                                                                                        {!notif.isRead && <div className="w-2 h-2 rounded-full bg-blue-500 ring-4 ring-blue-50 animate-pulse shrink-0 ml-2" />}
                                                                                    </div>
                                                                                    <div className="text-xs text-gray-500 leading-relaxed font-medium mb-2">
                                                                                        {notif.message}
                                                                                    </div>
                                                                                    <div className="flex items-center flex-wrap gap-2 mt-2">
                                                                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                                                                            <Clock size={10} strokeWidth={3} />
                                                                                            {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                                                                                        </span>
                                                                                        {notif.data?.source && (
                                                                                             <span className="text-[9px] font-black px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded uppercase tracking-wider">
                                                                                                 {notif.data.source}
                                                                                             </span>
                                                                                        )}
                                                                                        {notif.data?.paymentMethod && (
                                                                                             <span className="text-[9px] font-black px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded uppercase tracking-wider border border-emerald-100">
                                                                                                 {notif.data.paymentMethod}
                                                                                             </span>
                                                                                        )}
                                                                                        {notif.data?.status && notif.data.status !== 'completed' && (
                                                                                             <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider border ${
                                                                                                 notif.data.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-red-50 text-red-600 border-red-100'
                                                                                             }`}>
                                                                                                 {notif.data.status}
                                                                                             </span>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ));
                                                        })()}
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>

                        <button onClick={() => fetchAll()} className="p-2.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all border border-transparent hover:border-gray-100" title="Refresh">
                            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>

                    <div className="flex flex-1 lg:flex-none gap-2 order-3 lg:order-none w-full lg:w-auto">
                        <button onClick={() => setShowManualForm(true)} className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-black text-white text-[10px] font-black tracking-widest uppercase rounded-xl hover:bg-gray-900 transition-all shadow-xl shadow-black/10">
                            <Plus size={14} /> Add Transaction
                        </button>
                        <div className="flex border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white shrink-0">
                            <button onClick={exportCSV} className="p-2.5 bg-white text-gray-600 hover:bg-gray-50 flex items-center gap-2" title="Export CSV">
                                <Download size={16} />
                                <span className="text-[10px] font-black uppercase tracking-widest pr-2">Export CSV</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-8 max-w-[1200px] mx-auto pb-24">
                    <AnimatePresence mode="wait">
                        {/* ═══ OVERVIEW ═══════════════════════════════════════════ */}
                        {tab === 'overview' && (
                            <motion.div key="ov" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                {/* KPIs */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                    <motion.div
                                        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                                        className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col justify-between"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">Total Revenue</span>
                                            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600"><DollarSign size={15} /></div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-2xl font-black text-gray-900">${dynamicStats.usdRevenue.toLocaleString()} <span className="text-[10px] text-gray-400 font-bold">USD</span></div>
                                            {dynamicStats.inrRevenue > 0 && (
                                                <div className="text-lg font-bold text-emerald-600">₹{dynamicStats.inrRevenue.toLocaleString()} <span className="text-[10px] text-emerald-400 font-bold">INR</span></div>
                                            )}
                                        </div>
                                    </motion.div>

                                    <KpiCard label="Unique Donors" value={dynamicStats.donors.toString()} sub="filtered supporters" icon={Users} color="bg-blue-50 text-blue-600" />
                                    
                                    <KpiCard 
                                        label="Event Registrations" 
                                        value={(stats?.totalRegistrations ?? 0).toString()} 
                                        sub={`${stats?.completedRegistrations ?? 0} confirmed seats`} 
                                        icon={Ticket} 
                                        color="bg-orange-50 text-orange-600" 
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-amber-500">Pending</span>
                                                <Clock size={12} className="text-amber-500" />
                                            </div>
                                            <div className="text-2xl font-black text-gray-900">{dynamicStats.pending}</div>
                                        </div>
                                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Completed</span>
                                                <CheckCircle2 size={12} className="text-emerald-500" />
                                            </div>
                                            <div className="text-2xl font-black text-gray-900">{dynamicStats.completed}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                    {/* Chart */}
                                    <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                                        <div className="flex items-center justify-between mb-6">
                                            <div>
                                                <h3 className="font-black text-gray-900 text-sm">Revenue Trend</h3>
                                                <p className="text-gray-400 text-xs mt-0.5">Last 6 months · completed only</p>
                                            </div>
                                            <span className="text-[10px] text-gray-300 font-black uppercase tracking-widest">{srcFilter === 'INDIA' ? 'INR' : 'USD'}</span>
                                        </div>
                                        {loading ? <div className="h-28 bg-gray-50 rounded-xl animate-pulse" />
                                            : <MiniBarChart data={dynamicTrend} symbol={srcFilter === 'INDIA' ? '₹' : '$'} />}
                                    </div>

                                    {/* Breakdown */}
                                    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                                        <h3 className="font-black text-gray-900 text-sm mb-6">Status Breakdown</h3>
                                        {loading ? <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-10 bg-gray-50 rounded-xl animate-pulse" />)}</div>
                                            : (
                                                <div className="space-y-5">
                                                    {[
                                                        { key: 'completed', label: 'Completed', bar: 'bg-emerald-400', txt: 'text-emerald-700' },
                                                        { key: 'pending', label: 'Pending', bar: 'bg-amber-400', txt: 'text-amber-700' },
                                                        { key: 'failed', label: 'Failed', bar: 'bg-red-400', txt: 'text-red-700' },
                                                    ].map(({ key, label, bar, txt }) => {
                                                        const cnt = stats?.statusBreakdown?.[key as keyof typeof stats.statusBreakdown] ?? 0;
                                                        const tot = Math.max(stats?.totalTransactions ?? 0, 1);
                                                        const pct = Math.round((cnt / tot) * 100);
                                                        return (
                                                            <div key={key}>
                                                                <div className="flex justify-between mb-1.5">
                                                                    <span className={`text-xs font-bold ${txt}`}>{label}</span>
                                                                    <span className="text-xs font-black text-gray-500">{cnt} <span className="text-gray-300">({pct}%)</span></span>
                                                                </div>
                                                                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                                                                        transition={{ duration: 0.8, ease: 'easeOut' }}
                                                                        className={`h-full rounded-full ${bar}`} />
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                        <div className="mt-8 pt-6 border-t border-gray-50">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">By Source</h4>
                                            {Object.entries(stats?.sourceBreakdown ?? {}).map(([src, cnt]) => (
                                                <div key={src} className="flex justify-between py-1.5">
                                                    <span className="flex items-center gap-2 text-xs text-gray-500 font-bold capitalize"><CreditCard size={12} className="text-gray-300" />{src}</span>
                                                    <span className="text-xs font-black text-gray-700">{cnt as number}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* ═══ TRANSACTIONS ═══════════════════════════════════════ */}
                        {tab === 'transactions' && (
                            <motion.div key="tr" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                {/* Filters */}
                                <div className="flex flex-wrap items-center gap-3 mb-5">
                                    <div className="relative flex-1 min-w-[240px]">
                                        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-350" />
                                        <input placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-gray-400 focus:outline-none text-sm text-gray-900 placeholder:text-gray-300 font-medium transition-all shadow-sm" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Filter size={14} className="text-gray-400" />
                                        {['all', 'USA', 'INDIA'].map(s => (
                                            <button key={s} onClick={() => setSrcFilter(s)}
                                                className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all ${srcFilter === s ? 'bg-black text-white' : 'bg-white border border-gray-200 text-gray-400 hover:border-gray-400'}`}>
                                                {s === 'all' ? 'All Sources' : s}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {['all', 'completed', 'pending', 'failed'].map(s => (
                                            <button key={s} onClick={() => { setStsFilter(s); setPendingBTOnly(false); }}
                                                className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all ${!pendingBTOnly && stsFilter === s ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-400 hover:border-gray-400'}`}>
                                                {s === 'all' ? 'All Status' : s}
                                            </button>
                                        ))}
                                    </div>
                                    <button 
                                        onClick={() => setPendingBTOnly(!pendingBTOnly)}
                                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${
                                            pendingBTOnly ? 'bg-amber-500 text-white border-amber-600 shadow-md scale-105' : 'bg-white text-amber-600 border-amber-100 hover:border-amber-400'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Clock size={14} /> Pending India BT
                                        </div>
                                    </button>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="date"
                                            value={fromDate}
                                            onChange={(e) => setFromDate(e.target.value)}
                                            className="px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all bg-white border border-gray-200 text-gray-600 focus:outline-none"
                                        />
                                        <input
                                            type="date"
                                            value={toDate}
                                            onChange={(e) => setToDate(e.target.value)}
                                            className="px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all bg-white border border-gray-200 text-gray-600 focus:outline-none"
                                        />
                                    </div>
                                    <span className="text-[11px] font-black text-gray-300 uppercase tracking-widest">{filtered.length} results</span>
                                </div>

                                {/* Responsive Transaction List */}
                                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-x-auto">
                                    {/* Desktop Table View */}
                                    <table className="w-full text-sm hidden md:table min-w-[1000px] table-fixed">
                                        <thead>
                                            <tr className="border-b border-gray-50 bg-gray-50/60">
                                                <th className="text-left text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 px-4 py-4 w-[20%]">Donor</th>
                                                <th className="text-left text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 px-4 py-4 w-[12%]">Email</th>
                                                <th className="text-left text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 px-4 py-4 w-[10%]">Amount</th>
                                                <th className="text-left text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 px-4 py-4 w-[10%]">Status</th>
                                                <th className="text-left text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 px-4 py-4 w-[8%]">Source</th>
                                                <th className="text-left text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 px-4 py-4 w-[11%]">Payment</th>
                                                <th className="text-left text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 px-4 py-4 w-[12%]">UTR</th>
                                                <th className="text-left text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 px-4 py-4 w-[10%]">Date</th>
                                                <th className="text-left text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 px-4 py-4 w-[7%]">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loading ? Array.from({ length: 6 }).map((_, i) => (
                                                <tr key={i} className="border-b border-gray-50">
                                                    {[1, 2, 3, 4, 5, 6, 7].map(j => <td key={j} className="px-6 py-5"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>)}
                                                </tr>
                                            )) : filtered.length > 0 ? filtered.map((d, i) => (
                                                <motion.tr key={d._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                                                    className="border-b border-gray-50 hover:bg-gray-50/40 transition-colors">
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-800 text-[11px] font-black shrink-0">
                                                                {d.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="font-bold text-gray-900 flex items-center gap-1.5 truncate">
                                                                    {d.name}
                                                                    {d.isAnonymous && <span className="px-1.5 py-0.5 rounded-sm bg-gray-100 text-gray-500 text-[7px] uppercase tracking-widest font-black">Anon</span>}
                                                                </div>
                                                                {d.address && <div className="text-[9px] text-gray-400 truncate opacity-70">{d.address}</div>}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-[10px] text-gray-500 truncate">{d.email}</td>
                                                    <td className="px-4 py-3">
                                                        <div className="font-black text-gray-900">
                                                            {(d.paymentMethod === 'BANK_TRANSFER' || d.currency === 'INR' || d.currency === '₹') ? '₹' : '$'}
                                                            {d.amount.toLocaleString()}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
                                                            d.source === 'USA' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-orange-50 text-orange-700 border-orange-100'
                                                        }`}>
                                                            {d.source}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
                                                            (d.paymentMethod || 'UNKNOWN') === 'PAYPAL' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-slate-50 text-slate-700 border-slate-100'
                                                        }`}>
                                                            {d.paymentMethod || 'UNKNOWN'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="text-[10px] font-bold text-gray-500 font-mono truncate max-w-[120px]" title={d.transactionId || ''}>
                                                            {d.transactionId || '-'}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="text-[11px] font-bold text-gray-600 whitespace-nowrap">{new Date(d.createdAt).toLocaleDateString()}</div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-1.5">
                                                            {d.paymentMethod === 'BANK_TRANSFER' && d.status === 'pending' ? (
                                                                <>
                                                                    <button 
                                                                        onClick={() => updateDonationStatus(d._id, 'completed', { currency: 'INR' })}
                                                                        disabled={statusUpdating === d._id}
                                                                        className="p-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 shadow-sm transition-all"
                                                                        title="Verify Transfer"
                                                                    >
                                                                        <Check size={14} />
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => updateDonationStatus(d._id, 'failed')}
                                                                        disabled={statusUpdating === d._id}
                                                                        className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 shadow-sm transition-all"
                                                                        title="Reject Transfer"
                                                                    >
                                                                        <X size={14} />
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <button onClick={() => { setEditingDonation(d); setShowEditForm(true); }} className="p-2 text-gray-400 hover:text-blue-600"><Edit size={14} /></button>
                                                                    <button onClick={() => handleDeleteDonation(d._id)} className="p-2 text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            )) : null}
                                        </tbody>
                                    </table>

                                    {/* Mobile Card List View */}
                                    <div className="md:hidden divide-y divide-gray-50">
                                        {loading ? Array.from({ length: 3 }).map((_, i) => (
                                            <div key={i} className="p-6 space-y-4 animate-pulse">
                                                <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-gray-100" /><div className="flex-1 space-y-2"><div className="h-4 bg-gray-100 rounded w-1/3" /><div className="h-3 bg-gray-100 rounded w-1/4" /></div></div>
                                                <div className="h-20 bg-gray-50 rounded-xl" />
                                            </div>
                                        )) : filtered.length > 0 ? filtered.map((d, i) => (
                                            <motion.div key={d._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="p-6">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-2xl bg-black flex items-center justify-center text-white text-sm font-black shadow-lg shadow-black/10">
                                                            {d.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-black text-gray-900">{d.name}</h4>
                                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{new Date(d.createdAt).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <StatusBadge status={d.status} />
                                                </div>
                                                
                                                <div className="bg-gray-50/50 rounded-2xl p-4 space-y-3 mb-4 border border-gray-100 italic">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</span>
                                                        <span className="font-black text-lg text-gray-900">${d.amount.toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Source / Type</span>
                                                        <div className="flex gap-1.5">
                                                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
                                                                d.source === 'USA' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-orange-50 text-orange-700 border-orange-100'
                                                            }`}>{d.source}</span>
                                                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
                                                                (d.paymentMethod || 'UNKNOWN') === 'PAYPAL' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-slate-50 text-slate-700 border-slate-100'
                                                            }`}>{d.paymentMethod || 'UNKNOWN'}</span>
                                                        </div>
                                                    </div>
                                                    {d.transactionId && (
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">UTR / Tx ID</span>
                                                            <span className="text-[10px] font-bold text-gray-600 font-mono">{d.transactionId}</span>
                                                        </div>
                                                    )}
                                                    <div className="pt-2 border-t border-gray-100 flex flex-col gap-1">
                                                        <div className="text-[10px] text-gray-500 font-medium truncate">{d.email}</div>
                                                        {d.phone && <div className="text-[10px] text-gray-500 font-medium">{d.phone}</div>}
                                                    </div>
                                                </div>

                                                <div className="flex gap-2">
                                                    {d.paymentMethod === 'BANK_TRANSFER' && d.status === 'pending' ? (
                                                        <>
                                                            <button 
                                                                onClick={() => updateDonationStatus(d._id, 'completed')}
                                                                disabled={statusUpdating === d._id}
                                                                className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2"
                                                            >
                                                                <Check size={14} /> Verify
                                                            </button>
                                                            <button 
                                                                onClick={() => updateDonationStatus(d._id, 'failed')}
                                                                disabled={statusUpdating === d._id}
                                                                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-500/10 flex items-center justify-center gap-2"
                                                            >
                                                                <X size={14} /> Reject
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button onClick={() => { setEditingDonation(d); setShowEditForm(true); }} className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                                                                <Edit size={14} /> Edit
                                                            </button>
                                                            <button onClick={() => handleDeleteDonation(d._id)} className="flex-1 py-3 bg-white border border-gray-200 text-red-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-50 transition-all flex items-center justify-center gap-2">
                                                                <Trash2 size={14} /> Delete
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )) : (
                                            <div className="text-center py-20 px-8">
                                                <Search size={32} className="mx-auto text-gray-200 mb-4" />
                                                <p className="text-gray-400 font-bold">No transactions found</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* ═══ REGISTRATIONS ═════════════════════════════════════ */}
                        {tab === 'registrations' && (
                            <motion.div key="reg" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                                    <h2 className="font-black text-gray-900 text-xl">Event Registrations</h2>
                                    <div className="flex items-center gap-2">
                                        <div className="relative">
                                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input 
                                                placeholder="Search registrants..." 
                                                value={search} 
                                                onChange={e => setSearch(e.target.value)}
                                                className="pl-9 pr-4 py-2 bg-white border border-gray-100 rounded-xl text-xs focus:ring-2 focus:ring-black/5 outline-none font-bold"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead>
                                                <tr className="border-b border-gray-50 bg-gray-50/40">
                                                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400">Registrant</th>
                                                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400">Contact</th>
                                                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400">Tickets</th>
                                                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400">Amount</th>
                                                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400">Status</th>
                                                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400">Preferences</th>
                                                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400">Date</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {registrations.length === 0 ? (
                                                    <tr><td colSpan={6} className="py-20 text-center text-gray-300 italic font-medium">No registrations found 🎟️</td></tr>
                                                ) : registrations.filter(r => 
                                                    r.fullName.toLowerCase().includes(search.toLowerCase()) || 
                                                    r.email.toLowerCase().includes(search.toLowerCase()) ||
                                                    (r.phone && r.phone.includes(search))
                                                ).map((reg) => (
                                                    <tr key={reg._id} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-black">
                                                                    {reg.fullName.charAt(0).toUpperCase()}
                                                                </div>
                                                                <div className="font-black text-gray-900">{reg.fullName}</div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col">
                                                                <div className="text-xs font-bold text-gray-700">{reg.email}</div>
                                                                <div className="text-[10px] text-gray-400 font-bold">{reg.phone || '—'}</div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-gray-900">{reg.ticketType}</span>
                                                                <span className="text-[10px] text-gray-400">+{reg.guests} Guests</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="font-black text-gray-900">
                                                                {reg.currency === 'INR' ? '₹' : '$'}{reg.amount.toLocaleString()}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4"><StatusBadge status={reg.status} /></td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex gap-1">
                                                                {reg.volunteer && <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[8px] font-black uppercase tracking-widest border border-blue-100">Volunteer</span>}
                                                                {reg.donationInterest && <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase tracking-widest border border-emerald-100">Donor</span>}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-[10px] text-gray-400 font-medium">
                                                                <div className="flex items-center justify-end gap-1">
                                                                    <button 
                                                                        onClick={() => setSelectedRegistration(reg)}
                                                                        className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-all"
                                                                        title="View full details"
                                                                    >
                                                                        <Eye size={14} />
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => { setEditingRegistration(reg); setShowRegistrationEditForm(true); }}
                                                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                                        title="Edit registration"
                                                                    >
                                                                        <Edit size={14} />
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => handleDeleteRegistration(reg._id)}
                                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                                        title="Delete registration"
                                                                    >
                                                                        <Trash2 size={14} />
                                                                    </button>
                                                                </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                        {tab === 'top-donors' && (
                            <motion.div key="td" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-5xl">
                                <h2 className="font-black text-gray-900 text-xl mb-6">Top Donors <span className="text-gray-300 font-medium text-base">(by individual contribution)</span></h2>
                                {loading ? <div className="space-y-3">{[1, 2, 3, 4, 5].map(i => <div key={i} className="h-28 bg-white rounded-3xl border border-gray-100 animate-pulse" />)}</div>
                                    : (stats?.topDonors ?? []).length === 0
                                        ? <div className="text-center py-16 text-gray-300 font-medium">No donor data yet.</div>
                                        : (
                                            <div className="grid grid-cols-1 gap-4">
                                                {(stats?.topDonors ?? []).map((donor, i) => (
                                                    <motion.div key={donor._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                                                        className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                                        <div className="flex flex-col lg:flex-row lg:items-center gap-6 p-6">
                                                            {/* Rank / Medal */}
                                                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl shrink-0 ${i === 0 ? 'bg-amber-50 text-amber-500 border border-amber-200' : i === 1 ? 'bg-slate-50 text-slate-400 border border-slate-200' : i === 2 ? 'bg-orange-50 text-orange-500 border border-orange-200' : 'bg-gray-50 text-gray-300 border border-gray-100'}`}>
                                                                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                                                            </div>
                                                            
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex flex-col sm:flex-row items-center gap-2 mb-2">
                                                                    <span className="font-black text-xl text-gray-900 leading-none">{donor.name}</span>
                                                                    <div className="flex items-center gap-2">
                                                                        {donor.isAnonymous && <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-400 text-[9px] font-black uppercase tracking-widest">Anonymous</span>}
                                                                        <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
                                                                            <CreditCard size={10} className="text-gray-300" /> {donor.source}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                
                                                                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-3 text-xs font-bold leading-none">
                                                                    <div className="text-gray-400 flex items-center gap-1.5 underline decoration-gray-100 underline-offset-4">
                                                                        <Mail size={12} className="text-gray-200" />
                                                                        {donor.email}
                                                                    </div>
                                                                    {donor.phone && (
                                                                        <div className="text-gray-400 flex items-center gap-1.5">
                                                                            <Phone size={12} className="text-gray-200" />
                                                                            {donor.phone}
                                                                        </div>
                                                                    )}
                                                                    <div className="text-emerald-500 flex items-center gap-1.5">
                                                                        <Clock size={12} className="text-emerald-200" />
                                                                        {new Date(donor.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                                    </div>
                                                                </div>
                                                                
                                                                {donor.address && (
                                                                    <div className="text-[11px] text-gray-500 bg-gray-50 px-3 py-1.5 rounded-xl inline-block font-medium border border-gray-100/50">
                                                                        {[donor.address, donor.city, donor.state].filter(Boolean).join(', ')}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Amount & Status */}
                                                            <div className="flex flex-col items-center lg:items-end gap-3 shrink-0 border-t lg:border-t-0 lg:border-l border-gray-50 pt-5 lg:pt-0 lg:pl-10 w-full lg:w-auto">
                                                                <div className="text-center lg:text-right">
                                                                    <div className="text-4xl font-black text-gray-900 leading-none tracking-tight">
                                                                        {(donor.paymentMethod === 'BANK_TRANSFER' || donor.currency === 'INR' || donor.currency === '₹') ? '₹' : '$'}
                                                                        {donor.amount.toLocaleString()}
                                                                    </div>
                                                                    <div className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mt-2">
                                                                        Donation Amount
                                                                    </div>
                                                                </div>
                                                                <StatusBadge status={donor.status} />
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        )}
                            </motion.div>
                        )}

                        {/* ═══ INQUIRIES ═══════════════════════════════════════════ */}
                        {tab === 'inquiries' && (
                            <motion.div key="inq" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-4xl mx-auto">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="font-black text-gray-900 text-xl">Volunteer Applications</h2>
                                    <div className="flex items-center gap-2">
                                        <Filter size={14} className="text-gray-400" />
                                        {['all', 'USA', 'INDIA'].map(s => (
                                            <button key={s} onClick={() => setSrcFilter(s)}
                                                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${srcFilter === s ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white border border-gray-100 text-gray-400 hover:border-gray-300'}`}>
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {inquiries.filter(i => i.type === 'volunteer' && (srcFilter === 'all' || i.source === srcFilter)).length === 0 ? (
                                        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 border-dashed">
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Mail size={24} className="text-gray-300" />
                                            </div>
                                            <h2 className="text-lg font-black text-gray-900">No Inquiries</h2>
                                            <p className="text-gray-400 text-sm mt-2 max-w-sm mx-auto">
                                                When users submit the volunteer form, they will appear here.
                                            </p>
                                        </div>
                                    ) : inquiries.filter(i => i.type === 'volunteer' && (srcFilter === 'all' || i.source === srcFilter)).map(inq => (
                                        <div key={inq._id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black shrink-0">
                                                        {inq.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-gray-900 leading-tight">{inq.name}</h3>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-[10px] uppercase font-bold tracking-widest text-[#d52b1e] bg-[#d52b1e]/10 px-2 py-0.5 rounded-sm">{inq.subject}</span>
                                                            <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${inq.source === 'INDIA' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                                                {inq.source || 'USA'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-sm text-gray-600 mt-3 md:ml-13 pl-4 md:border-l-2 border-gray-100">
                                                    "{inq.message}"
                                                </div>
                                            </div>
                                            <div className="md:w-60 shrink-0 flex flex-col items-start md:items-end md:text-right border-t border-gray-50 pt-4 md:pt-0 md:border-0 mt-4 md:mt-0">
                                                <div className="text-xs font-black text-gray-900 mb-1">{new Date(inq.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                                                <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mb-4">
                                                    <Mail size={12} className="text-gray-400" /> {inq.email}
                                                </div>
                                                
                                                <div className="mt-auto flex items-center gap-2">
                                                    <a
                                                        href={`mailto:${inq.email}?subject=Re: ${inq.subject}`}
                                                        className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border bg-black text-white hover:bg-gray-800 transition-colors shadow-sm"
                                                    >
                                                        Reply
                                                    </a>
                                                    {inq.status === 'new' ? (
                                                        <button
                                                            onClick={() => markInquiryAsRead(inq._id, inq.status)}
                                                            className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100 transition-colors"
                                                        >
                                                            Mark Read
                                                        </button>
                                                    ) : (
                                                        <div className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border bg-gray-50 text-gray-400 border-gray-200">
                                                            Read
                                                        </div>
                                                    )}
                                                    <button 
                                                        onClick={() => handleDeleteInquiry(inq._id)}
                                                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                        title="Deletepermanently"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                        {/* ═══ CONTACTS ════════════════════════════════════════════ */}
                        {tab === 'contacts' && (
                            <motion.div key="con" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-4xl mx-auto">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="font-black text-gray-900 text-xl">General Contact Inquiries</h2>
                                    <div className="flex items-center gap-2">
                                        <Filter size={14} className="text-gray-400" />
                                        {['all', 'USA', 'INDIA'].map(s => (
                                            <button key={s} onClick={() => setSrcFilter(s)}
                                                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${srcFilter === s ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-white border border-gray-100 text-gray-400 hover:border-gray-300'}`}>
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {inquiries.filter(i => i.type !== 'volunteer' && (srcFilter === 'all' || i.source === srcFilter)).length === 0 ? (
                                        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 border-dashed">
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Users size={24} className="text-gray-300" />
                                            </div>
                                            <h2 className="text-lg font-black text-gray-900">No Messages</h2>
                                            <p className="text-gray-400 text-sm mt-2 max-w-sm mx-auto">
                                                General contact messages from the website will appear here.
                                            </p>
                                        </div>
                                    ) : inquiries.filter(i => i.type !== 'volunteer' && (srcFilter === 'all' || i.source === srcFilter)).map(inq => (
                                        <div key={inq._id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-black shrink-0">
                                                        {inq.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-gray-900 leading-tight">{inq.name}</h3>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-[10px] uppercase font-bold tracking-widest text-[#d52b1e] bg-[#d52b1e]/10 px-2 py-0.5 rounded-sm">{inq.subject || 'General Inquiry'}</span>
                                                            <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${inq.source === 'INDIA' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                                                {inq.source || 'USA'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-sm text-gray-600 mt-3 md:ml-13 pl-4 md:border-l-2 border-gray-100">
                                                    "{inq.message}"
                                                </div>
                                            </div>
                                            <div className="md:w-60 shrink-0 flex flex-col items-start md:items-end md:text-right border-t border-gray-50 pt-4 md:pt-0 md:border-0 mt-4 md:mt-0">
                                                <div className="text-xs font-black text-gray-900 mb-1">{new Date(inq.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                                                <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mb-4">
                                                    <Mail size={12} className="text-gray-400" /> {inq.email}
                                                </div>
                                                
                                                <div className="mt-auto flex items-center gap-2">
                                                    <a
                                                        href={`mailto:${inq.email}?subject=Re: Inquiry`}
                                                        className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border bg-black text-white hover:bg-gray-800 transition-colors shadow-sm"
                                                    >
                                                        Reply
                                                    </a>
                                                    {inq.status === 'new' ? (
                                                        <button
                                                            onClick={() => markInquiryAsRead(inq._id, inq.status)}
                                                            className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100 transition-colors"
                                                        >
                                                            Mark Read
                                                        </button>
                                                    ) : (
                                                        <div className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border bg-gray-50 text-gray-400 border-gray-200">
                                                            Read
                                                        </div>
                                                    )}
                                                    <button 
                                                        onClick={() => handleDeleteInquiry(inq._id)}
                                                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                        title="Delete permanently"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* ═══ NEWSLETTER ══════════════════════════════════════════ */}
                        {tab === 'newsletter' && (
                            <motion.div key="nl" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-5xl mx-auto">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h2 className="font-black text-gray-900 text-2xl">Newsletter Management</h2>
                                        <p className="text-gray-400 text-sm mt-1">Connect with your {subscribers.filter(s => s.status === 'active' && (srcFilter === 'all' || s.source === srcFilter)).length} active supporters.</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
                                            {['all', 'USA', 'INDIA'].map(s => (
                                                <button key={s} onClick={() => setSrcFilter(s)}
                                                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${srcFilter === s ? 'bg-black text-white' : 'text-gray-400 hover:text-gray-600'}`}>
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full">
                                            {subscribers.filter(s => s.status === 'active' && (srcFilter === 'all' || s.source === srcFilter)).length} Active
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                                    {/* Email Composer */}
                                    <div className="lg:col-span-3">
                                        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-8">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="p-2.5 bg-black rounded-xl text-white">
                                                    <Send size={18} />
                                                </div>
                                                <h3 className="font-black text-gray-900">Send Update Blast</h3>
                                            </div>

                                            <form onSubmit={async (e) => {
                                                e.preventDefault();
                                                const fd = new FormData(e.currentTarget);
                                                const subject = fd.get('subject') as string;
                                                const message = fd.get('message') as string;
                                                const isTest = (e.nativeEvent as any).submitter.name === 'test';

                                                if (!subject || !message) return toast.error("Please fill all fields");

                                                setBlastLoading(true);
                                                try {
                                                    const res = await api.post('/newsletter/send-blast', { subject, message, isTest }, { headers: authHeader });
                                                    if (res.data.success) {
                                                        toast.success(res.data.message);
                                                        if (!isTest) (e.target as HTMLFormElement).reset();
                                                    }
                                                } catch (err: any) {
                                                    toast.error(err.response?.data?.message || "Failed to send blast");
                                                } finally {
                                                    setBlastLoading(false);
                                                }
                                            }} className="space-y-5">
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Email Subject</label>
                                                    <input name="subject" required placeholder="Important Update from Patel Foundation" className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-black/5 outline-none font-bold text-sm" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Message Content (HTML Supported)</label>
                                                    <textarea name="message" required placeholder="Share your story or updates..." className="w-full px-4 py-4 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-black/5 outline-none font-medium text-sm min-h-[220px] leading-relaxed" />
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                                    <button type="submit" name="test" disabled={blastLoading} className="py-3.5 border border-gray-200 text-gray-600 rounded-2xl font-bold text-xs tracking-widest uppercase hover:bg-gray-50 transition-all">
                                                        Send Test to Self
                                                    </button>
                                                    <button type="submit" name="blast" disabled={blastLoading} className="py-3.5 bg-black text-white rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-neutral-800 transition-all shadow-lg shadow-black/10 flex items-center justify-center gap-2">
                                                        {blastLoading ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                                                        Blast to All Supporters
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>

                                    {/* Subscriber List */}
                                    <div className="lg:col-span-2">
                                        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden flex flex-col h-full max-h-[600px]">
                                            <div className="p-6 border-b border-gray-50 bg-gray-50/30">
                                                <h3 className="font-black text-gray-900 text-sm">Recent Subscribers</h3>
                                            </div>
                                            <div className="flex-1 overflow-y-auto divide-y divide-gray-50 custom-scrollbar">
                                                {subscribers.filter(s => srcFilter === 'all' || s.source === srcFilter).length === 0 ? (
                                                    <div className="p-20 text-center text-gray-300 font-medium italic text-sm">No subscribers matching filter.</div>
                                                ) : (
                                                    subscribers.filter(s => srcFilter === 'all' || s.source === srcFilter).map((sub) => (
                                                        <div key={sub._id} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                                                            <div className="min-w-0">
                                                                <div className="font-bold text-gray-900 truncate text-sm">{sub.email}</div>
                                                                <div className="text-[10px] text-gray-300 font-medium flex items-center gap-2 mt-1">
                                                                    {new Date(sub.subscribedAt).toLocaleDateString()}
                                                                    <span className={`px-1 rounded-[2px] border ${sub.source === 'INDIA' ? 'text-orange-400 border-orange-100' : 'text-blue-400 border-blue-100'}`}>{sub.source || 'USA'}</span>
                                                                </div>
                                                            </div>
                                                            <span className={`shrink-0 text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${sub.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                                                {sub.status}
                                                            </span>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* ═══ LOGS ══════════════════════════════════════════════ */}
                        {tab === 'logs' && (
                            <motion.div key="lg" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-4xl mx-auto">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="font-black text-gray-900 text-xl">Email Delivery Logs</h2>
                                    <div className="flex items-center gap-2">
                                        {['all', 'USA', 'INDIA'].map(s => (
                                            <button key={s} onClick={() => setSrcFilter(s)}
                                                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${srcFilter === s ? 'bg-black text-white' : 'bg-white border border-gray-100 text-gray-400 hover:border-gray-300'}`}>
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
                                    {/* Desktop Logs Table */}
                                    <table className="w-full text-sm hidden md:table">
                                        <thead>
                                            <tr className="border-b border-gray-50 bg-gray-50/40 text-left">
                                                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400">Recipient</th>
                                                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400">Subject</th>
                                                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400">Source</th>
                                                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400">Type</th>
                                                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400">Status</th>
                                                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400">Time</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {emailLogs.filter(l => srcFilter === 'all' || l.source === srcFilter).length === 0 ? (
                                                <tr><td colSpan={6} className="py-20 text-center text-gray-300 italic font-medium">No logs matching filter 🔍</td></tr>
                                            ) : emailLogs.filter(l => srcFilter === 'all' || l.source === srcFilter).map((log) => (
                                                <tr key={log._id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-6 py-4 font-bold text-gray-900">{log.to}</td>
                                                    <td className="px-6 py-4 text-gray-500 font-medium truncate max-w-[200px]">{log.subject}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${log.source === 'INDIA' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                                            {log.source || 'USA'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 border border-gray-100 px-2 py-1 rounded-md">{log.type.replace('_', ' ')}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-1.5">
                                                            <div className={`w-1.5 h-1.5 rounded-full ${log.status === 'sent' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                                            <span className={`text-[10px] font-black uppercase tracking-widest ${log.status === 'sent' ? 'text-emerald-600' : 'text-red-600'}`}>
                                                                {log.status === 'sent' ? 'Delivered' : 'Failed'}
                                                            </span>
                                                        </div>
                                                        {log.error && <div className="text-[8px] text-red-300 font-medium mt-1 max-w-[150px] truncate" title={log.error}>{log.error}</div>}
                                                    </td>
                                                    <td className="px-6 py-4 text-[10px] text-gray-400 font-medium">
                                                        {new Date(log.sentAt).toLocaleString(undefined, { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    {/* Mobile Logs Card List */}
                                    <div className="md:hidden divide-y divide-gray-50">
                                        {emailLogs.length === 0 ? (
                                            <div className="py-20 text-center text-gray-300 italic font-medium">No logs available 🔍</div>
                                        ) : emailLogs.map((log) => (
                                            <div key={log._id} className="p-5 space-y-3 hover:bg-gray-50 transition-colors">
                                                <div className="flex justify-between items-start">
                                                    <div className="min-w-0 flex-1 pr-4">
                                                        <div className="font-black text-gray-900 truncate text-sm">{log.to}</div>
                                                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 truncate">{log.subject}</div>
                                                    </div>
                                                    <div className="flex flex-col items-end shrink-0">
                                                        <div className="flex items-center gap-1.5 mb-1">
                                                            <div className={`w-1.5 h-1.5 rounded-full ${log.status === 'sent' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                                            <span className={`text-[9px] font-black uppercase tracking-widest ${log.status === 'sent' ? 'text-emerald-600' : 'text-red-600'}`}>
                                                                {log.status === 'sent' ? 'Sent' : 'Failed'}
                                                            </span>
                                                        </div>
                                                        <div className="text-[9px] font-bold text-gray-300">
                                                            {new Date(log.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">{log.type.replace('_', ' ')}</span>
                                                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${log.source === 'INDIA' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                                            {log.source || 'USA'}
                                                        </span>
                                                    </div>
                                                    <span className="text-[8px] font-bold text-gray-300 uppercase tracking-widest">{new Date(log.sentAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                                                </div>
                                                {log.error && <div className="p-2 bg-red-50 rounded-lg text-[9px] text-red-500 font-medium leading-relaxed italic border border-red-100/50 pr-8 relative overflow-hidden truncate">{log.error}</div>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* ── Manual Donation Modal ── */}
                <AnimatePresence>
                    {showManualForm && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowManualForm(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative bg-white w-full max-w-lg rounded-[2rem] sm:rounded-3xl shadow-2xl overflow-hidden border border-gray-100 max-h-[90vh] flex flex-col">
                                <div className="p-6 sm:p-8 border-b border-gray-50 flex items-center justify-between shrink-0">
                                    <div>
                                        <h2 className="text-lg sm:text-xl font-black text-gray-900">Add Offline Donation</h2>
                                        <p className="text-[10px] sm:text-xs text-gray-400 font-medium mt-1 uppercase tracking-widest">Digital Ledger Entry</p>
                                    </div>
                                    <button onClick={() => setShowManualForm(false)} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"><XCircle size={20} /></button>
                                </div>
                                <form onSubmit={async (e) => {
                                    e.preventDefault();
                                    const fd = new FormData(e.currentTarget);
                                    const data = Object.fromEntries(fd.entries());
                                    try {
                                        const res = await api.post('/donations', data, { headers: authHeader });
                                        if (res.data.success) {
                                            toast.success("Manual donation recorded!");
                                            setShowManualForm(false);
                                            fetchAll();
                                        }
                                    } catch (err: any) {
                                        toast.error(err.response?.data?.message || "Failed to add donation");
                                    }
                                }} className="p-6 sm:p-8 space-y-4 overflow-y-auto">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Donor Name</label>
                                            <input name="name" required placeholder="Full Name" className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-black/5 outline-none font-bold text-sm" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Email</label>
                                            <input name="email" type="email" required placeholder="Email Address" className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-black/5 outline-none font-bold text-sm" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Amount ($)</label>
                                            <input name="amount" type="number" step="0.01" min="0.01" required placeholder="0.00" className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-black/5 outline-none font-black text-sm" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Date Received</label>
                                            <input name="date" type="date" className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-black/5 outline-none font-bold text-sm" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Source</label>
                                            <select name="source" required defaultValue="USA" className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-black/5 outline-none font-bold text-sm appearance-none cursor-pointer">
                                                <option value="USA">USA Website</option>
                                                <option value="INDIA">India Website</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Payment Method</label>
                                            <select name="paymentMethod" required defaultValue="PAYPAL" className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-black/5 outline-none font-bold text-sm appearance-none cursor-pointer">
                                                <option value="PAYPAL">PayPal</option>
                                                <option value="BANK_TRANSFER">Bank Transfer</option>
                                                <option value="CASH">Cash</option>
                                                <option value="CHEQUE">Cheque</option>
                                                <option value="OTHER">Other</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Comment</label>
                                        <textarea name="comment" placeholder="Optional notes about the donor or purpose..." className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-black/5 outline-none font-bold text-sm min-h-[80px]" />
                                    </div>
                                    <button type="submit" className="w-full py-4 bg-black text-white rounded-2xl font-black text-xs sm:text-sm tracking-widest uppercase hover:bg-neutral-800 transition-all shadow-xl shadow-black/10 mt-2">
                                        Confirm Donation Record
                                    </button>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* ── Edit Donation Modal ── */}
                <AnimatePresence>
                    {showEditForm && editingDonation && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowEditForm(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative bg-white w-full max-w-lg rounded-[2rem] sm:rounded-3xl shadow-2xl overflow-hidden border border-gray-100 max-h-[90vh] flex flex-col">
                                <div className="p-6 sm:p-8 border-b border-gray-50 flex items-center justify-between bg-blue-50/30 shrink-0">
                                    <div>
                                        <h2 className="text-lg sm:text-xl font-black text-gray-900">Edit Donation Record</h2>
                                        <p className="text-[10px] sm:text-xs text-gray-400 font-medium mt-1 uppercase tracking-widest">Update Data Shield Entry</p>
                                    </div>
                                    <button onClick={() => setShowEditForm(false)} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"><XCircle size={20} /></button>
                                </div>
                                <form onSubmit={async (e) => {
                                    e.preventDefault();
                                    const fd = new FormData(e.currentTarget);
                                    const data = Object.fromEntries(fd.entries());
                                    try {
                                        const res = await api.put(`/donations/${editingDonation._id}`, data, { headers: authHeader });
                                        if (res.data.success) {
                                            toast.success("Donation updated successfully");
                                            setShowEditForm(false);
                                            fetchAll(true);
                                        }
                                    } catch (err: any) {
                                        toast.error(err.response?.data?.message || "Failed to update donation");
                                    }
                                }} className="p-6 sm:p-8 space-y-4 overflow-y-auto">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Donor Name</label>
                                            <input name="name" required defaultValue={editingDonation.name} placeholder="Full Name" className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-black/5 outline-none font-bold text-sm" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Email</label>
                                            <input name="email" type="email" required defaultValue={editingDonation.email} placeholder="Email Address" className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-black/5 outline-none font-bold text-sm" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Amount ($)</label>
                                            <input name="amount" type="number" step="0.01" min="0.01" required defaultValue={editingDonation.amount} placeholder="0.00" className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-black/5 outline-none font-black text-sm" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Status</label>
                                            <select name="status" required defaultValue={editingDonation.status} className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-black/5 outline-none font-bold text-sm appearance-none cursor-pointer">
                                                <option value="completed">Completed</option>
                                                <option value="pending">Pending</option>
                                                <option value="failed">Failed</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Source</label>
                                            <select name="source" required defaultValue={editingDonation.source} className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-black/5 outline-none font-bold text-sm appearance-none cursor-pointer">
                                                <option value="USA">USA Website</option>
                                                <option value="INDIA">India Website</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Payment Method</label>
                                            <select name="paymentMethod" required defaultValue={editingDonation.paymentMethod || "UNKNOWN"} className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-black/5 outline-none font-bold text-sm appearance-none cursor-pointer">
                                                <option value="PAYPAL">PayPal</option>
                                                <option value="BANK_TRANSFER">Bank Transfer</option>
                                                <option value="CASH">Cash</option>
                                                <option value="CHEQUE">Cheque</option>
                                                <option value="OTHER">Other</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Date Created</label>
                                        <input name="createdAt" type="datetime-local" defaultValue={new Date(editingDonation.createdAt).toISOString().slice(0, 16)} className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-black/5 outline-none font-bold text-sm" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Comment</label>
                                        <textarea name="comment" defaultValue={editingDonation.comment} placeholder="Optional notes..." className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-black/5 outline-none font-bold text-sm min-h-[80px]" />
                                    </div>
                                    <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs sm:text-sm tracking-widest uppercase hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/10 mt-2">
                                        Update Transaction
                                    </button>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* ── Secure Delete Confirmation Modal ── */}
                <AnimatePresence>
                    {showDeleteModal && (
                        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDeleteModal(false)} className="absolute inset-0 bg-black/70 backdrop-blur-md" />
                            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-red-100">
                                <div className="p-8 border-b border-red-50 bg-red-50/30 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                                        <AlertTriangle size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-gray-900">Critical Action</h2>
                                        <p className="text-xs text-red-600/60 font-bold uppercase tracking-widest mt-0.5">Permanent Record Deletion</p>
                                    </div>
                                </div>
                                <div className="p-8">
                                    <p className="text-sm text-gray-500 leading-relaxed mb-6">
                                        You are about to delete a transaction record permanently. This will remove it from all financial reports and cannot be recovered.
                                    </p>
                                    
                                    <div className="space-y-3 mb-8">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Type <span className="text-red-500 font-black">DELETE</span> to proceed</label>
                                        <input 
                                            value={deleteConfirmText}
                                            onChange={e => setDeleteConfirmText(e.target.value)}
                                            placeholder="DELETE"
                                            className="w-full px-4 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-red-500 focus:bg-white outline-none font-black text-center text-lg tracking-widest text-red-600 placeholder:text-gray-200 transition-all uppercase" />
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <button 
                                            onClick={confirmDeleteDonation}
                                            disabled={deleteConfirmText.toUpperCase() !== 'DELETE'}
                                            className={`w-full py-4 rounded-2xl font-black text-xs tracking-widest uppercase transition-all shadow-xl shadow-red-600/10 ${deleteConfirmText.toUpperCase() === 'DELETE' ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}
                                        >
                                            Confirm Permanent Deletion
                                        </button>
                                        <button onClick={() => setShowDeleteModal(false)} className="w-full py-4 text-gray-400 font-bold text-xs tracking-widest uppercase hover:text-gray-900 transition-colors">
                                            Cancel, Keep Record
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
                {/* ── Minimalist Inquiry Delete Corner Pop ── */}
                <AnimatePresence>
                    {showInquiryDeleteModal && (
                        <div className="fixed bottom-10 right-10 z-[120] w-[340px]">
                            <motion.div 
                                initial={{ x: 100, opacity: 0, scale: 0.9 }} 
                                animate={{ x: 0, opacity: 1, scale: 1 }} 
                                exit={{ x: 100, opacity: 0, scale: 0.9 }} 
                                className="bg-white rounded-[32px] shadow-[0_24px_60px_-12px_rgba(0,0,0,0.2)] border border-gray-100 overflow-hidden"
                            >
                                <div className="p-8">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                                            <Trash2 size={20} strokeWidth={2} />
                                        </div>
                                        <div>
                                            <h2 className="text-base font-black text-gray-900 leading-tight">Remove Inquiry?</h2>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Permanent Action</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={confirmDeleteInquiry}
                                            className="flex-1 py-3.5 bg-black text-white rounded-2xl font-black text-[10px] tracking-widest uppercase hover:bg-gray-900 transition-all active:scale-95 shadow-lg shadow-black/10"
                                        >
                                            Confirm
                                        </button>
                                        <button 
                                            onClick={() => setShowInquiryDeleteModal(false)} 
                                            className="px-6 py-3.5 text-gray-400 font-black text-[10px] tracking-widest uppercase hover:text-black transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* ── Registration Detail Modal ── */}
                <AnimatePresence>
                    {selectedRegistration && (
                        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedRegistration(null)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
                            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                                {/* Header */}
                                <div className="p-8 sm:p-10 border-b border-gray-50 flex items-center justify-between shrink-0 bg-gray-50/30">
                                    <div className="flex items-center gap-5">
                                        <div className="w-16 h-16 rounded-2xl bg-black text-white flex items-center justify-center text-2xl font-black shadow-xl shadow-black/10">
                                            {selectedRegistration.fullName.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-gray-900 leading-tight">{selectedRegistration.fullName}</h2>
                                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
                                                <Ticket size={12} className="text-[#e08f24]" /> {selectedRegistration.ticketType} Admission
                                            </p>
                                        </div>
                                    </div>
                                    <button onClick={() => setSelectedRegistration(null)} className="p-3 text-gray-300 hover:text-black hover:bg-white rounded-2xl transition-all shadow-sm"><X size={24} /></button>
                                </div>

                                {/* Body */}
                                <div className="p-8 sm:p-10 overflow-y-auto space-y-10 custom-scrollbar">
                                    {/* Primary Info Grid */}
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Email Address</label>
                                            <div className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                                <Mail size={14} className="text-gray-300" /> {selectedRegistration.email}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Phone Number</label>
                                            <div className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                                <Phone size={14} className="text-gray-300" /> {selectedRegistration.phone || 'Not Provided'}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">City / Origin</label>
                                            <div className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                                <MapPin size={14} className="text-gray-300" /> {selectedRegistration.city || '—'}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Total Guests</label>
                                            <div className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                                <Users size={14} className="text-gray-300" /> {selectedRegistration.guests} Person(s)
                                            </div>
                                        </div>
                                    </div>

                                    {/* Financial Info Box */}
                                    <div className="bg-gray-50 rounded-[2rem] p-8 border border-gray-100 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-8 opacity-10"><DollarSign size={80} className="text-black" /></div>
                                        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Transaction Value</label>
                                                <div className="text-4xl font-black text-gray-900">
                                                    {selectedRegistration.currency === 'INR' ? '₹' : '$'}{selectedRegistration.amount.toLocaleString()}
                                                </div>
                                            </div>
                                            <div className="flex flex-col sm:items-end gap-2">
                                                <StatusBadge status={selectedRegistration.status} />
                                                <div className="text-[10px] font-bold text-gray-400 font-mono tracking-tighter">REF: {selectedRegistration.transactionId || 'PENDING_PAYMENT'}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Additional Interests */}
                                    <div className="space-y-4">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Donor Preferences</label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div className={`p-5 rounded-2xl border flex items-center gap-4 transition-all ${selectedRegistration.volunteer ? 'bg-blue-50/50 border-blue-100' : 'bg-gray-50/30 border-gray-100 opacity-50'}`}>
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedRegistration.volunteer ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-gray-200 text-gray-400'}`}>
                                                    <Star size={16} />
                                                </div>
                                                <div>
                                                    <div className={`text-xs font-black uppercase tracking-widest ${selectedRegistration.volunteer ? 'text-blue-900' : 'text-gray-400'}`}>Volunteer Interest</div>
                                                    <div className="text-[10px] font-medium text-gray-500 mt-0.5">{selectedRegistration.volunteer ? 'Wants to help on-ground' : 'No interest stated'}</div>
                                                </div>
                                            </div>
                                            <div className={`p-5 rounded-2xl border flex items-center gap-4 transition-all ${selectedRegistration.donationInterest ? 'bg-emerald-50/50 border-emerald-100' : 'bg-gray-50/30 border-gray-100 opacity-50'}`}>
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedRegistration.donationInterest ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-gray-200 text-gray-400'}`}>
                                                    <TrendingUp size={16} />
                                                </div>
                                                <div>
                                                    <div className={`text-xs font-black uppercase tracking-widest ${selectedRegistration.donationInterest ? 'text-emerald-900' : 'text-gray-400'}`}>Future Donor</div>
                                                    <div className="text-[10px] font-medium text-gray-500 mt-0.5">{selectedRegistration.donationInterest ? 'Interested in recurring giving' : 'No interest stated'}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Action */}
                                <div className="p-8 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between shrink-0">
                                    <div className="text-[10px] font-bold text-gray-400">Registered on {new Date(selectedRegistration.createdAt).toLocaleString()}</div>
                                    <div className="flex gap-3">
                                        <a href={`mailto:${selectedRegistration.email}`} className="px-6 py-2.5 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-neutral-800 transition-all flex items-center gap-2">
                                            <Mail size={14} /> Send Email
                                        </a>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* ── Event Registration Edit Modal ── */}
                <AnimatePresence>
                    {showRegistrationEditForm && editingRegistration && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowRegistrationEditForm(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative bg-white w-full max-w-lg rounded-[2rem] sm:rounded-3xl shadow-2xl overflow-hidden border border-gray-100 max-h-[90vh] flex flex-col">
                                <div className="p-6 sm:p-8 border-b border-gray-50 flex items-center justify-between bg-orange-50/30 shrink-0">
                                    <div>
                                        <h2 className="text-lg sm:text-xl font-black text-gray-900">Edit Event Registration</h2>
                                        <p className="text-[10px] sm:text-xs text-gray-400 font-medium mt-1 uppercase tracking-widest">Update Attendee Record</p>
                                    </div>
                                    <button onClick={() => setShowRegistrationEditForm(false)} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"><XCircle size={20} /></button>
                                </div>
                                <form onSubmit={async (e) => {
                                    e.preventDefault();
                                    const fd = new FormData(e.currentTarget);
                                    const data: any = Object.fromEntries(fd.entries());
                                    // Handle checkboxes
                                    data.volunteer = fd.get('volunteer') === 'on';
                                    data.donationInterest = fd.get('donationInterest') === 'on';
                                    data.amount = parseFloat(data.amount);
                                    data.guests = parseInt(data.guests);
                                    
                                    try {
                                        const res = await api.put(`/event-registration/${editingRegistration._id}`, data, { headers: authHeader });
                                        if (res.data.success) {
                                            toast.success("Registration updated successfully");
                                            setShowRegistrationEditForm(false);
                                            fetchAll(true);
                                        }
                                    } catch (err: any) {
                                        toast.error(err.response?.data?.message || "Failed to update registration");
                                    }
                                }} className="p-6 sm:p-8 space-y-4 overflow-y-auto">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Full Name</label>
                                            <input name="fullName" required defaultValue={editingRegistration.fullName} className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-black/5 outline-none font-bold text-sm" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Email</label>
                                            <input name="email" type="email" required defaultValue={editingRegistration.email} className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-black/5 outline-none font-bold text-sm" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Phone</label>
                                            <input name="phone" required defaultValue={editingRegistration.phone} className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-black/5 outline-none font-bold text-sm" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">City</label>
                                            <input name="city" required defaultValue={editingRegistration.city} className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-black/5 outline-none font-bold text-sm" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Ticket Type</label>
                                            <select name="ticketType" required defaultValue={editingRegistration.ticketType} className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-black/5 outline-none font-bold text-sm">
                                                <option value="Standard Seat">Standard Seat</option>
                                                <option value="VIP Table">VIP Table</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Guests</label>
                                            <input name="guests" type="number" min="0" required defaultValue={editingRegistration.guests} className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-black/5 outline-none font-bold text-sm" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Amount</label>
                                            <input name="amount" type="number" step="0.01" required defaultValue={editingRegistration.amount} className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-black/5 outline-none font-black text-sm" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Status</label>
                                            <select name="status" required defaultValue={editingRegistration.status} className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-black/5 outline-none font-bold text-sm">
                                                <option value="completed">Completed</option>
                                                <option value="pending">Pending</option>
                                                <option value="failed">Failed</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex gap-6 py-2">
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <input type="checkbox" name="volunteer" defaultChecked={editingRegistration.volunteer} className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-gray-900 transition-colors">Volunteer Interest</span>
                                        </label>
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <input type="checkbox" name="donationInterest" defaultChecked={editingRegistration.donationInterest} className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-gray-900 transition-colors">Donor Interest</span>
                                        </label>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Message</label>
                                        <textarea name="message" defaultValue={editingRegistration.message} className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-black/5 outline-none font-medium text-sm min-h-[80px]" />
                                    </div>
                                    <button type="submit" className="w-full py-4 bg-orange-600 text-white rounded-2xl font-black text-xs sm:text-sm tracking-widest uppercase hover:bg-orange-700 transition-all shadow-xl shadow-orange-600/10 mt-2">
                                        Update Registration
                                    </button>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* ── Event Registration Delete Modal ── */}
                <AnimatePresence>
                    {showRegistrationDeleteModal && (
                        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowRegistrationDeleteModal(false)} className="absolute inset-0 bg-black/70 backdrop-blur-md" />
                            <motion.div 
                                initial={{ scale: 0.9, opacity: 0 }} 
                                animate={{ scale: 1, opacity: 1 }} 
                                exit={{ scale: 0.9, opacity: 0 }} 
                                className="relative bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden border border-red-100"
                            >
                                <div className="p-8">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                                            <Trash2 size={24} />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-black text-gray-900">Delete Registration?</h2>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">This action is permanent</p>
                                        </div>
                                    </div>
                                    
                                    <p className="text-xs text-gray-500 leading-relaxed mb-8">
                                        Are you sure you want to remove this attendee from the event? This cannot be undone.
                                    </p>

                                    <div className="flex flex-col gap-2">
                                        <button 
                                            onClick={confirmDeleteRegistration}
                                            className="w-full py-4 bg-red-600 text-white rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-red-700 transition-all shadow-lg shadow-red-600/10"
                                        >
                                            Yes, Delete Forever
                                        </button>
                                        <button 
                                            onClick={() => setShowRegistrationDeleteModal(false)} 
                                            className="w-full py-4 text-gray-400 font-bold text-xs tracking-widest uppercase hover:text-gray-900 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default AdminDashboard;
