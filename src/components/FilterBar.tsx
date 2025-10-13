import { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface FilterBarProps {
  onFilter: (category: string) => void;
}

const categories = [
  { id: 'all', name: 'All Products' },
  { id: 'reclining', name: 'Reclining Chairs' },
  { id: 'pediatric', name: 'Pediatric Chairs' },
  { id: 'accessories', name: 'Accessories' },
  { id: 'units', name: 'Dental Units' },
];

export default function FilterBar({ onFilter }: FilterBarProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isOpen, setIsOpen] = useState(false);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    onFilter(category);
    setIsOpen(false);
  };

  const selectedName = categories.find(c => c.id === selectedCategory)?.name || 'All Products';

  return (
    <div className="relative w-full md:w-72 mt-4">
      <div className="text-sm text-gray-500 mb-2">Filter by category:</div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-left shadow-sm flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <span className="font-medium text-gray-900">{selectedName}</span>
        <ChevronDownIcon className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.id)}
              className={`w-full text-left px-4 py-2.5 hover:bg-gray-100 ${
                selectedCategory === category.id ? 'bg-gray-50 text-primary-600 font-medium' : 'text-gray-700'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 