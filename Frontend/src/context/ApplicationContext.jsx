import { createContext, useContext, useState } from "react";

const ApplicationContext = createContext();

export function ApplicationProvider({ children }) {
  const [appliedJobs, setAppliedJobs] = useState([]);

  const applyToJob = (job) => {
    if (!appliedJobs.some((j) => j.id === job.id)) {
      setAppliedJobs([...appliedJobs, job]);
    }
  };

  return (
    <ApplicationContext.Provider value={{ appliedJobs, applyToJob }}>
      {children}
    </ApplicationContext.Provider>
  );
}

export const useApplications = () => useContext(ApplicationContext);
