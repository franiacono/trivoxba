import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import HomeClient from "@/components/HomeClient";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HomeClient />
    </div>
  );
}
