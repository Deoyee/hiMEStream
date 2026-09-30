import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X, Check, Globe } from 'lucide-react';
import { getLanguageFlag } from '../lib/languageUtils.jsx';
import { capitialize } from '../lib/utils';

const LanguageDropdown = ({
  prefix = '',
  icon: Icon,
  value = '',
  onChange,
  languages = [],
  placeholder = prefix ? 'All' : 'All Languages',
  showAllOption = true,
  allowClear = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const filteredLanguages = languages.filter((lang) =>
    lang.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  const handleSelect = (lang) => {
    onChange(lang);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setSearchTerm('');
  };

  // Find formatted display label for the selected value
  const matchedLang = value
    ? languages.find((lang) => lang.toLowerCase() === value.toLowerCase().trim()) || capitialize(value)
    : '';
  const displayLabel = matchedLang || placeholder;

  return (
    <div ref={dropdownRef} className="relative w-full select-none">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-11 px-3.5 rounded-xl border flex items-center justify-between gap-2 transition-all duration-200 cursor-pointer shadow-sm text-left focus:outline-none focus:ring-2 focus:ring-primary/25 ${
          value
            ? 'bg-base-100 border-primary/40 hover:border-primary ring-1 ring-primary/20'
            : 'bg-base-100 border-base-content/20 hover:border-base-content/40 hover:bg-base-200/50'
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        title={prefix ? `${prefix}: ${displayLabel}` : displayLabel}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {value ? (
            <span className="flex-shrink-0 flex items-center justify-center">
              {getLanguageFlag(value)}
            </span>
          ) : Icon ? (
            <Icon className="size-4 opacity-50 flex-shrink-0 text-base-content" />
          ) : null}

          <div className="truncate text-sm">
            {prefix && (
              <span className="text-xs font-semibold uppercase tracking-wider opacity-60 mr-1.5">
                {prefix}:
              </span>
            )}
            <span className={value ? 'font-semibold text-base-content' : 'opacity-60 text-base-content'}>
              {displayLabel}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {allowClear && value && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleClear(e);
              }}
              className="p-1 hover:bg-base-300 rounded-full text-base-content/60 hover:text-base-content transition-colors cursor-pointer"
              title="Clear selection"
              aria-label="Clear selection"
            >
              <X className="size-3.5" />
            </span>
          )}
          <ChevronDown
            className={`size-4 opacity-60 transition-transform duration-200 text-base-content ${
              isOpen ? 'rotate-180 text-primary opacity-100' : ''
            }`}
          />
        </div>
      </button>

      {/* Floating Popover Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-base-100/95 backdrop-blur-xl border border-base-content/15 rounded-2xl shadow-2xl overflow-hidden animate-fadeIn duration-150">
          {/* Search inside dropdown */}
          <div className="p-2 border-b border-base-content/10 bg-base-200/40">
            <div className="relative flex items-center">
              <Search className="size-3.5 absolute left-2.5 opacity-50 pointer-events-none text-base-content" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Type to filter language..."
                className="input input-xs w-full pl-8 pr-7 py-1 rounded-lg bg-base-100 border border-base-content/15 text-xs text-base-content focus:outline-none focus:border-primary"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 opacity-50 hover:opacity-100 text-base-content"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>
          </div>

          {/* Languages Options List */}
          <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5" role="listbox">
            {/* "All Languages" Option */}
            {showAllOption && (
              <>
                <button
                  type="button"
                  onClick={() => handleSelect('')}
                  role="option"
                  aria-selected={!value}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm transition-colors text-left ${
                    !value
                      ? 'bg-primary text-primary-content font-semibold shadow-xs'
                      : 'text-base-content/80 hover:bg-base-200 hover:text-base-content'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Globe className="size-4 opacity-70" />
                    <span>All Languages</span>
                  </div>
                  {!value && <Check className="size-4" />}
                </button>
                <div className="h-px bg-base-content/10 my-1 mx-1" />
              </>
            )}
            {filteredLanguages.length === 0 ? (
              <div className="py-4 text-center text-xs opacity-50 text-base-content">
                No languages match "{searchTerm}"
              </div>
            ) : (
              filteredLanguages.map((lang) => {
                const isSelected = !!value && value.trim().toLowerCase() === lang.trim().toLowerCase();
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => handleSelect(lang)}
                    role="option"
                    aria-selected={isSelected}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm transition-colors text-left ${
                      isSelected
                        ? 'bg-primary text-primary-content font-semibold shadow-xs'
                        : 'text-base-content/85 hover:bg-base-200 hover:text-base-content'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="flex-shrink-0 flex items-center justify-center">
                        {getLanguageFlag(lang)}
                      </span>
                      <span className="truncate">{lang}</span>
                    </div>
                    {isSelected && <Check className="size-4 flex-shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageDropdown;
