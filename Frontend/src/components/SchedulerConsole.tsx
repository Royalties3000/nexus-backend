import { runScheduler } from "../api/scheduling";

export function SchedulerConsole() {
  const handleRun = async () => {
    try {
      const result = await runScheduler();
      // Show the user what the Python logic decided
      alert(`Success! ${result.message}`);
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    }
  };

  return (
    <div className="p-4 border rounded shadow">
      <button 
        onClick={handleRun}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Run Scheduler
      </button>
    </div>
  );
}