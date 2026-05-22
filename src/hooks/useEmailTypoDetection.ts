import { useState, useCallback, useEffect, useRef } from 'react';
import { detectEmailTypo, mightHaveTypo, EmailTypoResult } from '@/lib/emailTypoDetection';

interface UseEmailTypoDetectionOptions {
  /** Initial email value */
  initialEmail?: string;
  /** Auto-dismiss suggestion after this many milliseconds (0 = never) */
  autoDismissMs?: number;
  /** Callback when typo is detected */
  onTypoDetected?: (result: EmailTypoResult) => void;
  /** Callback when suggestion is accepted */
  onSuggestionAccepted?: (correctedEmail: string, originalEmail: string) => void;
  /** Callback when suggestion is dismissed */
  onSuggestionDismissed?: (originalEmail: string, suggestedEmail: string) => void;
}

interface UseEmailTypoDetectionReturn {
  /** Current email value */
  email: string;
  /** Set email value directly */
  setEmail: (email: string) => void;
  /** Suggested correction (null if none) */
  suggestion: string | null;
  /** Whether to show the suggestion UI */
  showSuggestion: boolean;
  /** Accept the suggestion and update email */
  acceptSuggestion: () => void;
  /** Dismiss the suggestion */
  dismissSuggestion: () => void;
  /** Props to spread on input element */
  inputProps: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur: () => void;
  };
  /** Check for typos manually (useful for controlled inputs) */
  checkForTypos: (emailToCheck?: string) => void;
}

export function useEmailTypoDetection(
  options: UseEmailTypoDetectionOptions = {}
): UseEmailTypoDetectionReturn {
  const {
    initialEmail = '',
    autoDismissMs = 10000,
    onTypoDetected,
    onSuggestionAccepted,
    onSuggestionDismissed,
  } = options;

  const [email, setEmailState] = useState(initialEmail);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(new Set());
  
  const autoDismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear auto-dismiss timer on unmount
  useEffect(() => {
    return () => {
      if (autoDismissTimerRef.current) {
        clearTimeout(autoDismissTimerRef.current);
      }
    };
  }, []);

  // Set up auto-dismiss timer when suggestion is shown
  useEffect(() => {
    if (showSuggestion && autoDismissMs > 0) {
      autoDismissTimerRef.current = setTimeout(() => {
        setShowSuggestion(false);
      }, autoDismissMs);

      return () => {
        if (autoDismissTimerRef.current) {
          clearTimeout(autoDismissTimerRef.current);
        }
      };
    }
  }, [showSuggestion, autoDismissMs]);

  const checkForTypos = useCallback((emailToCheck?: string) => {
    const emailValue = emailToCheck ?? email;
    
    // Quick check first
    if (!mightHaveTypo(emailValue)) {
      setSuggestion(null);
      setShowSuggestion(false);
      return;
    }

    const result = detectEmailTypo(emailValue);
    
    if (result.hasTypo && result.suggestion) {
      // Check if this suggestion was already dismissed for this email
      const suggestionKey = `${emailValue}:${result.suggestion}`;
      if (dismissedSuggestions.has(suggestionKey)) {
        return;
      }

      setSuggestion(result.suggestion);
      setShowSuggestion(true);
      onTypoDetected?.(result);
    } else {
      setSuggestion(null);
      setShowSuggestion(false);
    }
  }, [email, dismissedSuggestions, onTypoDetected]);

  const setEmail = useCallback((newEmail: string) => {
    setEmailState(newEmail);
    // Clear suggestion when email changes
    if (showSuggestion) {
      setShowSuggestion(false);
      setSuggestion(null);
    }
  }, [showSuggestion]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmailState(newEmail);
    // Clear suggestion when typing
    if (showSuggestion) {
      setShowSuggestion(false);
      setSuggestion(null);
    }
  }, [showSuggestion]);

  const handleBlur = useCallback(() => {
    // Only check on blur if email looks like a complete email
    if (email && email.includes('@') && email.includes('.')) {
      checkForTypos(email);
    }
  }, [email, checkForTypos]);

  const acceptSuggestion = useCallback(() => {
    if (suggestion) {
      const originalEmail = email;
      setEmailState(suggestion);
      setShowSuggestion(false);
      setSuggestion(null);
      onSuggestionAccepted?.(suggestion, originalEmail);
    }
  }, [suggestion, email, onSuggestionAccepted]);

  const dismissSuggestion = useCallback(() => {
    if (suggestion) {
      // Add to dismissed set to prevent re-showing
      const suggestionKey = `${email}:${suggestion}`;
      setDismissedSuggestions(prev => new Set(prev).add(suggestionKey));
      onSuggestionDismissed?.(email, suggestion);
    }
    setShowSuggestion(false);
    setSuggestion(null);
  }, [email, suggestion, onSuggestionDismissed]);

  return {
    email,
    setEmail,
    suggestion,
    showSuggestion,
    acceptSuggestion,
    dismissSuggestion,
    inputProps: {
      value: email,
      onChange: handleChange,
      onBlur: handleBlur,
    },
    checkForTypos,
  };
}

export default useEmailTypoDetection;
