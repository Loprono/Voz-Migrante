import styles from '../styles/Button.module.css';

export function Button({ label, onClick, variant = 'default', wide = false }) {
  return (
    <button
      className={[
        styles.btn,
        styles[variant],
        wide ? styles.wide : '',
      ].join(' ')}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
