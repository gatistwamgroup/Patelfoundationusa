/**
 * PayPalButtonsWrapper — Full Donor Detail Flow
 * 
 * Collects Name, Email, and Phone before initiating the PayPal redirect.
 * Stores a PENDING record in the database for tracking.
 */
import React, { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, ShieldCheck, Loader2, User, Mail, Phone, ArrowRight, MapPin, Globe, Building2 } from "lucide-react";
import api from "@/lib/api"; // Access standard axios instance

interface Props {
    amount: number;
    onProcessingChange: (v: boolean) => void;
}

const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
const zipRegex = /^[0-9]{4,10}$/;

const PayPalButtonsWrapper = memo(
    ({ amount, onProcessingChange }: Props) => {
        const [isRedirecting, setIsRedirecting] = useState(false);
        const [error, setError] = useState<string | null>(null);

        const [formErrors, setFormErrors] = useState<Record<string, string>>({});

        // Form fields (full donor information)
        const [firstName, setFirstName] = useState("");
        const [lastName, setLastName] = useState("");
        const [email, setEmail] = useState("");
        const [phone, setPhone] = useState("");
        const [address, setAddress] = useState("");
        const [city, setCity] = useState("");
        const [state, setState] = useState("");
        const [country, setCountry] = useState("United States");
        const [zip, setZip] = useState("");
        const [comment, setComment] = useState("");
        const [isAnonymous, setIsAnonymous] = useState(false);
        const [hideAmount, setHideAmount] = useState(false);

        const normalized = {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim(),
            phone: phone.trim(),
            address: address.trim(),
            city: city.trim(),
            state: state.trim(),
            country: country.trim(),
            zip: zip.trim(),
            comment: comment.trim(),
        };

        const canProceed =
            amount > 0 &&
            normalized.firstName &&
            normalized.lastName &&
            normalized.email &&
            emailRegex.test(normalized.email);

        const validate = () => {
            const nextErrors: Record<string, string> = {};
            if (!normalized.firstName) nextErrors.firstName = "First name is required";
            if (!normalized.lastName) nextErrors.lastName = "Last name is required";
            if (!normalized.email) nextErrors.email = "Email is required";
            else if (!emailRegex.test(normalized.email)) nextErrors.email = "Enter a valid email";
            
            if (normalized.zip && !zipRegex.test(normalized.zip)) {
                nextErrors.zip = "Enter a valid ZIP code format";
            }
            
            setFormErrors(nextErrors);
            return Object.keys(nextErrors).length === 0;
        };

        const handleDonate = async (e: React.FormEvent) => {
            e.preventDefault();

            if (isRedirecting || !amount || amount <= 0) return;

            setError(null);
            if (!validate()) return;

            setIsRedirecting(true);
            onProcessingChange(true);

            try {
                // Call the new initiate-donation endpoint
                const res = await api.post("/donation/initiate", {
                    // Legacy-compatible fields
                    name: `${normalized.firstName} ${normalized.lastName}`.trim(),
                    email: normalized.email,
                    phone: normalized.phone,
                    // Full donor fields
                    firstName: normalized.firstName,
                    lastName: normalized.lastName,
                    address: normalized.address,
                    city: normalized.city,
                    state: normalized.state,
                    country: normalized.country,
                    zip: normalized.zip,
                    comment: normalized.comment,
                    isAnonymous,
                    hideAmount,
                    amount,
                });

                if (res.data.approvalUrl) {
                    // Smooth redirect to PayPal
                    window.location.href = res.data.approvalUrl;
                } else {
                    throw new Error("PayPal redirect URL missing in response.");
                }
            } catch (err: any) {
                console.error("[PayPal Initiation Error]:", err.response?.data || err.message);
                setError(err.response?.data?.message || "Temporarily unable to connect to PayPal. Please try again.");
                setIsRedirecting(false);
                onProcessingChange(false);
            }
        };

        if (amount <= 0) {
            return (
                <div className="w-full py-4 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center gap-3 text-gray-400">
                    <Lock size={18} className="opacity-40" />
                    <span className="text-sm font-semibold tracking-tight">Enter an amount to donate</span>
                </div>
            );
        }

        return (
            <div className="w-full relative space-y-6">
                <AnimatePresence>
                    {isRedirecting && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center text-white"
                        >
                            <div className="relative mb-8">
                                <Loader2 className="w-16 h-16 animate-spin text-primary opacity-20" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <ShieldCheck className="w-8 h-8 text-primary animate-pulse" />
                                </div>
                            </div>
                            
                            <motion.h2 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-2xl font-serif mb-2"
                            >
                                Preparing secure PayPal checkout...
                            </motion.h2>
                            <p className="text-gray-400 text-sm max-w-[280px] text-center font-medium leading-relaxed">
                                Redirecting you to PayPal to complete your contribution securely.
                            </p>
                            
                            <div className="mt-12 flex items-center gap-4 py-3 px-6 bg-white/5 rounded-full border border-white/10 backdrop-blur-md">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                                <span className="text-[10px] uppercase font-black tracking-[0.2em] text-white/50">Encrypted Session Active</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Donor Info Form */}
                <form onSubmit={handleDonate} className="space-y-4">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Lock size={14} className="text-primary" />
                            <span className="text-[11px] font-black uppercase tracking-widest text-gray-400">Donor Information (Secure)</span>
                        </div>

                        {/* Name (First/Last) */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="relative">
                                <User size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${formErrors.firstName ? 'text-red-400' : 'text-gray-300'}`} />
                                <input
                                    type="text"
                                    placeholder="First Name"
                                    value={firstName}
                                    onChange={(e) => {
                                        setFirstName(e.target.value);
                                        if (formErrors.firstName) setFormErrors(prev => { const n = {...prev}; delete n.firstName; return n; });
                                    }}
                                    className={`w-full pl-11 pr-4 py-3 bg-gray-50 border-2 rounded-xl text-sm focus:ring-2 focus:ring-black/5 transition-all outline-none font-medium ${formErrors.firstName ? 'border-red-200 bg-red-50/30 placeholder-red-300' : 'border-transparent'}`}
                                />
                                {formErrors.firstName && (
                                    <p className="text-[11px] text-red-500 font-bold mt-1 ml-1">{formErrors.firstName}</p>
                                )}
                            </div>
                            <div className="relative">
                                <User size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 ${formErrors.lastName ? 'text-red-300' : 'text-gray-300'}`} />
                                <input
                                    type="text"
                                    placeholder="Last Name"
                                    value={lastName}
                                    onChange={(e) => {
                                        setLastName(e.target.value);
                                        if (formErrors.lastName) setFormErrors(prev => { const n = {...prev}; delete n.lastName; return n; });
                                    }}
                                    className={`w-full pl-11 pr-4 py-3 bg-gray-50 border-2 rounded-xl text-sm focus:ring-2 focus:ring-black/5 transition-all outline-none font-medium ${formErrors.lastName ? 'border-red-200 bg-red-50/30' : 'border-transparent'}`}
                                />
                                {formErrors.lastName && (
                                    <p className="text-[11px] text-red-500 font-bold mt-1 ml-1">{formErrors.lastName}</p>
                                )}
                            </div>
                        </div>

                        {/* Email + Phone */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="relative">
                                <Mail size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 ${formErrors.email ? 'text-red-300' : 'text-gray-300'}`} />
                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (formErrors.email) setFormErrors(prev => { const n = {...prev}; delete n.email; return n; });
                                    }}
                                    className={`w-full pl-11 pr-4 py-3 bg-gray-50 border-2 rounded-xl text-sm focus:ring-2 focus:ring-black/5 transition-all outline-none font-medium ${formErrors.email ? 'border-red-200 bg-red-50/30' : 'border-transparent'}`}
                                />
                                {formErrors.email && (
                                    <p className="text-[11px] text-red-500 font-bold mt-1 ml-1">{formErrors.email}</p>
                                )}
                            </div>
                            <div className="relative">
                                <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                                <input
                                    type="tel"
                                    placeholder="Phone Number (Optional)"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-black/5 transition-all outline-none font-medium"
                                />
                            </div>
                        </div>

                        {/* Address Section (Explicitly Optional) */}
                        <div className="pt-2 border-t border-gray-50 flex items-center gap-2 mb-1">
                            <MapPin size={14} className="text-gray-400" />
                            <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Billing Address (Optional)</span>
                        </div>

                        <div className="relative">
                                <MapPin size={16} className={`absolute left-4 top-4 ${formErrors.address ? 'text-red-300' : 'text-gray-300'}`} />
                                <textarea
                                    placeholder="Street Address"
                                    value={address}
                                    onChange={(e) => {
                                        setAddress(e.target.value);
                                        if (formErrors.address) setFormErrors(prev => { const n = {...prev}; delete n.address; return n; });
                                    }}
                                    className={`w-full pl-11 pr-4 py-3 bg-gray-50 border-2 rounded-xl text-sm focus:ring-2 focus:ring-black/5 transition-all outline-none font-medium min-h-[44px] ${formErrors.address ? 'border-red-200 bg-red-50/30 placeholder-red-300' : 'border-transparent'}`}
                                />
                                {formErrors.address && (
                                    <p className="text-[11px] text-red-500 font-bold mt-1 ml-1">{formErrors.address}</p>
                                )}
                        </div>

                        {/* City + State */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="relative">
                                <Building2 size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 ${formErrors.city ? 'text-red-300' : 'text-gray-300'}`} />
                                <input
                                    type="text"
                                    placeholder="City"
                                    value={city}
                                    onChange={(e) => {
                                        setCity(e.target.value);
                                        if (formErrors.city) setFormErrors(prev => { const n = {...prev}; delete n.city; return n; });
                                    }}
                                    className={`w-full pl-11 pr-4 py-3 bg-gray-50 border-2 rounded-xl text-sm focus:ring-2 focus:ring-black/5 transition-all outline-none font-medium ${formErrors.city ? 'border-red-200 bg-red-50/30' : 'border-transparent'}`}
                                />
                                {formErrors.city && (
                                    <p className="text-[11px] text-red-500 font-bold mt-1 ml-1">{formErrors.city}</p>
                                )}
                            </div>
                            <div className="relative">
                                <Building2 size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 ${formErrors.state ? 'text-red-300' : 'text-gray-300'}`} />
                                <input
                                    type="text"
                                    placeholder="State"
                                    value={state}
                                    onChange={(e) => {
                                        setState(e.target.value);
                                        if (formErrors.state) setFormErrors(prev => { const n = {...prev}; delete n.state; return n; });
                                    }}
                                    className={`w-full pl-11 pr-4 py-3 bg-gray-50 border-2 rounded-xl text-sm focus:ring-2 focus:ring-black/5 transition-all outline-none font-medium ${formErrors.state ? 'border-red-200 bg-red-50/30' : 'border-transparent'}`}
                                />
                                {formErrors.state && (
                                    <p className="text-[11px] text-red-500 font-bold mt-1 ml-1">{formErrors.state}</p>
                                )}
                            </div>
                        </div>

                        {/* Country + ZIP */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="relative">
                                <Globe size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 ${formErrors.country ? 'text-red-300' : 'text-gray-300'}`} />
                                <input
                                    type="text"
                                    placeholder="Country"
                                    value={country}
                                    onChange={(e) => {
                                        setCountry(e.target.value);
                                        if (formErrors.country) setFormErrors(prev => { const n = {...prev}; delete n.country; return n; });
                                    }}
                                    className={`w-full pl-11 pr-4 py-3 bg-gray-50 border-2 rounded-xl text-sm focus:ring-2 focus:ring-black/5 transition-all outline-none font-medium ${formErrors.country ? 'border-red-200 bg-red-50/30' : 'border-transparent'}`}
                                />
                                {formErrors.country && (
                                    <p className="text-[11px] text-red-500 font-bold mt-1 ml-1">{formErrors.country}</p>
                                )}
                            </div>
                            <div className="relative">
                                <MapPin size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 ${formErrors.zip ? 'text-red-300' : 'text-gray-300'}`} />
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="ZIP Code"
                                    value={zip}
                                    onChange={(e) => {
                                        setZip(e.target.value);
                                        if (formErrors.zip) setFormErrors(prev => { const n = {...prev}; delete n.zip; return n; });
                                    }}
                                    className={`w-full pl-11 pr-4 py-3 bg-gray-50 border-2 rounded-xl text-sm focus:ring-2 focus:ring-black/5 transition-all outline-none font-medium ${formErrors.zip ? 'border-red-200 bg-red-50/30' : 'border-transparent'}`}
                                />
                                {formErrors.zip && (
                                    <p className="text-[11px] text-red-500 font-bold mt-1 ml-1">{formErrors.zip}</p>
                                )}
                            </div>
                        </div>

                        {/* Comment (Optional) */}
                        <div className="relative">
                            <textarea
                                placeholder="Comment (Optional)"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                className="w-full pl-4 pr-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-black/5 transition-all outline-none font-medium min-h-[44px]"
                            />
                        </div>

                        {/* Preferences */}
                        <div className="pt-2">
                            <div className="flex items-start justify-between gap-6">
                                <label className="flex items-start gap-3 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={isAnonymous}
                                        onChange={(e) => setIsAnonymous(e.target.checked)}
                                        className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/30"
                                    />
                                    <span className="text-xs font-bold text-gray-700">Donate anonymously</span>
                                </label>
                                <label className="flex items-start gap-3 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={hideAmount}
                                        onChange={(e) => setHideAmount(e.target.checked)}
                                        className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/30"
                                    />
                                    <span className="text-xs font-bold text-gray-700">Hide my amount</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex flex-col gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={isRedirecting}
                            className="group w-full py-5 bg-black hover:bg-gray-900 text-white rounded-2xl text-lg font-bold 
                                       transition-all duration-300 flex items-center justify-center gap-3
                                       shadow-xl active:scale-[0.98] disabled:opacity-50"
                        >
                            {isRedirecting ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <>
                                    <span>Proceed to Payment</span>
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>

                    </div>
                </form>

                {error && (
                    <motion.p 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }}
                        className="text-xs text-red-500 text-center font-bold px-4 bg-red-50 py-3 rounded-xl border border-red-100"
                    >
                        {error}
                    </motion.p>
                )}
            </div>
        );
    }
);

PayPalButtonsWrapper.displayName = "PayPalButtonsWrapper";
export default PayPalButtonsWrapper;
