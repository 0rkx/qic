import React from 'react';
import { motion } from 'framer-motion';

// Container that orchestrates the staggered animation of its children
export const StaggerContainer: React.FC<{ children: React.ReactNode, className?: string, delay?: number }> = ({ children, className = '', delay = 0 }) => {
    return (
        <motion.div
            initial="hidden"
            animate="show"
            exit="exit"
            variants={{
                hidden: { opacity: 0 },
                show: {
                    opacity: 1,
                    transition: {
                        staggerChildren: 0.08,
                        delayChildren: delay
                    }
                },
                exit: {
                    opacity: 0,
                    transition: {
                        staggerChildren: 0.05,
                        staggerDirection: -1
                    }
                }
            }}
            className={`h-full w-full ${className}`}
        >
            {children}
        </motion.div>
    );
};

// Item that slides up and fades in
export const FadeInItem: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => {
    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 20 },
                show: {
                    opacity: 1,
                    y: 0,
                    transition: {
                        type: "spring",
                        stiffness: 100,
                        damping: 15
                    }
                },
                exit: { opacity: 0, y: 10 }
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

// Item that scales in (good for cards/buttons)
export const ScaleInItem: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => {
    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, scale: 0.9 },
                show: {
                    opacity: 1,
                    scale: 1,
                    transition: {
                        type: "spring",
                        stiffness: 100,
                        damping: 15
                    }
                },
                exit: { opacity: 0, scale: 0.95 }
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
};
