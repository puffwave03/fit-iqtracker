export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 bg-slate-950 text-white">
      <h1 className="text-3xl font-bold text-lime-400 mb-2">
        Benvenuto su FitIQtracker 💪
      </h1>
      <p className="text-gray-400 mb-6">
        Monitora la tua nutrizione, i tuoi allenamenti e i tuoi progressi in un’unica app intelligente.
      </p>

      <div className="flex gap-4 flex-wrap justify-center">
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 w-40 text-center hover:border-lime-400 transition">
          🍎 Nutrizione
        </div>
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 w-40 text-center hover:border-lime-400 transition">
          💪 Allenamenti
        </div>
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 w-40 text-center hover:border-lime-400 transition">
          📊 Progressi
        </div>
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 w-40 text-center hover:border-lime-400 transition">
          📓 Diario
        </div>
      </div>
    </div>
  );
}
