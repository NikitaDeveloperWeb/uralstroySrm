'use client';

import { useState, useRef, useCallback } from 'react';

interface EditableCellProps<T extends string = string> {
  value: string | number;
  field: T;
  index: number;
  onChange: (index: number, field: T, value: string | number) => void;
  type?: 'text' | 'number';
  placeholder?: string;
  className?: string;
}

export function EditableCell<T extends string = string>({ value, field, index, onChange, type = 'text', placeholder, className }: EditableCellProps<T>) {
  const [localValue, setLocalValue] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    
    // Debounce save to parent
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    
    saveTimerRef.current = setTimeout(() => {
      const finalValue = type === 'number' ? (parseFloat(newValue) || 0) : newValue;
      onChange(index, field, finalValue);
    }, 300);
  }, [index, field, onChange, type]);

  const handleBlur = useCallback(() => {
    // Save immediately on blur
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    const finalValue = type === 'number' ? (parseFloat(localValue) || 0) : localValue;
    onChange(index, field, finalValue);
  }, [index, field, localValue, onChange, type]);

  // Sync with parent value changes (not from user input)
  const prevValueRef = useRef(value);
  if (value !== prevValueRef.current) {
    setLocalValue(String(value));
    prevValueRef.current = value;
  }

  return (
    <input
      ref={inputRef}
      type={type}
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={className}
    />
  );
}
