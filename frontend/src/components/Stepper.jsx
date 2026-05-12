import { CheckCircle, Circle } from 'lucide-react';

const Stepper = ({ steps, currentStep }) => {
  return (
    <div className="flex justify-between items-center mb-8">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                index <= currentStep
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/10 text-gray-400'
              }`}
            >
              {index < currentStep ? (
                <CheckCircle size={20} />
              ) : (
                <Circle size={20} />
              )}
            </div>
            <span className="text-xs mt-2 text-center text-gray-300">
              {step}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`w-16 md:w-24 h-1 mx-2 rounded-full transition-all ${
                index < currentStep ? 'bg-blue-500' : 'bg-white/10'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default Stepper;