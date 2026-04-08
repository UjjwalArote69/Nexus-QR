import { createContext } from 'react';

// Shared context for the QR builder step/type state.
// Provided by both Dashboard.jsx and PublicCreatePage.jsx
const BuilderContext = createContext({
  builderStep: 1,
  setBuilderStep: () => {},
  selectedType: null,
  setSelectedType: () => {},
});

export default BuilderContext;