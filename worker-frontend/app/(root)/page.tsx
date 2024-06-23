import Appbar from "@/components/Appbar";
import {NextTask} from "@/components/NextTask";
import Image from "next/image";

export default function Home() {
  return (
    <main>
      <Appbar/>
      <NextTask/>
    </main>
  );
}
