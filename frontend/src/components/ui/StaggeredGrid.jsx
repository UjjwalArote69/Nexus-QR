import { motion } from 'framer-motion';

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.35, ease: 'easeOut' },
  },
};

export const StaggeredGrid = ({ children, className = '' }) => (
  <motion.div
    className={className}
    variants={containerVariants}
    initial="hidden"
    animate="show"
  >
    {children}
  </motion.div>
);

export const StaggeredItem = ({ children, className = '' }) => (
  <motion.div className={className} variants={itemVariants}>
    {children}
  </motion.div>
);
