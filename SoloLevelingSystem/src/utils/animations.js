// animations.js - Animation utilities for the Solo Leveling System
import { Animated, Easing } from "react-native";
import { ANIMATION_DURATION } from "./constants";

/**
 * Creates a spring animation for bouncy effects
 * @param {Animated.Value} value - Animation value to animate
 * @param {number} toValue - Target value
 * @param {number} friction - Spring friction (default: 6)
 * @param {number} tension - Spring tension (default: 40)
 * @return {Animated.CompositeAnimation} Animation object
 */
export const springAnimation = (value, toValue, friction = 6, tension = 40) => {
  return Animated.spring(value, {
    toValue,
    friction,
    tension,
    useNativeDriver: true,
  });
};

/**
 * Creates a timing animation with customizable easing
 * @param {Animated.Value} value - Animation value to animate
 * @param {number} toValue - Target value
 * @param {number} duration - Animation duration in ms
 * @param {Easing} easing - Easing function
 * @return {Animated.CompositeAnimation} Animation object
 */
export const timingAnimation = (
  value,
  toValue,
  duration = ANIMATION_DURATION.NORMAL,
  easing = Easing.inOut(Easing.ease)
) => {
  return Animated.timing(value, {
    toValue,
    duration,
    easing,
    useNativeDriver: true,
  });
};

/**
 * Creates a pulse animation (grow and shrink)
 * @param {Animated.Value} value - Animation value
 * @param {number} maxValue - Maximum scale value
 * @param {number} duration - Animation duration in ms
 * @return {Animated.CompositeAnimation} Animation object
 */
export const pulseAnimation = (
  value,
  maxValue = 1.1,
  duration = ANIMATION_DURATION.NORMAL
) => {
  return Animated.sequence([
    timingAnimation(value, maxValue, duration / 2),
    timingAnimation(value, 1, duration / 2),
  ]);
};

/**
 * Creates an infinite pulse animation
 * @param {Animated.Value} value - Animation value
 * @param {number} maxValue - Maximum scale value
 * @param {number} duration - Animation duration in ms
 * @return {Animated.CompositeAnimation} Animation object
 */
export const infinitePulse = (
  value,
  maxValue = 1.1,
  duration = ANIMATION_DURATION.NORMAL
) => {
  return Animated.loop(pulseAnimation(value, maxValue, duration));
};

/**
 * Creates a shake animation
 * @param {Animated.Value} value - Animation value
 * @param {number} distance - Distance to shake
 * @param {number} duration - Animation duration in ms
 * @return {Animated.CompositeAnimation} Animation object
 */
export const shakeAnimation = (
  value,
  distance = 10,
  duration = ANIMATION_DURATION.NORMAL
) => {
  return Animated.sequence([
    Animated.timing(value, {
      toValue: -distance,
      duration: duration / 5,
      useNativeDriver: true,
    }),
    Animated.timing(value, {
      toValue: distance,
      duration: duration / 5,
      useNativeDriver: true,
    }),
    Animated.timing(value, {
      toValue: -distance,
      duration: duration / 5,
      useNativeDriver: true,
    }),
    Animated.timing(value, {
      toValue: distance,
      duration: duration / 5,
      useNativeDriver: true,
    }),
    Animated.timing(value, {
      toValue: 0,
      duration: duration / 5,
      useNativeDriver: true,
    }),
  ]);
};

/**
 * Creates a fade-in animation
 * @param {Animated.Value} value - Animation value
 * @param {number} duration - Animation duration in ms
 * @return {Animated.CompositeAnimation} Animation object
 */
export const fadeIn = (value, duration = ANIMATION_DURATION.NORMAL) => {
  return Animated.timing(value, {
    toValue: 1,
    duration,
    useNativeDriver: true,
  });
};

/**
 * Creates a fade-out animation
 * @param {Animated.Value} value - Animation value
 * @param {number} duration - Animation duration in ms
 * @return {Animated.CompositeAnimation} Animation object
 */
export const fadeOut = (value, duration = ANIMATION_DURATION.NORMAL) => {
  return Animated.timing(value, {
    toValue: 0,
    duration,
    useNativeDriver: true,
  });
};

/**
 * Creates a slide-in animation
 * @param {Animated.Value} value - Animation value
 * @param {number} fromValue - Starting position
 * @param {number} toValue - End position
 * @param {number} duration - Animation duration in ms
 * @return {Animated.CompositeAnimation} Animation object
 */
export const slideIn = (
  value,
  fromValue,
  toValue,
  duration = ANIMATION_DURATION.NORMAL
) => {
  value.setValue(fromValue);
  return Animated.timing(value, {
    toValue,
    duration,
    useNativeDriver: true,
  });
};

