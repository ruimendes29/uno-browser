import { useEffect, useState } from "react";

// Keep in sync with the same media query in the SCSS modules and globals.css.
const COMPACT_QUERY = "(max-width: 820px), (max-height: 560px)";

/** True on phones and small windows, where the round table does not fit. */
const useCompactLayout = () => {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(COMPACT_QUERY);
    const onChange = () => setCompact(query.matches);
    onChange();
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return compact;
};

export default useCompactLayout;
