import React from 'react';
import { cn } from '../../lib/utils';
import { VoiceInputButton } from '../voice/VoiceInputButton';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  enableVoice?: boolean;
  onVoiceResult?: (englishText: string, originalText?: string) => void;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, enableVoice, onVoiceResult, ...props }, ref) => {
    const inputId = id || props.name || Math.random().toString(36).substring(2, 7);

    const handleVoiceTranscript = (text: string, orig?: string) => {
      if (onVoiceResult) {
        onVoiceResult(text, orig);
      } else if (props.onChange) {
        const syntheticEvent = {
          target: { value: text, name: props.name || '' },
          currentTarget: { value: text, name: props.name || '' },
        } as React.ChangeEvent<HTMLInputElement>;
        props.onChange(syntheticEvent);
      }
    };

    return (
      <div className="w-full">
        {(label || enableVoice) && (
          <div className="flex items-center justify-between mb-1.5">
            {label ? (
              <label htmlFor={inputId} className="block text-xs font-semibold text-brand-navy uppercase tracking-wider">
                {label}
                {props.required && <span className="text-brand-orange ml-0.5">*</span>}
              </label>
            ) : <span />}
            {enableVoice && (
              <VoiceInputButton
                size="sm"
                currentValue={String(props.value || '')}
                onTranscript={handleVoiceTranscript}
              />
            )}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full rounded-lg border border-brand-border bg-white px-3.5 py-2.5 text-sm text-brand-text placeholder-brand-secondary/60 transition-colors',
            'focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy',
            'disabled:bg-brand-muted disabled:text-brand-secondary disabled:cursor-not-allowed',
            error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-rose-600 font-medium">{error}</p>}
        {!error && helperText && <p className="mt-1 text-xs text-brand-secondary">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  enableVoice?: boolean;
  onVoiceResult?: (englishText: string, originalText?: string) => void;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, enableVoice, onVoiceResult, ...props }, ref) => {
    const inputId = id || props.name || Math.random().toString(36).substring(2, 7);

    const handleVoiceTranscript = (text: string, orig?: string) => {
      if (onVoiceResult) {
        onVoiceResult(text, orig);
      } else if (props.onChange) {
        const syntheticEvent = {
          target: { value: text, name: props.name || '' },
          currentTarget: { value: text, name: props.name || '' },
        } as React.ChangeEvent<HTMLTextAreaElement>;
        props.onChange(syntheticEvent);
      }
    };

    return (
      <div className="w-full">
        {(label || enableVoice) && (
          <div className="flex items-center justify-between mb-1.5">
            {label ? (
              <label htmlFor={inputId} className="block text-xs font-semibold text-brand-navy uppercase tracking-wider">
                {label}
                {props.required && <span className="text-brand-orange ml-0.5">*</span>}
              </label>
            ) : <span />}
            {enableVoice && (
              <VoiceInputButton
                size="sm"
                mode="append"
                currentValue={String(props.value || '')}
                onTranscript={handleVoiceTranscript}
              />
            )}
          </div>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            'w-full rounded-lg border border-brand-border bg-white px-3.5 py-2.5 text-sm text-brand-text placeholder-brand-secondary/60 transition-colors min-h-[90px]',
            'focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy',
            'disabled:bg-brand-muted disabled:text-brand-secondary disabled:cursor-not-allowed',
            error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-rose-600 font-medium">{error}</p>}
        {!error && helperText && <p className="mt-1 text-xs text-brand-secondary">{helperText}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, id, children, options, ...props }, ref) => {
    const selectId = id || props.name || Math.random().toString(36).substring(2, 7);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-semibold text-brand-navy uppercase tracking-wider mb-1.5">
            {label}
            {props.required && <span className="text-brand-orange ml-0.5">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'w-full rounded-lg border border-brand-border bg-white px-3.5 py-2.5 text-sm text-brand-text transition-colors',
            'focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy',
            'disabled:bg-brand-muted disabled:text-brand-secondary disabled:cursor-not-allowed',
            error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500',
            className
          )}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        {error && <p className="mt-1.5 text-xs text-rose-600 font-medium">{error}</p>}
        {!error && helperText && <p className="mt-1 text-xs text-brand-secondary">{helperText}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
