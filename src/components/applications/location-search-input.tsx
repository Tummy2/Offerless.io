'use client'

import { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Check, ChevronDown } from 'lucide-react'

const LOCATION_SUGGESTIONS = [
  'Remote',
  'New York, NY',
  'San Francisco, CA',
  'Los Angeles, CA',
  'Seattle, WA',
  'Austin, TX',
  'Boston, MA',
  'Chicago, IL',
  'Denver, CO',
  'Atlanta, GA',
  'Miami, FL',
  'Portland, OR',
  'Las Vegas, NV',
  'Phoenix, AZ',
  'San Diego, CA',
  'Nashville, TN',
  'Raleigh, NC',
  'Salt Lake City, UT',
  'Minneapolis, MN',
  'Orlando, FL',
  'Tampa, FL',
  'Charlotte, NC',
  'Dallas, TX',
  'Houston, TX',
  'Philadelphia, PA',
  'Washington, DC',
  'Detroit, MI',
  'Columbus, OH',
  'Indianapolis, IN',
  'Jacksonville, FL',
  'San Jose, CA',
  'Fort Worth, TX',
  'San Antonio, TX',
  'Calgary, AB',
  'Toronto, ON',
  'Vancouver, BC',
  'Montreal, QC',
  'London, UK',
  'Berlin, Germany',
  'Amsterdam, Netherlands',
  'Paris, France',
  'Madrid, Spain',
  'Barcelona, Spain',
  'Dublin, Ireland',
  'Stockholm, Sweden',
  'Oslo, Norway',
  'Copenhagen, Denmark',
  'Zurich, Switzerland',
  'Vienna, Austria',
  'Prague, Czech Republic',
  'Warsaw, Poland',
  'Budapest, Hungary',
  'Lisbon, Portugal',
  'Rome, Italy',
  'Milan, Italy',
  'Brussels, Belgium',
  'Luxembourg City, Luxembourg',
  'Helsinki, Finland',
  'Tallinn, Estonia',
  'Riga, Latvia',
  'Vilnius, Lithuania',
]

interface LocationSearchInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
}

export function LocationSearchInput({
  value,
  onChange,
  disabled = false,
  placeholder = 'e.g. San Francisco, CA or Remote',
}: LocationSearchInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setInputValue(value)
  }, [value])

  const filteredSuggestions = LOCATION_SUGGESTIONS.filter(location =>
    location.toLowerCase().includes(inputValue.toLowerCase())
  ).slice(0, 10)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    onChange(newValue)
    setIsOpen(true)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion)
    onChange(suggestion)
    setIsOpen(false)
    inputRef.current?.blur()
  }

  const handleInputFocus = () => {
    setIsOpen(true)
  }

  const handleInputBlur = (e: React.FocusEvent) => {
    // Don't close if clicking on a suggestion
    const relatedTarget = e.relatedTarget as Node
    if (dropdownRef.current && dropdownRef.current.contains(relatedTarget)) {
      return
    }
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          disabled={disabled}
          className="pr-8"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-2"
          onClick={() => {
            if (isOpen) {
              setIsOpen(false)
              inputRef.current?.blur()
            } else {
              setIsOpen(true)
              inputRef.current?.focus()
            }
          }}
          disabled={disabled}
        >
          <ChevronDown className={cn(
            "h-4 w-4 transition-transform",
            isOpen && "rotate-180"
          )} />
        </Button>
      </div>

      {isOpen && filteredSuggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-60 overflow-auto"
        >
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              className="w-full px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none text-sm flex items-center justify-between"
              onClick={() => handleSuggestionClick(suggestion)}
              onMouseDown={(e) => e.preventDefault()} // Prevent input blur
            >
              <span>{suggestion}</span>
              {inputValue === suggestion && (
                <Check className="h-4 w-4" />
              )}
            </button>
          ))}
          
          {inputValue && !filteredSuggestions.includes(inputValue) && (
            <button
              type="button"
              className="w-full px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none text-sm border-t"
              onClick={() => handleSuggestionClick(inputValue)}
              onMouseDown={(e) => e.preventDefault()}
            >
              <span className="text-muted-foreground">Use "</span>
              <span className="font-medium">{inputValue}</span>
              <span className="text-muted-foreground">"</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}