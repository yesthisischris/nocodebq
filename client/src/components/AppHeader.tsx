import { useState, useEffect } from "react";

const AppHeader = () => {
  const [userEmail, setUserEmail] = useState<string>("");
  const [userInitials, setUserInitials] = useState<string>("");

  // In a real app, you would get the user email from authentication
  useEffect(() => {
    // This is just a placeholder - in a real app, this would come from auth
    const email = "user@example.com";
    setUserEmail(email);
    
    // Extract initials from email
    const initials = email
      .split("@")[0]
      .split(".")
      .map(part => part[0]?.toUpperCase() || "")
      .join("");
    
    setUserInitials(initials);
  }, []);

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-[#1a73e8] mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-terminal"><polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/></svg>
          </span>
          <h1 className="text-xl font-medium">SQL Copilot for BigQuery</h1>
        </div>
        <div className="flex items-center">
          {userEmail && (
            <>
              <span className="text-sm text-[#5f6368] mr-3">{userEmail}</span>
              <div className="w-8 h-8 rounded-full bg-[#e8eaed] flex items-center justify-center text-[#5f6368]">
                {userInitials}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
