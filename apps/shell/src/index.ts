// The async boundary gives Module Federation a chance to negotiate shared
// singletons (react, react-router, @mini-agoda/shared) before any app code runs.
import('./bootstrap');
