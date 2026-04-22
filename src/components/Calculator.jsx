import { useCalculator } from '../hooks/useCalculator';
import { Display } from './Display';
import { ButtonGrid } from './ButtonGrid';
import styles from '../styles/Calculator.module.css';

export function Calculator() {
  const {
    display, inputDigit, inputDecimal,
    inputOperator, equals, clear, toggleSign, percent,
  } = useCalculator();

  return (
    <div className={styles.calculator}>
      <Display value={display} />
      <ButtonGrid
        onDigit={inputDigit}
        onDecimal={inputDecimal}
        onOperator={inputOperator}
        onEquals={equals}
        onClear={clear}
        onToggleSign={toggleSign}
        onPercent={percent}
      />
    </div>
  );
}