/**
 * Creates a slide-out animation
 * @param {Animated.Value} value - Animation value
 * @param {number} toValue - Target position
 * @param {number} duration - Animation duration in ms
 * @return {Animated.CompositeAnimation} Animation object
 */
export const slideOut = (
  value,
  toValue,
  duration = ANIMATION_DURATION.NORMAL
) => {
  return Animated.timing(value, {
    toValue,
    duration,
    useNativeDriver: true,
  });
};

/**
 * Creates a level-up celebration animation
 * @param {Animated.Value} scaleValue - Scale animation value
 * @param {Animated.Value} rotateValue - Rotation animation value
 * @param {number} duration - Animation duration in ms
 * @return {Animated.CompositeAnimation} Animation object
 */
export const levelUpAnimation = (
  scaleValue,
  rotateValue,
  duration = ANIMATION_DURATION.LEVEL_UP
) => {
  // Reset animation values
  scaleValue.setValue(0);
  rotateValue.setValue(0);

  return Animated.parallel([
    // Scale up
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 1.2,
        duration: duration * 0.4,
        easing: Easing.out(Easing.back(2)),
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: duration * 0.2,
        useNativeDriver: true,
      }),
    ]),
    // Rotate
    Animated.sequence([
      Animated.timing(rotateValue, {
        toValue: 1,
        duration: duration * 0.6,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]),
  ]);
};

/**
 * Creates a progress bar animation
 * @param {Animated.Value} value - Animation value
 * @param {number} toValue - Target progress (0-1)
 * @param {number} duration - Animation duration in ms
 * @return {Animated.CompositeAnimation} Animation object
 */
export const progressAnimation = (
  value,
  toValue,
  duration = ANIMATION_DURATION.NORMAL
) => {
  return Animated.timing(value, {
    toValue,
    duration,
    easing: Easing.inOut(Easing.ease),
    useNativeDriver: false, // width animations can't use native driver
  });
};

/**
 * Creates a staggered animation for lists
 * @param {Array<Animated.Value>} animationValues - Array of animation values
 * @param {Function} animationCreator - Function creating animation for each value
 * @param {number} staggerDelay - Delay between animations in ms
 * @return {Animated.CompositeAnimation} Animation object
 */
export const staggeredAnimation = (
  animationValues,
  animationCreator,
  staggerDelay = 50
) => {
  return Animated.stagger(staggerDelay, animationValues.map(animationCreator));
};

/**
 * Creates an interpolated color animation
 * @param {Animated.Value} value - Animation progress value (0-1)
 * @param {Array<string>} inputRange - Input range values
 * @param {Array<string>} outputColors - Output color values
 * @return {Animated.AnimatedInterpolation} Interpolated color value
 */
export const colorInterpolation = (
  value,
  inputRange = [0, 1],
  outputColors = ["#ff0000", "#00ff00"]
) => {
  return value.interpolate({
    inputRange,
    outputRange: outputColors,
  });
};

/**
 * Creates a rotating animation (for loaders, etc.)
 * @param {Animated.Value} value - Animation value (0-1)
 * @param {number} duration - Full rotation duration in ms
 * @return {Animated.CompositeAnimation} Animation object
 */
export const rotateAnimation = (value, duration = 2000) => {
  value.setValue(0);
  return Animated.loop(
    Animated.timing(value, {
      toValue: 1,
      duration,
      easing: Easing.linear,
      useNativeDriver: true,
    })
  );
};

/**
 * Creates an interpolated rotation style object
 * @param {Animated.Value} rotateValue - Animation value (0-1)
 * @param {string} direction - Rotation direction ('z', 'x', or 'y')
 * @return {Object} Style object with transform
 */
export const getRotationStyles = (rotateValue, direction = "z") => {
  const rotateInterpolation = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const rotateProperty = `rotate${direction.toUpperCase()}`;

  return {
    transform: [{ [rotateProperty]: rotateInterpolation }],
  };
};

/**
 * Creates a glow effect animation
 * @param {Animated.Value} value - Animation value
 * @param {number} duration - Animation duration in ms
 * @return {Animated.CompositeAnimation} Animation object
 */
export const glowAnimation = (value, duration = 1500) => {
  value.setValue(0);
  return Animated.loop(
    Animated.sequence([
      Animated.timing(value, {
        toValue: 1,
        duration: duration / 2,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }),
      Animated.timing(value, {
        toValue: 0,
        duration: duration / 2,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }),
    ])
  );
};
