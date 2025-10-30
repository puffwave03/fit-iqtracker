"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthPage() {
 const [email, setEmail] = useState("");
 const [password, setPassword] = useState("");
 const [isLogin, setIsLogin] = useState(true);
 const [loading, setLoading] = useState(false);
 const router = useRouter();

 const handleAuth = async (e: React.FormEvent) => {
 e.preventDefault();
 setLoading(true);

 try {
 let result;
 if (isLogin) {
 result = await supabase.auth.signInWithPassword({ email, password });
 } else {
 result = await supabase.auth.signUp({ email, password });
 }

 if (result.error) throw result.error;

 alert(isLogin ? " Login effettuato!" : " Registrazione completata!");
 router.push("/dashboard"); // dopo login torna alla home
 } catch (error: any) {
 alert(" Errore: " + error.message);
 } finally {
 setLoading(false);
 }
 };

 const handleLogout = async () => {
 await supabase.auth.signOut();
 alert(" Disconnesso correttamente!");
 router.refresh();
 };

 return (
 <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center text-white p-6">
 <h1 className="text-3xl font-bold text-lime-400 mb-6">
 {isLogin ? " Login FitIQtracker" : " Crea Account"}
 </h1>

 <form
 onSubmit={handleAuth}
 className="bg-slate-900 p-6 rounded-2xl shadow-lg w-full max-w-sm border border-slate-800"
 >
 <label className="block text-sm mb-1">Email</label>
 <input
 type="email"
 required
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 className="w-full mb-3 p-2 rounded bg-slate-800 border border-slate-700 text-white"
 placeholder="Inserisci la tua email"
 />

 <label className="block text-sm mb-1">Password</label>
 <input
 type="password"
 required
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 className="w-full mb-4 p-2 rounded bg-slate-800 border border-slate-700 text-white"
 placeholder="••••••••"
 />

 <button
 type="submit"
 disabled={loading}
 className="w-full py-2 bg-lime-500 text-slate-900 font-semibold rounded-lg hover:bg-lime-400 transition disabled:opacity-50"
 >
 {loading ? " Attendere..." : isLogin ? "Accedi" : "Registrati"}
 </button>
 </form>

 <p className="text-gray-400 text-sm mt-4">
 {isLogin ? "Non hai un account?" : "Hai già un account?"}{" "}
 <button
 onClick={() => setIsLogin(!isLogin)}
 className="text-lime-400 hover:text-lime-300"
 >
 {isLogin ? "Registrati" : "Accedi"}
 </button>
 </p>

 <button
 onClick={handleLogout}
 className="mt-6 text-sm text-gray-500 hover:text-red-400"
 >
 Esci
 </button>
 </div>
 );
}