/**
 * Subtle animated backdrop: slow-drifting gold orbs plus a faint film-grain
 * overlay. Pure decoration — pointer-events-none, very low opacity, and
 * fully disabled by the admin "animations off" toggle / reduced motion.
 */
export default function AmbientBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <div className="orb absolute -top-48 left-[12%] h-[34rem] w-[34rem] rounded-full bg-gold/[0.06] blur-3xl" />
      <div className="orb orb-2 absolute bottom-[-10%] right-[8%] h-[30rem] w-[30rem] rounded-full bg-gold/[0.05] blur-3xl" />
      <div className="grain absolute inset-0 opacity-[0.05]" />
    </div>
  );
}
