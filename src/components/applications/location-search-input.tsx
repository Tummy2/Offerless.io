'use client'

import { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Check, ChevronDown } from 'lucide-react'

const LOCATION_SUGGESTIONS = [
  'Remote',
  
  // Major US Cities (alphabetical by state)
  'Birmingham, AL',
  'Mobile, AL',
  'Anchorage, AK',
  'Phoenix, AZ',
  'Tucson, AZ',
  'Little Rock, AR',
  'Los Angeles, CA',
  'San Francisco, CA',
  'San Diego, CA',
  'San Jose, CA',
  'Sacramento, CA',
  'Oakland, CA',
  'Fresno, CA',
  'Long Beach, CA',
  'Santa Ana, CA',
  'Anaheim, CA',
  'Irvine, CA',
  'Riverside, CA',
  'Stockton, CA',
  'Denver, CO',
  'Colorado Springs, CO',
  'Aurora, CO',
  'Bridgeport, CT',
  'New Haven, CT',
  'Hartford, CT',
  'Wilmington, DE',
  'Washington, DC',
  'Jacksonville, FL',
  'Miami, FL',
  'Tampa, FL',
  'Orlando, FL',
  'St. Petersburg, FL',
  'Hialeah, FL',
  'Tallahassee, FL',
  'Fort Lauderdale, FL',
  'Port St. Lucie, FL',
  'Cape Coral, FL',
  'Pembroke Pines, FL',
  'Atlanta, GA',
  'Columbus, GA',
  'Augusta, GA',
  'Savannah, GA',
  'Honolulu, HI',
  'Boise, ID',
  'Chicago, IL',
  'Aurora, IL',
  'Peoria, IL',
  'Rockford, IL',
  'Elgin, IL',
  'Joliet, IL',
  'Naperville, IL',
  'Springfield, IL',
  'Indianapolis, IN',
  'Fort Wayne, IN',
  'Evansville, IN',
  'South Bend, IN',
  'Des Moines, IA',
  'Cedar Rapids, IA',
  'Davenport, IA',
  'Wichita, KS',
  'Overland Park, KS',
  'Kansas City, KS',
  'Topeka, KS',
  'Louisville, KY',
  'Lexington, KY',
  'New Orleans, LA',
  'Baton Rouge, LA',
  'Shreveport, LA',
  'Lafayette, LA',
  'Portland, ME',
  'Baltimore, MD',
  'Columbia, MD',
  'Germantown, MD',
  'Silver Spring, MD',
  'Boston, MA',
  'Worcester, MA',
  'Springfield, MA',
  'Cambridge, MA',
  'Lowell, MA',
  'Brockton, MA',
  'Detroit, MI',
  'Grand Rapids, MI',
  'Warren, MI',
  'Sterling Heights, MI',
  'Lansing, MI',
  'Ann Arbor, MI',
  'Flint, MI',
  'Minneapolis, MN',
  'St. Paul, MN',
  'Rochester, MN',
  'Bloomington, MN',
  'Jackson, MS',
  'Gulfport, MS',
  'Kansas City, MO',
  'St. Louis, MO',
  'Springfield, MO',
  'Columbia, MO',
  'Independence, MO',
  'Billings, MT',
  'Missoula, MT',
  'Great Falls, MT',
  'Omaha, NE',
  'Lincoln, NE',
  'Las Vegas, NV',
  'Henderson, NV',
  'Reno, NV',
  'North Las Vegas, NV',
  'Manchester, NH',
  'Nashua, NH',
  'Newark, NJ',
  'Jersey City, NJ',
  'Paterson, NJ',
  'Elizabeth, NJ',
  'Edison, NJ',
  'Woodbridge, NJ',
  'Dover, NJ',
  'Albuquerque, NM',
  'Las Cruces, NM',
  'Rio Rancho, NM',
  'Santa Fe, NM',
  'New York, NY',
  'Buffalo, NY',
  'Rochester, NY',
  'Yonkers, NY',
  'Syracuse, NY',
  'Albany, NY',
  'New Rochelle, NY',
  'Mount Vernon, NY',
  'Schenectady, NY',
  'Utica, NY',
  'Charlotte, NC',
  'Raleigh, NC',
  'Greensboro, NC',
  'Durham, NC',
  'Winston-Salem, NC',
  'Fayetteville, NC',
  'Cary, NC',
  'Wilmington, NC',
  'High Point, NC',
  'Concord, NC',
  'Fargo, ND',
  'Bismarck, ND',
  'Columbus, OH',
  'Cleveland, OH',
  'Cincinnati, OH',
  'Toledo, OH',
  'Akron, OH',
  'Dayton, OH',
  'Parma, OH',
  'Canton, OH',
  'Youngstown, OH',
  'Oklahoma City, OK',
  'Tulsa, OK',
  'Norman, OK',
  'Broken Arrow, OK',
  'Portland, OR',
  'Salem, OR',
  'Eugene, OR',
  'Gresham, OR',
  'Philadelphia, PA',
  'Pittsburgh, PA',
  'Allentown, PA',
  'Erie, PA',
  'Reading, PA',
  'Scranton, PA',
  'Bethlehem, PA',
  'Lancaster, PA',
  'Providence, RI',
  'Warwick, RI',
  'Cranston, RI',
  'Pawtucket, RI',
  'Charleston, SC',
  'Columbia, SC',
  'North Charleston, SC',
  'Mount Pleasant, SC',
  'Rock Hill, SC',
  'Greenville, SC',
  'Summerville, SC',
  'Sioux Falls, SD',
  'Rapid City, SD',
  'Nashville, TN',
  'Memphis, TN',
  'Knoxville, TN',
  'Chattanooga, TN',
  'Clarksville, TN',
  'Murfreesboro, TN',
  'Houston, TX',
  'San Antonio, TX',
  'Dallas, TX',
  'Austin, TX',
  'Fort Worth, TX',
  'El Paso, TX',
  'Arlington, TX',
  'Corpus Christi, TX',
  'Plano, TX',
  'Laredo, TX',
  'Lubbock, TX',
  'Garland, TX',
  'Irving, TX',
  'Amarillo, TX',
  'Grand Prairie, TX',
  'Brownsville, TX',
  'Pasadena, TX',
  'Mesquite, TX',
  'McKinney, TX',
  'McAllen, TX',
  'Killeen, TX',
  'Frisco, TX',
  'Waco, TX',
  'Carrollton, TX',
  'Denton, TX',
  'Salt Lake City, UT',
  'West Valley City, UT',
  'Provo, UT',
  'West Jordan, UT',
  'Orem, UT',
  'Sandy, UT',
  'Ogden, UT',
  'Burlington, VT',
  'South Burlington, VT',
  'Virginia Beach, VA',
  'Norfolk, VA',
  'Chesapeake, VA',
  'Richmond, VA',
  'Newport News, VA',
  'Alexandria, VA',
  'Hampton, VA',
  'Portsmouth, VA',
  'Suffolk, VA',
  'Lynchburg, VA',
  'Roanoke, VA',
  'Seattle, WA',
  'Spokane, WA',
  'Tacoma, WA',
  'Vancouver, WA',
  'Bellevue, WA',
  'Kent, WA',
  'Everett, WA',
  'Renton, WA',
  'Spokane Valley, WA',
  'Federal Way, WA',
  'Yakima, WA',
  'Bellingham, WA',
  'Charleston, WV',
  'Huntington, WV',
  'Parkersburg, WV',
  'Morgantown, WV',
  'Milwaukee, WI',
  'Madison, WI',
  'Green Bay, WI',
  'Kenosha, WI',
  'Racine, WI',
  'Appleton, WI',
  'Waukesha, WI',
  'Oshkosh, WI',
  'Eau Claire, WI',
  'Janesville, WI',
  'West Allis, WI',
  'Cheyenne, WY',
  'Casper, WY',
  'Laramie, WY',
  
  // Popular Canadian Cities
  'Toronto, ON',
  'Montreal, QC',
  'Vancouver, BC',
  'Calgary, AB',
  'Edmonton, AB',
  'Ottawa, ON',
  'Winnipeg, MB',
  'Quebec City, QC',
  'Hamilton, ON',
  'Kitchener, ON',
  'London, ON',
  'Victoria, BC',
  'Halifax, NS',
  'Oshawa, ON',
  'Windsor, ON',
  'Saskatoon, SK',
  'Regina, SK',
  'Sherbrooke, QC',
  'Barrie, ON',
  'Kelowna, BC',
  'Abbotsford, BC',
  'Greater Sudbury, ON',
  'Kingston, ON',
  'Saguenay, QC',
  'Trois-Rivières, QC',
  'Guelph, ON',
  'Cambridge, ON',
  'Whitby, ON',
  'Thunder Bay, ON',
  'Chatham-Kent, ON',
  'St. Catharines, ON',
  'Waterloo, ON',
  'Delta, BC',
  'Richmond, BC',
  'Richmond Hill, ON',
  'Laval, QC',
  'Burnaby, BC',
  'Mississauga, ON',
  'Brampton, ON',
  'Markham, ON',
  'Vaughan, ON',
  'Longueuil, QC',
  'Gatineau, QC',
  'St. John\'s, NL',
  'Moncton, NB',
  'Saint John, NB',
  'Fredericton, NB',
  'Sydney, NS',
  'Charlottetown, PE',
  'Yellowknife, NT',
  'Whitehorse, YT',
  'Iqaluit, NU',
  
  // Popular International Cities
  'London, UK',
  'Manchester, UK',
  'Edinburgh, UK',
  'Birmingham, UK',
  'Glasgow, UK',
  'Liverpool, UK',
  'Leeds, UK',
  'Sheffield, UK',
  'Bristol, UK',
  'Newcastle, UK',
  'Belfast, UK',
  'Cardiff, UK',
  'Dublin, Ireland',
  'Cork, Ireland',
  'Berlin, Germany',
  'Munich, Germany',
  'Frankfurt, Germany',
  'Hamburg, Germany',
  'Cologne, Germany',
  'Stuttgart, Germany',
  'Düsseldorf, Germany',
  'Dortmund, Germany',
  'Essen, Germany',
  'Leipzig, Germany',
  'Bremen, Germany',
  'Dresden, Germany',
  'Hanover, Germany',
  'Nuremberg, Germany',
  'Paris, France',
  'Marseille, France',
  'Lyon, France',
  'Toulouse, France',
  'Nice, France',
  'Nantes, France',
  'Montpellier, France',
  'Strasbourg, France',
  'Bordeaux, France',
  'Lille, France',
  'Amsterdam, Netherlands',
  'Rotterdam, Netherlands',
  'The Hague, Netherlands',
  'Utrecht, Netherlands',
  'Eindhoven, Netherlands',
  'Groningen, Netherlands',
  'Tilburg, Netherlands',
  'Madrid, Spain',
  'Barcelona, Spain',
  'Valencia, Spain',
  'Seville, Spain',
  'Zaragoza, Spain',
  'Málaga, Spain',
  'Murcia, Spain',
  'Palma, Spain',
  'Las Palmas, Spain',
  'Bilbao, Spain',
  'Stockholm, Sweden',
  'Gothenburg, Sweden',
  'Malmö, Sweden',
  'Uppsala, Sweden',
  'Oslo, Norway',
  'Bergen, Norway',
  'Trondheim, Norway',
  'Stavanger, Norway',
  'Copenhagen, Denmark',
  'Aarhus, Denmark',
  'Odense, Denmark',
  'Aalborg, Denmark',
  'Helsinki, Finland',
  'Espoo, Finland',
  'Tampere, Finland',
  'Vantaa, Finland',
  'Zurich, Switzerland',
  'Geneva, Switzerland',
  'Basel, Switzerland',
  'Bern, Switzerland',
  'Lausanne, Switzerland',
  'Vienna, Austria',
  'Graz, Austria',
  'Linz, Austria',
  'Salzburg, Austria',
  'Innsbruck, Austria',
  'Prague, Czech Republic',
  'Brno, Czech Republic',
  'Ostrava, Czech Republic',
  'Warsaw, Poland',
  'Kraków, Poland',
  'Łódź, Poland',
  'Wrocław, Poland',
  'Poznań, Poland',
  'Gdańsk, Poland',
  'Szczecin, Poland',
  'Bydgoszcz, Poland',
  'Lublin, Poland',
  'Budapest, Hungary',
  'Debrecen, Hungary',
  'Szeged, Hungary',
  'Miskolc, Hungary',
  'Pécs, Hungary',
  'Győr, Hungary',
  'Lisbon, Portugal',
  'Porto, Portugal',
  'Vila Nova de Gaia, Portugal',
  'Amadora, Portugal',
  'Braga, Portugal',
  'Rome, Italy',
  'Milan, Italy',
  'Naples, Italy',
  'Turin, Italy',
  'Palermo, Italy',
  'Genoa, Italy',
  'Bologna, Italy',
  'Florence, Italy',
  'Bari, Italy',
  'Catania, Italy',
  'Venice, Italy',
  'Brussels, Belgium',
  'Antwerp, Belgium',
  'Ghent, Belgium',
  'Charleroi, Belgium',
  'Liège, Belgium',
  'Luxembourg City, Luxembourg',
  'Tallinn, Estonia',
  'Tartu, Estonia',
  'Riga, Latvia',
  'Daugavpils, Latvia',
  'Vilnius, Lithuania',
  'Kaunas, Lithuania',
  'Klaipėda, Lithuania',
  
  // Major Asian Cities
  'Tokyo, Japan',
  'Seoul, South Korea',
  'Singapore, Singapore',
  'Hong Kong, Hong Kong',
  'Shanghai, China',
  'Beijing, China',
  'Shenzhen, China',
  'Guangzhou, China',
  'Mumbai, India',
  'Delhi, India',
  'Bangalore, India',
  'Hyderabad, India',
  'Chennai, India',
  'Kolkata, India',
  'Pune, India',
  'Ahmedabad, India',
  'Manila, Philippines',
  'Bangkok, Thailand',
  'Jakarta, Indonesia',
  'Kuala Lumpur, Malaysia',
  
  // Major Australian/NZ Cities  
  'Sydney, Australia',
  'Melbourne, Australia',
  'Brisbane, Australia',
  'Perth, Australia',
  'Adelaide, Australia',
  'Gold Coast, Australia',
  'Newcastle, Australia',
  'Canberra, Australia',
  'Sunshine Coast, Australia',
  'Wollongong, Australia',
  'Auckland, New Zealand',
  'Wellington, New Zealand',
  'Christchurch, New Zealand',
  'Hamilton, New Zealand',
  'Tauranga, New Zealand',
  
  // Major South American Cities
  'São Paulo, Brazil',
  'Rio de Janeiro, Brazil',
  'Buenos Aires, Argentina',
  'Lima, Peru',
  'Bogotá, Colombia',
  'Santiago, Chile',
  'Caracas, Venezuela',
  'Quito, Ecuador',
  'La Paz, Bolivia',
  'Asunción, Paraguay',
  'Montevideo, Uruguay',
  'Georgetown, Guyana',
  'Paramaribo, Suriname',
  
  // Major African Cities
  'Cairo, Egypt',
  'Lagos, Nigeria',
  'Kinshasa, DR Congo',
  'Luanda, Angola',
  'Nairobi, Kenya',
  'Mogadishu, Somalia',
  'Casablanca, Morocco',
  'Alexandria, Egypt',
  'Kano, Nigeria',
  'Johannesburg, South Africa',
  'Addis Ababa, Ethiopia',
  'Cape Town, South Africa',
  'Durban, South Africa',
  'Dar es Salaam, Tanzania',
  'Khartoum, Sudan',
  'Algiers, Algeria',
  'Accra, Ghana',
  'Sanaa, Yemen',
  'Ibadan, Nigeria',
  'Abidjan, Ivory Coast',
  
  // Middle Eastern Cities
  'Dubai, UAE',
  'Abu Dhabi, UAE',
  'Riyadh, Saudi Arabia',
  'Jeddah, Saudi Arabia',
  'Kuwait City, Kuwait',
  'Doha, Qatar',
  'Manama, Bahrain',
  'Muscat, Oman',
  'Tehran, Iran',
  'Tel Aviv, Israel',
  'Jerusalem, Israel',
  'Amman, Jordan',
  'Beirut, Lebanon',
  'Damascus, Syria',
  'Baghdad, Iraq',
  'Ankara, Turkey',
  'Istanbul, Turkey',
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
              <span className="text-muted-foreground">Use &quot;</span>
              <span className="font-medium">{inputValue}</span>
              <span className="text-muted-foreground">&quot;</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}