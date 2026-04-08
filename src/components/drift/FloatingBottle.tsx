interface FloatingBottleProps {
  onClick?: () => void;
  driftIn?: boolean;
}

const FloatingBottle = ({ onClick, driftIn = false }: FloatingBottleProps) => {
  return (
    <button
      onClick={onClick}
      className={`text-6xl md:text-8xl cursor-pointer select-none transition-transform hover:scale-110 focus:outline-none ${
        driftIn ? 'animate-bottle-drift-in' : 'animate-bottle-float'
      }`}
      aria-label="Open the drift"
    >
      <span className="drop-shadow-lg drift-element-alive">💌</span>
    </button>
  );
};

export default FloatingBottle;
