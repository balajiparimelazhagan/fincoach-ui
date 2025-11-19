import './ExploreContainer.css';

interface ContainerProps {
  name: string;
}

const ExploreContainer: React.FC<ContainerProps> = ({ name }) => {
  return (
    <div id="container">
      <strong>{name}</strong>
      <p>Explore <a target="_blank" rel="noopener noreferrer" href="https://ionicframework.com/docs/components">UI Components</a></p>
      
      {/* Tailwind CSS Test */}
      <div className="mt-8 p-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-4">Tailwind CSS is Working! 🎨</h2>
        <p className="text-white/90 mb-4">This card is styled with Tailwind utility classes.</p>
        <button className="bg-white text-blue-600 font-semibold py-2 px-6 rounded-full hover:bg-blue-50 transition-colors duration-200 shadow-md">
          Click Me
        </button>
      </div>
    </div>
  );
};

export default ExploreContainer;
