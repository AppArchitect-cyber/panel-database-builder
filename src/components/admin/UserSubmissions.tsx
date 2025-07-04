import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { Trash2, Download, CheckSquare, Square } from "lucide-react";
import { saveAs } from "file-saver";

interface Submission {
  id: string;
  name: string;
  mobile_number: string;
  selected_website: string;
  status: string; // text: 'pending' or 'contacted'
  submitted_at: string;
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
      query = query
        .gte("submitted_at", fromDate)
        .lte("submitted_at", toDate + "T23:59:59");
    }

    const { data, error } = await query;
    if (error) console.error(error);
    else setSubmissions(data || []);
  };

  useEffect(() => {
    fetchSubmissions();
  }, [fromDate, toDate]);

  const handleDownload = () => {
    const filtered = submissions.filter((s) => {
      if (!fromDate || !toDate) return true;
      const date = new Date(s.submitted_at);
      return (
        date >= new Date(fromDate) &&
        date <= new Date(toDate + "T23:59:59")
      );
    });

    const csvContent = [
      ["Name", "Mobile", "Website", "Status", "Submitted At"],
      ...filtered.map((s) => [
        s.name,
        s.mobile_number,
        s.selected_website,
        s.status,
        format(new Date(s.submitted_at), "yyyy-MM-dd HH:mm"),
      ]),
    ]
      .map((e) => e.join(","))
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    saveAs(blob, "user_submissions.csv");
  };

  const handleDelete = async () => {
    if (selectedIds.length === 0) return;

    const { error } = await supabase
      .from("user_submissions")
      .delete()
      .in("id", selectedIds);

    if (error) {
      console.error("Delete error:", error);
    } else {
      await fetchSubmissions();
      setSelectedIds([]);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleContacted = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "contacted" ? "pending" : "contacted";
    const { error } = await supabase
      .from("user_submissions")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) console.error("Update error:", error);
    else fetchSubmissions();
  };

  const isInRange = (dateStr: string) => {
    if (!fromDate || !toDate) return false;
    const d = new Date(dateStr);
    return (
      d >= new Date(fromDate) && d <= new Date(toDate + "T23:59:59")
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
              <th className="p-2">Status</th>
              <th className="p-2">Submitted At</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((s) => (
              <tr
                key={s.id}
                className={`border-t border-gray-700 hover:bg-gray-800 ${
                  isInRange(s.submitted_at) ? "bg-gray-800/70" : ""
                }`}
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
