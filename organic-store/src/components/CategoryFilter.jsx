import React from 'react'

export default function CategoryFilter({categories, selected, onSelect}){
  return (
    <div className="category-filter">
      {categories.map(cat => (
        <button
          key={cat}
          className={cat===selected ? 'cat active' : 'cat'}
          onClick={() => onSelect(cat)}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}
