import { Button } from './Button';
import styles from '../styles/Calculator.module.css';

export function ButtonGrid({ onDigit, onDecimal, onOperator, onEquals, onClear, onToggleSign, onPercent }) {
  return (
    <div className={styles.grid}>
      <Button label="C"   onClick={onClear}            variant="action" />
      <Button label="+/-" onClick={onToggleSign}        variant="action" />
      <Button label="%"   onClick={onPercent}           variant="action" />
      <Button label="÷"   onClick={() => onOperator('÷')} variant="operator" />

      <Button label="7" onClick={() => onDigit(7)} />
      <Button label="8" onClick={() => onDigit(8)} />
      <Button label="9" onClick={() => onDigit(9)} />
      <Button label="×" onClick={() => onOperator('×')} variant="operator" />

      <Button label="4" onClick={() => onDigit(4)} />
      <Button label="5" onClick={() => onDigit(5)} />
      <Button label="6" onClick={() => onDigit(6)} />
      <Button label="-" onClick={() => onOperator('-')} variant="operator" />

      <Button label="1" onClick={() => onDigit(1)} />
      <Button label="2" onClick={() => onDigit(2)} />
      <Button label="3" onClick={() => onDigit(3)} />
      <Button label="+" onClick={() => onOperator('+')} variant="operator" />

      <Button label="0" onClick={() => onDigit(0)} wide />
      <Button label="." onClick={onDecimal} />
      <Button label="=" onClick={onEquals} variant="operator" />
    </div>
  );
}
