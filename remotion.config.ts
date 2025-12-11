// @ts-nocheck
// See all configuration options: https://remotion.dev/docs/config
// Each option also is available as a CLI flag: https://remotion.dev/docs/cli

// Note: When using the Node.JS APIs, the config file doesn't apply. Instead, pass options directly to the APIs

import { Config } from "@remotion/cli/config";
import { enableTailwind } from '@remotion/tailwind-v4';

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);

Config.overrideWebpackConfig((currentConfiguration) => {
  // Tailwindの設定を適用
  const configWithTailwind = enableTailwind(currentConfiguration);
  
  // esbuild-loaderのターゲット環境を更新（Top-level awaitをサポートするためchrome89以降が必要）
  if (configWithTailwind.module?.rules) {
    configWithTailwind.module.rules = configWithTailwind.module.rules.map((rule: any) => {
      if (rule && typeof rule === 'object' && 'use' in rule) {
        const use = Array.isArray(rule.use) ? rule.use : [rule.use];
        const updatedUse = use.map((loader: any) => {
          if (
            loader &&
            typeof loader === 'object' &&
            'loader' in loader &&
            typeof loader.loader === 'string' &&
            loader.loader.includes('esbuild-loader')
          ) {
            return {
              ...loader,
              options: {
                ...(typeof loader.options === 'object' && loader.options ? loader.options : {}),
                target: 'chrome89',
              },
            };
          }
          return loader;
        });
        return {
          ...rule,
          use: updatedUse,
        };
      }
      return rule;
    });
  }
  
  return configWithTailwind;
});
