"use client";

import GlobeTmpl from "react-globe.gl";

const GlobeWrapper = ({ forwardRef, ...otherProps }: any) => (
  <GlobeTmpl {...otherProps} ref={forwardRef} />
);

export default GlobeWrapper;
