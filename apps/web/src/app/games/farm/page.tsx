import type { Metadata } from "next";
import Link from "next/link";
import { FarmGame } from "@natan-games/farm-game";
import "@natan-games/farm-game/styles.css";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Sunny Acre Farm · Natan Games",
  description:
    "Plant, grow, and harvest on a colorful countryside farm — classic barn, crops, and cozy farmyard vibes.",
};

export default function FarmGamePage() {
  return (
    <div className={styles.page}>
      <div className={styles.bar}>
        <Link href="/" className={styles.back}>
          ← Natan Games
        </Link>
      </div>
      <FarmGame />
    </div>
  );
}
