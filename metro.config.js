const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, {
  input: "./global.css",
  // iOS/Android間のサイズ差を防ぐため、remをインライン展開せずランタイムで解決する
  inlineRem: false,
});
