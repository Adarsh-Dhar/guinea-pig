import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function ReviewModal({ onClose, onSubmit, loading }: {
  onClose: () => void,
  onSubmit: (content: string, rating: number) => void,
  loading: boolean
}) {
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-slate-900 rounded-xl p-6 w-full max-w-md border border-fuchsia-700/30">
        <h2 className="text-xl text-white font-bold mb-4">Submit Review</h2>
        <textarea
          className="w-full mb-2 px-3 py-2 rounded bg-white/10 text-white placeholder:text-white/40 border border-fuchsia-700/30 focus:outline-none"
          placeholder="Your review (markdown supported)"
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={4}
        />
        <div className="mb-4">
          <label className="text-white/70 mr-2">Rating:</label>
          <input
            type="range"
            min={1}
            max={5}
            value={rating}
            onChange={e => setRating(Number(e.target.value))}
            className="w-32"
          />
          <span className="ml-2 text-fuchsia-400 font-bold">{rating}/5</span>
        </div>
        <div className="flex gap-2">
          <Button
            className="bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white"
            onClick={() => onSubmit(content, rating)}
            disabled={loading || !content.trim()}
          >
            {loading ? "Submitting..." : "Submit"}
          </Button>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
        </div>
      </div>
    </div>
  );
} 