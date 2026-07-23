import dynamic from "next/dynamic";

// ---------------------------------------------------------------------------
// /sync — Full sync management page
//
// Wrapped with dynamic(ssr:false) because the underlying component imports
// modules that access browser-only APIs (localStorage) at module level.
// ---------------------------------------------------------------------------

const SyncPageClient = dynamic(() => import("./SyncPageClient"), {
  ssr: false,
});

export default function SyncPage() {
  return <SyncPageClient />;
}
