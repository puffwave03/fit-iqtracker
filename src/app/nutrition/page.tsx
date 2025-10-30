"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function NutritionPage() {
 const [foods, setFoods] = useState<any[]>([]);
 const [filteredFoods, setFilteredFoods] = useState<any[]>([]);
 const [search, setSearch] = useState("");
 const [food, setFood] = useState<any | null>(null);
 const [mealType, setMealType] = useState("colazione");
 const [note, setNote] = useState("");
 const [meals, setMeals] = useState<any[]>([]);
 const [loading, setLoading] = useState(false);

 // Carica lista alimenti da Supabase
 const fetchFoods = async () => {
 const { data, error } = await supabase
 .from("foods")
 .select("*")
 .order("name", { ascending: true });
console.log("🔍 Foods:", data, "Error:", error);
 if (!error && data) setFoods(data);
 };

 // Carica pasti dell’utente
 const fetchMeals = async () => {
 const { data: user } = await supabase.auth.getUser();
 if (!user?.user) return;

 const { data, error } = await supabase
 .from("meals")
 .select("*")
 .eq("user_id", user.user.id)
 .order("date", { ascending: false });

 if (!error && data) setMeals(data);
 };

 useEffect(() => {
 fetchFoods();
 fetchMeals();
 }, []);

 // Ricerca alimenti
 const handleSearch = (value: string) => {
 setSearch(value);
 if (value.trim() === "") {
 setFilteredFoods([]);
 return;
 }
 const results = foods.filter((f) =>
 f.name.toLowerCase().includes(value.toLowerCase())
 );
 setFilteredFoods(results.slice(0, 5)); // Mostra max 5 risultati
 };
// 🔹 Aggiungi pasto (corretto)
const handleAddMeal = async () => {
// Controlli di validazione
if (!food && !search.trim()) {
 alert(" Inserisci o seleziona un alimento!");
 return;
}
if (!mealType) {
 alert(" Seleziona il tipo di pasto!");
 return;
}

setLoading(true);

try {
const { data: user } = await supabase.auth.getUser();
if (!user?.user) {
alert("⚠️ Devi essere loggato per aggiungere pasti.");
setLoading(false);
return;
}

// Cerca se l’alimento è nel database
let selected = food;
if (!selected) {
const match = foods.find(
(f) => f.name.toLowerCase() === search.toLowerCase()
);
if (match) selected = match;
}

if (!selected) {
alert("⚠️ Seleziona un alimento valido dall’elenco o inseriscilo manualmente.");
setLoading(false);
return;
}

// Inserimento nel database
const { error } = await supabase.from("meals").insert([
{
user_id: user.user.id,
food: selected.name,
calories: selected.calories,
protein: selected.protein,
carbs: selected.carbs,
fat: selected.fat,
meal_type: mealType,
note,
date: new Date().toISOString().split("T")[0],
},
]);

if (error) throw error;

alert("✅ Pasto aggiunto con successo!");
setSearch("");
setFilteredFoods([]);
setFood(null);
setNote("");
fetchMeals();
} catch (err: any) {
console.error("❌ Errore:", err.message);
alert("Errore durante il salvataggio: " + err.message);
} finally {
setLoading(false);
}
};

 return (
 <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center p-6 pb-24">
 <h1 className="text-3xl font-bold text-lime-400 mb-6">
 Registro Nutrizione
 </h1>

 {/* Ricerca alimenti */}
 <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-4 rounded-xl mb-6">
 <input
 type="text"
 value={search}
 onChange={(e) => handleSearch(e.target.value)}
 placeholder="Cerca alimento..."
 className="w-full p-2 rounded bg-slate-800 border border-slate-700 mb-2"
 />

 {filteredFoods.length > 0 && (
 <div className="bg-slate-800 border border-slate-700 rounded-lg mb-3">
 {filteredFoods.map((f) => (
 <div
 key={f.id}
 onClick={() => {
 setFood(f);
 setSearch(f.name);
 setFilteredFoods([]);
 }}
 className="p-2 hover:bg-slate-700 cursor-pointer"
 >
 {f.name} ({f.calories} kcal)
 </div>
 ))}
 </div>
 )}

 {food && (
 <div className="text-sm bg-slate-800 border border-slate-700 rounded-lg p-3 mb-3">
 <p> <strong>{food.name}</strong></p>
 <p> Calorie: {food.calories}</p>
 <p> Proteine: {food.protein} g</p>
 <p> Carboidrati: {food.carbs} g</p>
 <p> Grassi: {food.fat} g</p>
 </div>
 )}

 <select
 value={mealType}
 onChange={(e) => setMealType(e.target.value)}
 className="w-full mb-2 p-2 rounded bg-slate-800 border border-slate-700"
 >
 <option value="colazione"> Colazione</option>
 <option value="pranzo"> Pranzo</option>
 <option value="cena"> Cena</option>
 <option value="spuntino"> Spuntino</option>
 </select>

 <textarea
 value={note}
 onChange={(e) => setNote(e.target.value)}
 placeholder="Note (opzionale)"
 className="w-full p-2 rounded bg-slate-800 border border-slate-700 mb-3"
 />

 <button
 onClick={handleAddMeal}
 disabled={loading}
 className="w-full py-2 bg-lime-500 text-slate-900 font-semibold rounded-lg hover:bg-lime-400 transition disabled:opacity-50"
 >
 {loading ? " Salvataggio..." : " Aggiungi Pasto"}
 </button>
 </div>

 {/* Storico pasti */}
 <div className="w-full max-w-md">
 <h2 className="text-lg text-lime-400 font-semibold mb-2">
 Storico Pasti
 </h2>
 {meals.length === 0 ? (
 <p className="text-gray-500 text-sm text-center">
 Nessun pasto registrato.
 </p>
 ) : (
 meals.map((m) => (
 <div
 key={m.id}
 className="bg-slate-900 border border-slate-800 rounded-lg p-3 mb-2"
 >
 <p className="text-lime-400 text-sm font-semibold">
 {m.meal_type} – {m.date}
 </p>
 <p>{m.food}</p>
 <p className="text-gray-400 text-sm">
 {m.calories} kcal • {m.protein}g proteine
 </p>
 </div>
 ))
 )}
 </div>
 </div>
 );
}