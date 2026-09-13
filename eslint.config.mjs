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
  {
    // Server components, listed rather than globbed so a client component can
    // never pick this up by accident.
    files: [
      "app/**/page.tsx",
      "components/Footer.tsx",
      "components/FreeProduct.tsx",
      "components/Pricing.tsx",
    ],
    rules: {
      // `const T = serverT(locale)` reads as creating a component during
      // render, and the rule is right to flag that in a client component: a new
      // identity every render remounts the subtree and loses its state. A
      // server component renders once and holds no state, so neither can
      // happen here.
      "react-hooks/static-components": "off",
    },
  },
];
