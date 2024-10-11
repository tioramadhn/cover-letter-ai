import React from "react";

const MaxWidthWrapper = ({ children }: { children: React.ReactNode }) => {
  return <div className="lg:max-w-screen-lg mx-auto p-6">{children}</div>;
};

export default MaxWidthWrapper;
