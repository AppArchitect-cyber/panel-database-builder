import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";

const WhatsAppSettings = () => {
  const [number, setNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "whatsapp")
        .single();

      setNumber(data?.value || "");
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    const { error } = await supabase
      .from("settings")
      .upsert([{ key: "whatsapp", value: number }], { onConflict: ["key"] });

    setMessage(error ? "❌ Failed to update" : "✅ WhatsApp number updated");
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-4 space-y-2 border rounded-lg max-w-md">
      <h2 className="text-lg font-semibold">Change WhatsApp Number</h2>
      <input
        type="text"
        className="w-full border px-3 py-2 rounded"
        value={number}
        onChange={(e) => setNumber(e.target.value)}
        placeholder="Enter WhatsApp number"
      />
      <Button onClick={save}>Save Number</Button>
      {message && <p className="text-sm text-green-600">{message}</p>}
    </div>
  );
};

export default WhatsAppSettings;
