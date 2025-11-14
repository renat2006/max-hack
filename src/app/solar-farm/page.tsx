"use client";

import dynamic from "next/dynamic";

const SolarFarmView = dynamic(
  () =>
    import("../components/views/solar-farm-view").then((mod) => ({ default: mod.SolarFarmView })),
  { ssr: false },
);

export default function SolarFarmPage() {
  return (
    <main className="flex min-h-screen w-full items-stretch bg-black p-4">
      <SolarFarmView />
    </main>
  );
}
