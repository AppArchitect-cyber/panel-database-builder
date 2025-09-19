import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Trash2, CheckSquare, Square, Calendar, MessageCircleMore } from "lucide-react";
import { format } from "date-fns";

interface Submission {
  id: string;
  name: string;
  mobile_number: string;
  selected_website: string;
  status: string | null;
  submitted_at: string;
}

const UserSubmissions = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    const { data, error } = await supabase
      .from("user_submissions")
      .select("*")
      .order("submitted_at", { ascending: false });

    if (!error) {
      setSubmissions(data || []);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const deleteSelected = async () => {
    if (selectedIds.length === 0) return;
    const { error } = await supabase
      .from("user_submissions")
      .delete()
      .in("id", selectedIds);

    if (!error) {
      setSubmissions((prev) => prev.filter((s) => !selectedIds.includes(s.id)));
      setSelectedIds([]);
    }
  };

  const toggleContacted = async (id: string, currentStatus: string | null) => {
    const newStatus = currentStatus === "pending" ? "contacted" : "pending";
    const { error } = await supabase
      .from("user_submissions")
      .update({ status: newStatus })
      .eq("id", id);

    if (!error) {
      setSubmissions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
      );
    }
  };

  const exportCSV = () => {
    const header = "Name,Mobile Number,Website,Status,Submitted At\n";
    const filtered = submissions.filter(submission => isInRange(submission.submitted_at));
    const rows = filtered
      .map((s) =>
        [
          s.name,
          `+91${s.mobile_number}`,
          s.selected_website,
          s.status,
          format(new Date(s.submitted_at), "yyyy-MM-dd HH:mm"),
        ].join(",")
      )
      .join("\n");

    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "user_submissions.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const isInRange = (date: string) => {
    if (!startDate && !endDate) return true;
    const submitted = new Date(date);
    const start = startDate ? new Date(startDate) : new Date("2000-01-01");
    const end = endDate ? new Date(endDate) : new Date("2100-01-01");
    return submitted >= start && submitted <= end;
  };

  return (
    <div className="p-4 text-white">
      <h2 className="text-xl font-bold text-amber-400 mb-4">User Submissions</h2>

      <div className="flex flex-wrap gap-4 mb-4 items-center">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-white" />
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-black border-gray-700 text-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-white" />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-black border-gray-700 text-white"
          />
        </div>
        <Button onClick={exportCSV} className="bg-amber-500 hover:bg-amber-600">
          <Download className="w-4 h-4 mr-2" /> Download Data
        </Button>
        {selectedIds.length > 0 && (
          <Button onClick={deleteSelected} className="bg-red-600 hover:bg-red-700">
            <Trash2 className="w-4 h-4 mr-2" /> Delete Selected
          </Button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border border-gray-700 text-sm text-left">
          <thead className="bg-gray-800">
            <tr>
              <th className="p-2">#</th>
              <th className="p-2">
                <input
                  type="checkbox"
                  onChange={(e) =>
                    setSelectedIds(
                      e.target.checked ? submissions.map((s) => s.id) : []
                    )
                  }
                />
              </th>
              <th className="p-2">Name</th>
              <th className="p-2">Mobile</th>
              <th className="p-2">Website</th>
              <th className="p-2">Status</th>
              <th className="p-2">Submitted At</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((s, index) => (
              <tr
                key={s.id}
                className={`border-t border-gray-700 hover:bg-gray-800 ${
                  isInRange(s.submitted_at) ? "bg-gray-800/70" : ""
                }`}
              >
                <td className="p-2">{index + 1}</td>
                <td className="p-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(s.id)}
                    onChange={() => toggleSelect(s.id)}
                  />
                </td>
                <td className="p-2">{s.name}</td>
                <td className="p-2 flex items-center gap-2">
                  {s.mobile_number}
                  {s.mobile_number && (
                    <a
                      href={`https://wa.me/91${s.mobile_number}?text=${encodeURIComponent(
                        `Hello ${s.name}, this is Reddy Book support team.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-400 hover:text-green-500"
                      title="Chat on WhatsApp"
                    >
                      <MessageCircleMore className="w-4 h-4" />
                    </a>
                  )}
                </td>
                <td className="p-2">{s.selected_website}</td>
                <td className="p-2">
                  <button
                    onClick={() => toggleContacted(s.id, s.status)}
                    className="flex items-center gap-1 text-xs"
                  >
                    {s.status === "contacted" ? (
                      <>
                        <CheckSquare className="w-4 h-4 text-green-400" />
                        Contacted
                      </>
                    ) : (
                      <>
                        <Square className="w-4 h-4 text-gray-400" />
                        Pending
                      </>
                    )}
                  </button>
                </td>
                <td className="p-2">
                  {s.submitted_at
                    ? format(new Date(s.submitted_at), "yyyy-MM-dd HH:mm")
                    : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserSubmissions;
