import { useEffect } from "react";

const useScrollToRef = (ref: React.RefObject<HTMLDivElement>, trigger: []) => {
  useEffect(() => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [ref, trigger]);
};

export default useScrollToRef;
