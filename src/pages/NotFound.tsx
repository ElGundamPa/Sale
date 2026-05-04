import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-casino-felt-pattern">
      <p className="font-display text-7xl uppercase tracking-widest text-gold-glow">
        404
      </p>
      <p className="mt-2 text-sm uppercase tracking-widest opacity-70">
        House always wins — but not this hand
      </p>
      <Link
        to="/"
        className="casino-gold-btn mt-8 rounded-md px-6 py-2 font-display text-sm uppercase tracking-widest"
      >
        Back to floor
      </Link>
    </div>
  );
}
