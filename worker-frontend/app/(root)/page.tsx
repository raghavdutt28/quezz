import Appbar from "@/components/Appbar";
import {NextTask} from "@/components/NextTask";
import Image from "next/image";

export default function Home() {
  return (
    <main>
      <Appbar/>
      <p className="text-sm flex justify-center pt-4">please switch to Devnet in your wallet for transaction purposes.</p>
      <NextTask/>
    </main>
  );
}
