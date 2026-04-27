// Minimal shim to satisfy bundler resolution for @mediapipe/pose in React Native.
// The real @mediapipe/pose is a web-native library; we avoid loading it on
// native by providing an empty module so Metro can resolve imports from
// @tensorflow-models/pose-detection without failing. The runtime code paths
// that actually require mediapipe (BlazePose) won't be used when using
// MoveNet, so this shim is safe.

module.exports = {};
