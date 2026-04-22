import styles from '../styles/Display.module.css';

export function Display({ value }) {
  const fontSize = value.length > 9 ? '1.6rem' : value.length > 6 ? '2rem' : '2.8rem';
  return (
    <div className={styles.display}>
      <span style={{ fontSize }}>{value}</span>
    </div>
  );
}
