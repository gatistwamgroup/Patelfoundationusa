/**
 * SuccessPage — PayPal Redirect Return
 * 
 * Flow:
 * 1. PayPal redirects back with 'token' in URL.
 * 2. Component calls backend to capture the order.
 * 3. Shows success state on completion.
 */
import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, ArrowRight, Heart } from "lucide-react";
import Navbar from "@/components/Navbar";
import SEO from "@/components/SEO";
import api from "@/lib/api";

const SuccessPage = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token"); // The order ID provided by PayPal
    
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [details, setDetails] = useState<any>(null);

    useEffect(() => {
        if (!token) {
            setStatus("error");
            return;
        }

        const capturePayment = async () => {
            try {
                // Capture the order using the token (OrderId)
                const res = await api.post("/paypal/capture-order", {
                    orderID: token
                });
                
                if (res.data.status === "COMPLETED") {
                    setDetails(res.data);
                    setStatus("success");
                } else {
                    setStatus("error");
                }
            } catch (err) {
                console.error("[Capture Error]:", err);
                setStatus("error");
            }
        };

        capturePayment();
    }, [token]);

    const isRegistration = details?.type === 'REGISTRATION';

    return (
        <div className="min-h-screen bg-[#FDFBF7] font-sans selection:bg-primary/20">
            <SEO 
                title={isRegistration ? "Registration Successful | Patel Foundation" : "Donation Successful | Patel Foundation"} 
                description={isRegistration ? "You are successfully registered for our upcoming event." : "Thank you for your generous gift. Your support changes lives."} 
            />
            <Navbar />
            
            <main className="container mx-auto px-6 py-32 flex flex-col items-center justify-center min-h-[80vh]">
                {status === "loading" && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center gap-6"
                    >
                        <Loader2 className="w-12 h-12 animate-spin text-primary opacity-30" />
                        <h2 className="text-2xl font-serif text-gray-700">Verifying your {isRegistration ? 'registration' : 'donation'}...</h2>
                        <p className="text-gray-400 text-sm font-medium tracking-widest uppercase">Secured by PayPal Gateway</p>
                    </motion.div>
                )}

                {status === "success" && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }} 
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-lg bg-white rounded-3xl p-12 shadow-2xl shadow-primary/10 flex flex-col items-center text-center border border-gray-100"
                    >
                        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-8">
                            <CheckCircle2 className="w-12 h-12 text-green-500" />
                        </div>
                        
                        <h1 className="text-4xl md:text-5xl font-serif mb-4 text-black">
                            {isRegistration ? "You're all set!" : "Thank you so much!"}
                        </h1>
                        <p className="text-gray-500 mb-10 leading-relaxed">
                            {isRegistration 
                                ? `Your registration has been confirmed. We've sent your entry details to `
                                : `Your generous gift has been securely processed. We've sent a detailed receipt to `
                            }
                            <span className="font-bold text-black opacity-80">{details?.payer?.email_address || "your email"}</span>.
                        </p>

                        <div className="w-full grid grid-cols-2 gap-4 mb-10 text-left">
                            <div className="bg-gray-50 p-4 rounded-2xl">
                                <span className="block text-[10px] uppercase font-black text-gray-400 mb-1 tracking-widest">Transaction ID</span>
                                <span className="text-xs font-mono font-bold text-black/50 truncate">#{token?.slice(0, 10)}...</span>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-2xl">
                                <span className="block text-[10px] uppercase font-black text-gray-400 mb-1 tracking-widest">Status</span>
                                <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                                    <CheckCircle2 size={12} /> Confirmed
                                </span>
                            </div>
                        </div>

                        <div className="w-full flex flex-col gap-4">
                            <Link to={isRegistration ? "/event" : "/"} className="w-full py-5 bg-black text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-neutral-800 transition-all shadow-xl shadow-black/10">
                                <span>{isRegistration ? "View Event Details" : "Return to Mission Hub"}</span>
                                <ArrowRight size={18} />
                            </Link>
                        </div>
                    </motion.div>
                )}

                {status === "error" && (
                    <div className="flex flex-col items-center text-center max-w-md">
                         <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
                            <span className="text-3xl">⚠️</span>
                        </div>
                        <h2 className="text-3xl font-serif mb-4">Verification Needed</h2>
                        <p className="text-gray-500 mb-8 leading-relaxed">
                            We couldn't verify your donation automatically. If you've been charged, don't worry—our team will review this manually.
                        </p>
                        <Link to="/donate" className="text-primary font-bold underline underline-offset-8">Return and Try Again</Link>
                    </div>
                )}
            </main>
        </div>
    );
};

export default SuccessPage;
