import React from 'react';
import { motion } from 'framer-motion';

const variants = {
    initial: {
        opacity: 0,
        y: 20,
        scale: 0.98
    },
    enter: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.4,
            ease: [0.25, 1, 0.5, 1], // Cubic bezier for "slick" feel
        }
    },
    exit: {
        opacity: 0,
        scale: 0.96,
        transition: {
            duration: 0.3,
            ease: [0.25, 1, 0.5, 1]
        }
    }
};

export const PageTransition: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => {
    return (
        <motion.div
            initial="initial"
            animate="enter"
            exit="exit"
            variants={variants}
            className={`h-full w-full ${className}`}
        >
            {children}
        </motion.div>
    );
};
