// 把所有模块的内容打包到一个产物中，删除所有注释信息
import terser from "@rollup/plugin-terser";

export default {
  input: "lib/index.mjs",
  output: {
    file: "dist/responsive.mjs",
    format: "es",
  },
  plugins: [terser()],
};
