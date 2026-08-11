import Link from "next/link";
import styles from "./page.module.css";

const games = [
  {
    id: "farm",
    name: "Sunny Acre Farm",
    tagline: "3D farm sim — plant, watch crops grow, harvest under the sun.",
    href: "/games/farm",
    status: "Playable",
    tone: "farm",
  },
] as const;

export default function HomePage() {
  return (
    <div className={styles.shell}>
      <div className={styles.atmosphere} aria-hidden>
        <span className={styles.sun} />
        <span className={styles.cloud} />
        <span className={styles.cloudLate} />
        <span className={styles.field} />
      </div>

      <header className={styles.top}>
        <p className={styles.brand}>Natan Games</p>
        <nav className={styles.nav} aria-label="Primary">
          <a href="#games">Games</a>
        </nav>
      </header>

      <main className={styles.hero}>
        <p className={styles.brandHero}>Natan Games</p>
        <h1>Web games built to keep growing.</h1>
        <p className={styles.lede}>
          A monorepo home for many playable titles. First up: a Hay Day–style
          farm you can plant and harvest in the browser.
        </p>
        <div className={styles.ctaRow}>
          <Link className={styles.cta} href="/games/farm">
            Play Sunny Acre
          </Link>
          <a className={styles.ghost} href="#games">
            Browse catalog
          </a>
        </div>
      </main>

      <section id="games" className={styles.catalog}>
        <h2>Game catalog</h2>
        <p className={styles.catalogLede}>
          More games will land here as packages under the same workspace.
        </p>
        <ul className={styles.list}>
          {games.map((game) => (
            <li key={game.id} className={styles.item} data-tone={game.tone}>
              <div>
                <p className={styles.status}>{game.status}</p>
                <h3>{game.name}</h3>
                <p>{game.tagline}</p>
              </div>
              <Link href={game.href}>Open game</Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
