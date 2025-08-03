'use client'
import { createContext, useContext, useState } from "react";

type fileType = {
  files : string[],
  addFile : (file : string ) => void
}


const FileShareContext = createContext<fileType | undefined>(undefined);
export const FileShareProvider = ({ children }: { children: React.ReactNode }) => {
  const [files , setFile ] = useState<string[]>([]);
  const addFile = (file : string) =>{
    setFile(prev => ([ ...prev , file]))
  }

  
    return (
        <FileShareContext.Provider value={{ files , addFile}}>
          {children}
        </FileShareContext.Provider>
      )
}      
export const useFile = () => {
  const context = useContext(FileShareContext);
  if(!context) { 
    throw new Error("File not ready")
  };
  return context
}