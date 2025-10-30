"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { format } from "date-fns";

export default function WorkoutsPage() {
const [workouts, setWorkouts] = useState<any[]>([]);
const [type, setType] = useState("corsa");
const [duration, setDuration] = useState("");
const [calories, setCalories] = useState("");
const [note, setNote] = useState("");
const [loading, setLoading] = useState(false);

// 🔹 Carica allenamenti utente
const fetchWorkouts = async () => {
const { data: user } = await supabase.auth.getUser();
if (!user?.user) return;

const { data, error } = await supabase
.from("workouts")
.select("*")
.eq("user_id", user.user.id)
.order("date", { ascending: false });

if (!error && data) setWorkouts(data);
};

useEffect(() => {
fetchWorkouts();
}, []);

// 🔹 Aggiungi nuovo allenamento
const handleAddWorkout = async () => {
if (!duration || !calories) {
alert("⚠️ Inserisci durata e calorie!");
return;
}

setLoading(true);
const { data: user } = await supabase.auth.getUser();
if (!user?.user) {
alert("⚠️ Devi effettuare il login.");
setLoading(false);
return;
}

const { error } = await supabase.from("workouts").insert([
{
user_id: user.user.id,
workout_type: type,
duration_min: Number(duration),
calories_burned: Number(calories),
note,
date: new Date().toISOString().split("T")[0],
},
]);

setLoading(false);
if (error) {
alert("❌ Errore durante il salvataggio dell'allenamento.");
console.error(error.message);
} else {
alert("✅ Allenamento aggiunto con successo!");
setDuration("");
setCalories("");
setNote("");
fetchWorkouts();
}
};

return (
<div className="min-h-screen bg-slate-950 text-white flex flex-col items-center p-6 pb-24">
<h1 className="text-3xl font-bold text-lime-400 mb-4">💪 Allenamenti</h1>

{/* FORM INSERIMENTO */}
<div className="w-full max-w-md bg-slate-900 border border-slate-800 p-4 rounded-xl mb-6">
<select
value={type}
onChange={(e) => setType(e.target.value)}
className="w-full mb-2 p-2 rounded bg-slate-800 border border-slate-700"
>
<option value="corsa">🏃‍♂️ Corsa</option>
<option value="camminata">🚶‍♀️ Camminata</option>
<option value="palestra">🏋️‍♂️ Palestra</option>
<option value="yoga">🧘 Yoga</option>
<option value="nuoto">🏊‍♂️ Nuoto</option>
</select>

<input
type="number"
placeholder="Durata (minuti)"
value={duration}
onChange={(e) => setDuration(e.target.value)}
className="w-full mb-2 p-2 rounded bg-slate-800 border border-slate-700"
/>

<input
type="number"
placeholder="Calorie bruciate"
value={calories}
onChange={(e) => setCalories(e.target.value)}
className="w-full mb-2 p-2 rounded bg-slate-800 border border-slate-700"
/>

<textarea
placeholder="Note (opzionale)"
value={note}
onChange={(e) => setNote(e.target.value)}
className="w-full mb-3 p-2 rounded bg-slate-800 border border-slate-700"
/>
<textarea
value={note}
onChange={(e) => setNote(e.target.value)}
placeholder="Note (opzionale)"
className="w-full p-2 rounded bg-slate-800 border border-slate-700 mb-3"
/>

<button
onClick={handleAddWorkout}
disabled={loading}
className="w-full py-2 bg-lime-500 text-slate-900 font-semibold rounded-lg hover:bg-lime-400 transition disabled:opacity-50"
>
{loading ? "⏳ Salvataggio..." : "✅ Aggiungi Allenamento"}
</button>
</div>

{/* STORICO */}
<div className="w-full max-w-md">
<h2 className="text-lg text-lime-400 font-semibold mb-2">
📅 Storico Allenamenti
</h2>
{workouts.length === 0 ? (
<p className="text-gray-500 text-sm text-center">
Nessun allenamento registrato.
</p>
) : (
workouts.map((w) => (
<div
key={w.id}
className="bg-slate-900 border border-slate-800 rounded-lg p-3 mb-2"
>
<p className="text-lime-400 text-sm font-semibold">
{w.workout_type} – {format(new Date(w.date), "dd/MM/yyyy")}
</p>
<p className="text-gray-300 text-sm">
Durata: {w.duration_min} min
</p>
<p className="text-gray-400 text-sm">
🔥 {w.calories_burned} kcal
</p>
{w.notes && (
<p className="text-gray-500 text-sm italic mt-1">{w.notes}</p>
)}
</div>
))
)}
</div>
</div>
);
}