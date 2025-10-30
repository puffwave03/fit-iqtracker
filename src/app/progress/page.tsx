"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ProgressPage() {
const [progress, setProgress] = useState<any[]>([]);
const [loading, setLoading] = useState(true);

const fetchProgress = async () => {
const { data: user } = await supabase.auth.getUser();
if (!user?.user) return;

const { data, error } = await supabase
.from("daily_progress")
.select("*")
.eq("user_id", user.user.id)
.order("date", { ascending: false });

if (!error && data) setProgress(data);
setLoading(false);
};

useEffect(() => {
fetchProgress();
}, []);

return (
<div className="min-h-screen bg-slate-950 text-white flex flex-col items-center p-6 pb-24">
<h1 className="text-3xl font-bold text-lime-400 mb-4">📊 Progressi</h1>

{loading ? (
<p>Caricamento...</p>
) : progress.length === 0 ? (
<p className="text-gray-400">Nessun dato registrato.</p>
) : (
progress.map((p) => (
<div
key={p.id}
className="bg-slate-900 border border-slate-800 rounded-lg p-3 mb-2 w-full max-w-md"
>
<p className="text-lime-400 text-sm">{p.date}</p>
<p>🔥 Calorie bruciate: {p.calories_burned}</p>
<p>🚶‍♂️ Passi: {p.steps}</p>
<p>⚖️ Peso: {p.weight ?? "-"} kg</p>
<p className="text-gray-400 text-sm">{p.note}</p>
</div>
))
)}
</div>
);
}