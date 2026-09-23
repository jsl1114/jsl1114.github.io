import { useEffect, useState } from "react";

// Home remounts every time you come back from a project page. Its entrance
// animations should only play the first time it mounts in a page load, so
// later mounts start in their final state.
let homeVisited = false;

export const useHomeEntrance = () => {
  const [firstVisit] = useState(() => !homeVisited);
  useEffect(() => {
    homeVisited = true;
  }, []);
  return firstVisit;
};
