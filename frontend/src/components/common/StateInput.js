import React, { useState, useRef, useEffect } from 'react';
import { filterStates, normalizeState, INDIAN_STATES } from '../../utils/normalizeState';
import './StateInput.css';

/**
 * Smart State Input with:
 * - Autocomplete dropdown
 * - Fuzzy matching ("tamilnadu" → "Tamil Nadu")
 * - Keyboard navigation
 * - Auto-normalize on blur
 */
const StateInput = ({ value, onChange, placeholder = 'Type or select state...' }) => {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  // Sync external value changes
  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setHighlighted(0);

    if (val.trim()) {
      const filtered = filterStates(val);
      setSuggestions(filtered.slice(0, 8));
      setShowDropdown(true);
    } else {
      setSuggestions(INDIAN_STATES.slice(0, 8));
      setShowDropdown(true);
      onChange('');
    }
  };

  const handleFocus = () => {
    const filtered = query.trim() ? filterStates(query) : INDIAN_STATES;
    setSuggestions(filtered.slice(0, 8));
    setShowDropdown(true);
  };

  const handleSelect = (state) => {
    setQuery(state);
    onChange(state);
    setShowDropdown(false);
  };

  const handleBlur = () => {
    // Auto-normalize on blur — "tamilnadu" → "Tamil Nadu"
    setTimeout(() => {
      if (query.trim()) {
        const normalized = normalizeState(query);
        if (normalized !== query) {
          setQuery(normalized);
          onChange(normalized);
        } else {
          onChange(query);
        }
      }
      setShowDropdown(false);
    }, 150);
  };

  const handleKeyDown = (e) => {
    if (!showDropdown) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (suggestions[highlighted]) handleSelect(suggestions[highlighted]);
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  return (
    <div className="state-input-wrapper" ref={wrapperRef}>
      <div className="state-input-field">
        <input
          ref={inputRef}
          type="text"
          className="form-control"
          placeholder={placeholder}
          value={query}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          aria-label="State"
          aria-autocomplete="list"
        />
        {query && (
          <button
            className="state-clear-btn"
            onClick={() => { setQuery(''); onChange(''); inputRef.current?.focus(); }}
            type="button"
            aria-label="Clear"
          >✕</button>
        )}
      </div>

      {showDropdown && suggestions.length > 0 && (
        <ul className="state-dropdown" role="listbox">
          {suggestions.map((state, i) => (
            <li
              key={state}
              className={`state-option ${i === highlighted ? 'highlighted' : ''}`}
              onMouseDown={() => handleSelect(state)}
              role="option"
              aria-selected={i === highlighted}
            >
              <span className="state-flag">📍</span>
              <span>{state}</span>
              {/* Highlight matching part */}
              {query && state.toLowerCase().includes(query.toLowerCase()) && (
                <span className="state-match-hint">match</span>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Show normalized hint */}
      {query && normalizeState(query) !== query && (
        <div className="state-normalize-hint">
          ✓ Will be saved as: <strong>{normalizeState(query)}</strong>
        </div>
      )}
    </div>
  );
};

export default StateInput;
