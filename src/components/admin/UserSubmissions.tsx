import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { Trash2, Download } from "lucide-react";
import { saveAs } from 'file-saver';

interface Submission {
  id: string;
  name: string;
  mobile_number: string;
  selected_website: string;
  contacted?: boolean;
  submitted_at?: string;
}

const UserSubmissions = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const fetchSubmissions = async () => {
    let query = supabase
      .from("user_submissions")
      .select("*")
      .order("submitted_at", { ascending: false });

    if (fromDate && toDate) {
      query = query.gte("submitted_at", fromDate).lte("submitted_at", toDate);
    }

    const { data, error } = await query;
    if (data) setSubmissions(data);
    else console.error(error);
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleDelete = async () => {
    if (selectedIds.length === 0) return;

    const { error } = await supabase
      .from("user_submissions")
      .delete()
      .in("id", selectedIds);

    if (error) {
      console.error("Delete error:", error);
    } else {
      setSubmissions(prev => prev.filter(s => !selectedIds.includes(s.id)));
      setSelectedIds([]);
    }
  };

  const handleDownload = () => {
    const filtered = submissions.filter((s) => {
      if (!fromDate || !toDate) return true;
      const submittedAt = new Date(s.submitted_at || "");
      return submittedAt >= new Date(fromDate) && submittedAt <= new Date(toDate);
    });

    const csvContent = [
      ["Name", "Mobile", "Website", "Contacted", "Submitted At"],
      ...filtered.map(s => [
        s.name,
        s.mobile_number,
        s.selected_website,
        s.contacted ? "Yes" : "No",
        s.submitted_at ? format(new Date(s.submitted_at), "yyyy-MM-dd HH:mm") : "",
      ])
    ]
      .map(e => e.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "user_submissions.csv");
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="bg-gray-900 p-4 rounded-lg shadow text-white">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <label className="text-sm">
          From:{" "}
          <Input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="text-black"
          />
        </label>
        <label className="text-sm">
          To:{" "}
          <Input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="text-black"
          />
        </label>

        <Button onClick={handleDownload} className="bg-orange-600 hover:bg-orange-700 text-white">
          <Download className="w-4 h-4 mr-2" />
          Download CSV
        </Button>
        <Button
          onClick={handleDelete}
          className="bg-red-600 hover:bg-red-700 text-white"
          disabled={selectedIds.length === 0}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Selected
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-auto rounded border border-gray-700">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-800 text-orange-400 uppercase text-xs">
            <tr>
              <th className="p-2">
                <input
                  type="checkbox"
                  checked={selectedIds.length === submissions.length}
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
              <th className="p-2">Contacted</th>
              <th className="p-2">Submitted At</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((s) => (
              <tr
                key={s.id}
                className="border-t border-gray-700 hover:bg-gray-800"
              >
                <td className="p-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(s.id)}
                    onChange={() => toggleSelect(s.id)}
                  />
                </td>
                <td className="p-2">{s.name}</td>
                <td className="p-2">{s.mobile_number}</td>
                <td className="p-2">{s.selected_website}</td>
                <td className="p-2">{s.contacted ? "Yes" : "No"}</td>
                <td className="p-2">{s.submitted_at ? format(new Date(s.submitted_at), "yyyy-MM-dd") : ""}</td>
              </tr>
            ))}
            {submissions.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center p-4 text-gray-500">
                  No submissions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserSubmissions;
