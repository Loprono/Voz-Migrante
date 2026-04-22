import { useState } from 'react';

const calculate = (a, op, b) => {
  switch (op) {
    case '+': return a + b;
    case '-': return a - b;
    case '×': return a * b;
    case '÷': return b === 0 ? null : a / b;
    default: return b;
  }
};

const formatResult = (num) => {
  if (num === null) return 'Error';
  const str = String(parseFloat(num.toFixed(10)));
  return str;
};

export function useCalculator() {
  const [display, setDisplay] = useState('0');
  const [operand, setOperand] = useState(null);
  const [operator, setOperator] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const inputDigit = (digit) => {
    if (waitingForOperand) {
      setDisplay(String(digit));
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? String(digit) : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
      return;
    }
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const inputOperator = (nextOperator) => {
    const current = parseFloat(display);

    if (operand !== null && !waitingForOperand) {
      const result = calculate(operand, operator, current);
      const formatted = formatResult(result);
      setDisplay(formatted);
      setOperand(formatted === 'Error' ? null : parseFloat(formatted));
    } else {
      setOperand(current);
    }

    setWaitingForOperand(true);
    setOperator(nextOperator);
  };

  const equals = () => {
    if (operand === null || operator === null) return;
    const current = parseFloat(display);
    const result = calculate(operand, operator, current);
    setDisplay(formatResult(result));
    setOperand(null);
    setOperator(null);
    setWaitingForOperand(true);
  };

  const clear = () => {
    setDisplay('0');
    setOperand(null);
    setOperator(null);
    setWaitingForOperand(false);
  };

  const toggleSign = () => {
    setDisplay(String(parseFloat(display) * -1));
  };

  const percent = () => {
    setDisplay(String(parseFloat(display) / 100));
  };

  return { display, operator, inputDigit, inputDecimal, inputOperator, equals, clear, toggleSign, percent };
}
