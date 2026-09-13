import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

export default [
  { ignores: [".next/**", "next-env.d.ts", "public/**"] },
  ...nextCoreWebVitals,
  {
    // eslint-plugin-react-hooks 7 added the React Compiler rules below, and
    // they flag eleven places that predate this upgrade. Kept visible as
    // warnings rather than fixed here, so the upgrade stays reviewable.
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/refs": "warn",
    },
  },
];
