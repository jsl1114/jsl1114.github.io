import { motion } from "framer-motion";

const EducationCard = ({ school, degree, year, location, gpa, coursework }) => {
  const cardVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.7,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  return (
    <motion.div
      variants={cardVariants}
      className="flex flex-wrap lg:justify-center mb-8"
    >
      <div className="w-full lg:w-1/4">
        <p className="mb-2 text-sm text-neutral-500 dark:text-neutral-400">
          {year}
        </p>
        <p className="mb-2 text-sm text-neutral-500 dark:text-neutral-400 italic">
          {location}
        </p>
      </div>
      <div className="w-full max-w-xl lg:w-3/4">
        <div className="flex flex-col sm:flex-row sm:justify-between">
          <h6 className="mb-2 font-semibold text-neutral-900 dark:text-white">
            {school}
          </h6>
          <span className="text-sm text-nyu dark:text-purple-100">
            {degree}
          </span>
        </div>
        {gpa && (
          <p className="text-neutral-700 dark:text-neutral-300">GPA: {gpa}</p>
        )}
        <div className="flex flex-wrap">
          {coursework.map((w) => (
            <span className="chip mr-2 mt-4" key={w}>
              {w}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
export default EducationCard;
