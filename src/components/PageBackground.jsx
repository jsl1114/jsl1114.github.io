import { useCursorSpotlight } from "@/hooks/useCursorSpotlight";

const PageBackground = () => {
  useCursorSpotlight();

  return (
    <>
      {/* Light mode base */}
      <div className="fixed inset-0 z-[-2] dark:hidden bg-[#fafafa]" />

      {/* Light mode cursor spotlight (gentle) */}
      <div
        className="fixed inset-0 z-[-1] dark:hidden pointer-events-none"
        style={{
          background:
            "radial-gradient(800px circle at var(--mx, 50%) var(--my, 40%), color-mix(in srgb, var(--color-ink) 5%, transparent), transparent 60%)",
        }}
      />

      {/* Dark mode base */}
      <div className="fixed inset-0 z-[-2] hidden dark:block bg-[#0b1120]" />

      {/* Dark mode grain overlay */}
      <div className="fixed inset-0 z-[-1] hidden dark:block pointer-events-none bg-grain opacity-60" />

      {/* Dark mode cursor spotlight (strong) */}
      <div
        className="fixed inset-0 z-[-1] hidden dark:block pointer-events-none"
        style={{
          background:
            "radial-gradient(850px circle at var(--mx, 50%) var(--my, 40%), rgba(255,255,255,0.06), transparent 65%)",
        }}
      />
    </>
  );
};

export default PageBackground;
