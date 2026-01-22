import { useEffect, useState } from 'react';
import { useMotionValue, useSpring, useTransform } from 'framer-motion';

const useMouseTilt = (options = { maxRotation: 15, stiffness: 150, damping: 15 }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Detect mobile touch devices to disable tilt (save battery)
        const checkMobile = () => {
            const hasTouch = (('ontouchstart' in window) || (navigator.maxTouchPoints > 0));
            setIsMobile(hasTouch && window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);

        const handleMouseMove = (e) => {
            if (isMobile) return;

            const { innerWidth, innerHeight } = window;
            const xPct = (e.clientX / innerWidth) - 0.5; // -0.5 to 0.5
            const yPct = (e.clientY / innerHeight) - 0.5;

            x.set(xPct);
            y.set(yPct);
        };

        if (!isMobile) {
            window.addEventListener('mousemove', handleMouseMove);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', checkMobile);
        };
    }, [x, y, isMobile]);

    // Transform Mouse Position into Rotation
    const rotateY = useTransform(x, [-0.5, 0.5], [-options.maxRotation, options.maxRotation]);
    const rotateX = useTransform(y, [-0.5, 0.5], [options.maxRotation, -options.maxRotation]); // Inverted for natural feel

    // Smooth out the rotation
    const smoothX = useSpring(rotateX, { stiffness: options.stiffness, damping: options.damping });
    const smoothY = useSpring(rotateY, { stiffness: options.stiffness, damping: options.damping });

    // Dynamic Shadow Logic: Moves opposite to the tilt
    // If card tilts UP (-RotateX), shadow moves DOWN (+Y)
    const shadowX = useTransform(smoothY, [-15, 15], [10, -10]);
    const shadowY = useTransform(smoothX, [-15, 15], [10, -10]);

    const shadow = useTransform(
        [shadowX, shadowY],
        ([sx, sy]) => `\${sx}px \${sy}px 20px rgba(0,0,0,0.3)`
    );

    return {
        rotateX: isMobile ? 0 : smoothX,
        rotateY: isMobile ? 0 : smoothY,
        shadow: isMobile ? '0px 4px 6px rgba(0,0,0,0.1)' : shadow
    };
};

export default useMouseTilt;
