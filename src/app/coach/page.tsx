"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type CoachFeedback = {
  id: number;
  date: string | null;
  message: string | null;
  advice: string | null;
  mode: string | null;
  created_at: string | null;
};

export default function CoachPage() {
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState("");
  const [mode, setMode] = useState("motivazionale");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<CoachFeedback[]>([]);

  // 🔹 carica lo storico all'avvio
  const fetchHistory = async () => {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) return;

    const { data, error } = await supabase
      .from("ai_coach_feedbacks")
      .select("*")
      .eq("user_id", user.user.id)
      .order("created_at", { ascending: false })
      .limit(15);

    if (!error && data) {
      setHistory(data as CoachFeedback[]);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // 🔹 invio al coach
  const handleSend = async () => {
    if (!message.trim()) {
      alert("✏️ Scrivi un messaggio prima di inviare!");
      return;
    }

    setLoading(true);

    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) {
      alert("⚠️ Devi essere loggato per parlare con il coach.");
      setLoading(false);
      return;
    }

    // 👉 risposta finta per ora (la cambiamo con l’AI vera dopo)
    const simulated =
      mode === "motivazionale"
        ? "🔥 Grande! Continua così, oggi hai l’energia giusta."
        : mode === "rilassato"
        ? "🌿 Ok, vai piano oggi. Recuperare è parte dell’allenamento."
        : "📊 Ho registrato i tuoi dati: concentrati su costanza e qualità.";

    try {
      const { error } = await supabase.from("ai_coach_feedbacks").insert([
        {
          user_id: user.user.id,
          message,
          advice: simulated,
          mode,
          date: new Date().toISOString().split("T")[0],
        },
      ]);

      if (error) throw error;

      setFeedback(simulated);
      setMessage("");

      // aggiorna lista subito
      fetchHistory();
    } catch (err: any) {
      console.error(err.message);
      alert("❌ Errore durante il salvataggio.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center p-6 pb-24">
      <h1 className="text-3xl font-bold text-lime-400 mb-4">🤖 AI Coach</h1>

      {/* box input */}
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-4 rounded-xl mb-6">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Scrivi al coach... (es: oggi mi sento stanco / non so cosa allenare)"
          className="w-full h-28 p-3 bg-slate-800 border border-slate-700 rounded-lg text-white resize-none mb-3"
        />

        {/* selezione tono */}
        <label className="text-sm text-gray-400 mb-1 block">
          Stile del coach
        </label>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          className="w-full mb-3 p-2 bg-slate-800 border border-slate-700 rounded-lg"
        >
          <option value="motivazionale">💪 Motivazionale</option>
          <option value="rilassato">🌿 Rilassato</option>
          <option value="analitico">📊 Analitico</option>
        </select>

        <button
          onClick={handleSend}
          disabled={loading}
          className="w-full py-2 bg-lime-500 text-slate-900 font-semibold rounded-lg hover:bg-lime-400 transition disabled:opacity-50"
        >
          {loading ? "⏳ Invio..." : "💬 Invia al Coach"}
        </button>
      </div>

      {/* risposta dell'ultimo coach */}
      {feedback && (
        <div className="w-full max-w-md bg-slate-900 border border-lime-400 p-4 rounded-xl mb-6">
          <p className="text-lime-400 font-semibold mb-1">
            Risposta del coach:
          </p>
          <p>{feedback}</p>
        </div>
      )}

      {/* storico */}
      <div className="w-full max-w-md">
        <h2 className="text-lime-400 font-semibold mb-2">
          🕒 Storico conversazioni
        </h2>
        {history.length === 0 ? (
          <p className="text-gray-500 text-sm">
            Nessun messaggio ancora. Scrivi al coach qui sopra 👆
          </p>
        ) : (
          history.map((item) => (
            <div key={item.id}
              className="bg-slate-900 border border-slate-800 rounded-lg p-3 mb-2">
            
              <p className="text-xs text-gray-400 mb-1">
                {item.date} • modalità:{" "}
                <span className="text-lime-400">{item.mode}</span>
              </p>
              <p className="text-sm mb-1 text-white">
                <span className="text-gray-300">Tu:</span> {item.message}
              </p>
              <p className="text-sm text-gray-200">
                <span className="text-lime-400">Coach:</span> {item.advice}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
