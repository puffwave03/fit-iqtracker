"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
 FaFire,
 FaWalking,
 FaAppleAlt,
 FaWeight,
 FaBrain,
} from "react-icons/fa";
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
 caloriesEaten: 0,
 caloriesBurned: 0,
 steps: 0,
 weight: null,
 });
 const [chartData, setChartData] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);

 // Obiettivi giornalieri
 const goals = {
 caloriesEaten: 2000,
 caloriesBurned: 500,
 steps: 10000,
 };

 // Carica dati riepilogo giornaliero
 const fetchSummary = async () => {
 const { data: user } = await supabase.auth.getUser();
 if (!user?.user) return;

 const today = new Date().toISOString().split("T")[0];

 const { data: meals } = await supabase
 .from("meals")
 .select("calories")
 .eq("user_id", user.user.id)
 .eq("date", today);

 const { data: progress } = await supabase
 .from("daily_progress")
 .select("calories_burned, steps, weight")
 .eq("user_id", user.user.id)
 .eq("date", today)
 .single();

 const caloriesEaten =
 meals?.reduce((sum, m) => sum + Number(m.calories || 0), 0) || 0;

 setSummary({
 caloriesEaten,
 caloriesBurned: progress?.calories_burned || 0,
 steps: progress?.steps || 0,
 weight: progress?.weight || null,
 });

 setLoading(false);
 };

 useEffect(() => {
 fetchSummary();
 const interval = setInterval(fetchSummary, 30000);
 return () => clearInterval(interval);
 }, []);

 // Calcolo dati per il grafico settimanale
 useEffect(() => {
 const buildChartData = async () => {
 const { data: user } = await supabase.auth.getUser();
 if (!user?.user) return;

 const today = new Date();
 const dailyTotals: Record<string, number> = {};

 const { data } = await supabase
 .from("meals")
 .select("date, calories")
 .eq("user_id", user.user.id);

 if (data) {
 data.forEach((m) => {
 dailyTotals[m.date] =
 (dailyTotals[m.date] || 0) + Number(m.calories || 0);
 });

 const last7 = Array.from({ length: 7 }).map((_, i) => {
 const d = subDays(today, 6 - i);
 const key = format(d, "yyyy-MM-dd");
 return { date: key, calories: dailyTotals[key] || 0 };
 });

 setChartData(last7);
 }
 };

 buildChartData();
 }, []);

 if (loading)
 return (
 <div className="min-h-screen flex items-center justify-center text-lime-400">
 Caricamento dati...
 </div>
 );

 const percent = (value: number, goal: number) =>
 Math.min(Math.round((value / goal) * 100), 100);

 return (
 <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white flex flex-col items-center p-6 pb-24">
 <h1 className="text-4xl font-extrabold text-lime-400 mb-3 tracking-wide">
 FitIQtracker 
 </h1>
 <p className="text-gray-400 mb-6">
 Il tuo riepilogo giornaliero intelligente
 </p>

 {/* CARD PRINCIPALI */}
 <div className="grid grid-cols-2 gap-4 w-full max-w-md mb-6">
 <div className="bg-slate-900 border border-lime-500/40 rounded-2xl p-4 flex flex-col items-center shadow-[0_0_20px_#00ff8850]">
 <FaAppleAlt className="text-lime-400 text-3xl mb-2" />
 <p className="font-semibold text-lg">Calorie Ingerite</p>
 <p className="text-lime-400 text-2xl">{summary.caloriesEaten}</p>
 </div>

 <div className="bg-slate-900 border border-orange-400/40 rounded-2xl p-4 flex flex-col items-center shadow-[0_0_20px_#ff880050]">
 <FaFire className="text-orange-400 text-3xl mb-2" />
 <p className="font-semibold text-lg">Calorie Bruciate</p>
 <p className="text-orange-400 text-2xl">{summary.caloriesBurned}</p>
 </div>

 <div className="bg-slate-900 border border-cyan-400/40 rounded-2xl p-4 flex flex-col items-center shadow-[0_0_20px_#00ffff50]">
 <FaWalking className="text-cyan-400 text-3xl mb-2" />
 <p className="font-semibold text-lg">Passi</p>
 <p className="text-cyan-400 text-2xl">{summary.steps}</p>
 </div>

 <div className="bg-slate-900 border border-violet-400/40 rounded-2xl p-4 flex flex-col items-center shadow-[0_0_20px_#aa88ff50]">
 <FaWeight className="text-violet-400 text-3xl mb-2" />
 <p className="font-semibold text-lg">Peso</p>
 <p className="text-violet-400 text-2xl">
 {summary.weight ?? "-"} kg
 </p>
 </div>
 </div>

 {/* PROGRESS BAR */}
 <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
 <h2 className="text-lime-400 font-semibold text-xl mb-4 text-center">
 I tuoi Obiettivi
 </h2>

 {/* Calorie Ingerite */}
 <div className="mb-4">
 <div className="flex justify-between text-sm text-gray-300">
 <span> Calorie Ingerite</span>
 <span>{percent(summary.caloriesEaten, goals.caloriesEaten)}%</span>
 </div>
 <div className="w-full bg-slate-800 h-3 rounded-full mt-1">
 <div
 className="h-3 bg-lime-500 rounded-full transition-all duration-500"
 style={{
 width: `${percent(summary.caloriesEaten, goals.caloriesEaten)}%`,
 }}
 ></div>
 </div>
 </div>

 {/* Calorie Bruciate */}
 <div className="mb-4">
 <div className="flex justify-between text-sm text-gray-300">
 <span> Calorie Bruciate</span>
 <span>{percent(summary.caloriesBurned, goals.caloriesBurned)}%</span>
 </div>
 <div className="w-full bg-slate-800 h-3 rounded-full mt-1">
 <div
 className="h-3 bg-orange-400 rounded-full transition-all duration-500"
 style={{
 width: `${percent(summary.caloriesBurned, goals.caloriesBurned)}%`,
 }}
 ></div>
 </div>
 </div>

 {/* Passi */}
 <div>
 <div className="flex justify-between text-sm text-gray-300">
 <span> Passi</span>
 <span>{percent(summary.steps, goals.steps)}%</span>
 </div>
 <div className="w-full bg-slate-800 h-3 rounded-full mt-1">
 <div
 className="h-3 bg-cyan-400 rounded-full transition-all duration-500"
 style={{
 width: `${percent(summary.steps, goals.steps)}%`,
 }}
 ></div>
 </div>
 </div>
 </div>

 {/* FRASE MOTIVAZIONALE */}
 <div className="w-full max-w-md bg-slate-800 border border-lime-500/30 rounded-2xl p-4 text-center mb-6">
 <FaBrain className="text-lime-400 text-3xl mb-2 mx-auto animate-pulse" />
 <p className="italic text-gray-300 text-sm">
 “Ogni passo, ogni scelta, ogni respiro — stai costruendo la tua
 versione migliore ”
 </p>
 </div>

 {/* GRAFICO SETTIMANALE */}
 <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-6">
 <h2 className="text-lime-400 font-semibold text-lg mb-2 text-center">
 Andamento Calorie Ultimi 7 Giorni 
 </h2>

 <ResponsiveContainer width="100%" height={240}>
 <AreaChart data={chartData}>
 <defs>
 <linearGradient id="colorLime" x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor="#84cc16" stopOpacity={0.8} />
 <stop offset="95%" stopColor="#84cc16" stopOpacity={0} />
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
 formatter={(v: number) => [`${v} kcal`, "Calorie"]}
 labelFormatter={(label) => ` ${label}`}
 />
 <Area
 type="monotone"
 dataKey="calories"
 stroke="#84cc16"
 fillOpacity={1}
 fill="url(#colorLime)"
 />
 </AreaChart>
 </ResponsiveContainer>
 </div>
 </div>
 );
}