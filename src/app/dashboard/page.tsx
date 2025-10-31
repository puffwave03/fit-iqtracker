"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import {
 AreaChart,
 Area,
 XAxis,
 YAxis,
 Tooltip,
 ResponsiveContainer,
} from "recharts";
import { format, subDays } from "date-fns";

export default function DashboardPage() {
 const [summary, setSummary] = useState({
 calories_in: 0,
 calories_out: 0,
 steps: 0,
 });
 const [chartData, setChartData] = useState([]);
 const [coachMessage, setCoachMessage] = useState("");

 // Recupera i dati riepilogativi
 const fetchSummary = async () => {
 const { data: user } = await supabase.auth.getUser();
 if (!user?.user) return;

 const { data: meals } = await supabase
 .from("meals")
 .select("calories, date")
 .eq("user_id", user.user.id);

 const { data: workouts } = await supabase
 .from("workouts")
 .select("calories_burned, steps, date")
 .eq("user_id", user.user.id);

 let caloriesIn = 0,
 caloriesOut = 0,
 totalSteps = 0;

 meals?.forEach((m) => (caloriesIn += Number(m.calories)));
 workouts?.forEach((w) => {
 caloriesOut += Number(w.calories_burned);
 totalSteps += Number(w.steps || 0);
 });

 setSummary({
 calories_in: caloriesIn,
 calories_out: caloriesOut,
 steps: totalSteps,
 });

 // Genera dati grafico
 const last7 = Array.from({ length: 7 }).map((_, i) => {
 const d = subDays(new Date(), 6 - i);
 const dateStr = format(d, "yyyy-MM-dd");
 const inDay = meals
 ?.filter((m) => m.date === dateStr)
 .reduce((sum, m) => sum + Number(m.calories), 0);
 const outDay = workouts
 ?.filter((w) => w.date === dateStr)
 .reduce((sum, w) => sum + Number(w.calories_burned), 0);
 return { date: dateStr, in: inDay, out: outDay };
 });

 setChartData(last7);

 // Recupera ultimo messaggio motivazionale dal Coach AI
 const { data: lastMessage } = await supabase
 .from("ai_coach_feedbacks")
 .select("advice")
 .eq("user_id", user.user.id)
 .order("created_at", { ascending: false })
 .limit(1)
 .single();

 if (lastMessage) setCoachMessage(lastMessage.advice);
 };

 useEffect(() => {
 fetchSummary();
 }, []);

 const netto = summary.calories_in - summary.calories_out;

 return (
 <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center p-6 pb-24">
 <h1 className="text-3xl font-bold text-lime-400 mb-4">
 Dashboard Giornaliera
 </h1>

 {/* Riepilogo rapido */}
 <div className="grid grid-cols-2 gap-4 w-full max-w-md mb-6 text-center">
 <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
 <p className="text-lime-400">Calorie In</p>
 <p className="text-2xl font-bold">{summary.calories_in}</p>
 </div>
 <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
 <p className="text-lime-400">Calorie Out</p>
 <p className="text-2xl font-bold">{summary.calories_out}</p>
 </div>
 <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
 <p className="text-lime-400">Netto</p>
 <p className="text-2xl font-bold">{netto}</p>
 </div>
 <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
 <p className="text-lime-400">Passi</p>
 <p className="text-2xl font-bold">{summary.steps}</p>
 </div>
 </div>

 {/* Grafico andamento */}
 <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-4 rounded-xl mb-6">
 <p className="text-lime-400 font-semibold mb-2">Andamento Calorie</p>
 <ResponsiveContainer width="100%" height={250}>
 <AreaChart data={chartData}>
 <defs>
 <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
 <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
 </linearGradient>
 <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
 <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
 </linearGradient>
 </defs>
 <XAxis dataKey="date" stroke="#94a3b8" />
 <YAxis stroke="#94a3b8" />
 <Tooltip
 contentStyle={{
 backgroundColor: "#0f172a",
 color: "#fff",
 borderRadius: "0.75rem",
 border: "1px solid #84cc16",
 }}
 />
 <Area
 type="monotone"
 dataKey="in"
 stroke="#22c55e"
 fillOpacity={1}
 fill="url(#colorIn)"
 name="Calorie In"
 />
 <Area
 type="monotone"
 dataKey="out"
 stroke="#ef4444"
 fillOpacity={1}
 fill="url(#colorOut)"
 name="Calorie Out"
 />
 </AreaChart>
 </ResponsiveContainer>
 </div>

 {/* Riassunto Coach AI */}
 <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-lg p-4 mt-4">
 <p className="text-lime-400 font-semibold mb-2"> Coach AI</p>
 {coachMessage ? (
 <p className="text-gray-300 italic mb-4">{coachMessage}</p>
 ) : (
 <p className="text-gray-500 text-sm mb-4">
 Nessun consiglio recente. Scrivi al tuo coach per iniziare!
 </p>
 )}

 <Link
 href="/coach"
 className="block text-center bg-lime-500 text-slate-900 font-semibold py-2 rounded-lg hover:bg-lime-400 transition"
 >
 Apri Coach AI completo
 </Link>
 </div>
 </div>
 );
}

