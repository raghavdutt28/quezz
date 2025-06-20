import {NextTask} from "@/components/NextTask";
import PayoutBtn from "@/components/PayoutBtn";

export default function Home() {
  return (
    <main>
      <p className="text-sm text-center pt-4">please switch to Devnet in your wallet for transaction purposes.</p>
      <NextTask/>
    </main>
  );
}
