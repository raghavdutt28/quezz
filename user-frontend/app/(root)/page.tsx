import Appbar from "@/components/Appbar";
import Hero from "@/components/Hero";
import Upload from "@/components/Upload";

export default function Home() {
  return (
    <main>
      <Appbar />
      <p className="text-sm flex justify-center pt-4">please switch to Devnet in your wallet for transaction purposes.</p>
      <Hero />
      <Upload/>
    </main>
  );
}
