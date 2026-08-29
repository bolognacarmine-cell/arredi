import type { CSSProperties, ReactNode } from "react";
import styles from "./HeroBackgroundEffect.module.css";

type Props = {
  img1: string;
  img2: string;
  durationSec?: number;
  className?: string;
  children?: ReactNode;
};

export default function HeroBackgroundEffect({
  img1,
  img2,
  durationSec = 12,
  className = "",
  children,
}: Props) {
  const styleVars = {
    ["--img1" as any]: `url("${img1}")`,
    ["--img2" as any]: `url("${img2}")`,
    ["--duration" as any]: `${durationSec}s`,
  } satisfies CSSProperties;

  return (
    <section className={`${styles.hero} ${className}`} style={styleVars} aria-label="Hero home">
      <div className={`${styles.layer} ${styles.layer1}`} aria-hidden="true" />
      <div className={`${styles.layer} ${styles.layer2}`} aria-hidden="true" />
      <div className={styles.overlay} aria-hidden="true" />
      <div className={styles.grain} aria-hidden="true" />
      <div className={styles.content}>{children}</div>
    </section>
  );
}

