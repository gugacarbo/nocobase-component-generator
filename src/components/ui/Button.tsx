import React from 'react'

interface ButtonProps {
  onClick?: () => void
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
}

export const Button: React.FC<ButtonProps> = ({ 
  onClick, 
  children, 
  variant = 'primary' 
}) => {
  const baseStyle = {
    padding: '10px 20px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'all 0.2s',
  }

  const variantStyles = {
    primary: {
      background: '#1976d2',
      color: 'white',
    },
    secondary: {
      background: '#f5f5f5',
      color: '#333',
    },
  }

  return (
    <button 
      onClick={onClick}
      style={{ ...baseStyle, ...variantStyles[variant] }}
      onMouseOver={(e) => {
        e.currentTarget.style.opacity = '0.8'
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.opacity = '1'
      }}
    >
      {children}
    </button>
  )
}
