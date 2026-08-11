import type { Metadata } from "next";
import Link from "next/link";
import { FarmGame } from "@natan-games/farm-game";
import "@natan-games/farm-game/styles.css";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Sunny Acre Farm · Natan Games",
  description:
    "Plant, grow, and harvest in a 3D countryside farm with animated crops and interactive fields.",
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
