import {
  CheckCircle,
  Circle,
} from "lucide-react";

const Stepper = ({
  steps,
  currentStep,
}) => {
  return (
    <div className="w-full overflow-x-auto scrollbar-hide">
      <div
        className="
          flex
          items-start
          justify-between
          min-w-max
          px-2
          sm:px-4
          mb-6
        "
      >
        {steps.map((step, index) => {
          const active =
            index <= currentStep;

          const completed =
            index < currentStep;

          return (
            <div
              key={step}
              className="
                flex
                items-center
                flex-1
                min-w-[80px]
                sm:min-w-[120px]
              "
            >
              {/* STEP */}
              <div
                className="
                  flex
                  flex-col
                  items-center
                  text-center
                  relative
                  z-10
                "
              >
                {/* ICON */}
                <div
                  className={`
                    w-9 h-9
                    sm:w-10 sm:h-10
                    md:w-12 md:h-12
                    rounded-full
                    flex
                    items-center
                    justify-center
                    transition-all
                    duration-300
                    shadow-sm
                    border

                    ${
                      active
                        ? "bg-gradient-to-r from-sky-500 to-emerald-500 text-white border-transparent"
                        : "bg-white text-gray-400 border-gray-200"
                    }
                  `}
                >
                  {completed ? (
                    <CheckCircle
                      size={18}
                      className="sm:w-5 sm:h-5"
                    />
                  ) : (
                    <Circle
                      size={18}
                      className="sm:w-5 sm:h-5"
                    />
                  )}
                </div>

                {/* LABEL */}
                <span
                  className={`
                    mt-2
                    text-[10px]
                    sm:text-xs
                    md:text-sm
                    font-medium
                    leading-tight
                    max-w-[70px]
                    sm:max-w-[100px]

                    ${
                      active
                        ? "text-gray-800"
                        : "text-gray-400"
                    }
                  `}
                >
                  {step}
                </span>
              </div>

              {/* CONNECTOR */}
              {index <
                steps.length - 1 && (
                <div
                  className="
                    flex-1
                    h-1
                    mx-1
                    sm:mx-2
                    md:mx-3
                    rounded-full
                    transition-all
                    duration-300
                    mt-[-22px]
                    sm:mt-[-24px]
                  "
                >
                  <div
                    className={`
                      h-full
                      rounded-full
                      ${
                        completed
                          ? "bg-gradient-to-r from-sky-500 to-emerald-500"
                          : "bg-gray-200"
                      }
                    `}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Stepper;