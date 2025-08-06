'use client'
import { createContext, Dispatch, useContext, useState } from "react";

type FileType = {
  name : string,
  size : number ,
  type : string
}

type FileContextType = {
  files : string[],
  addFile : (file : string) =>void,
  fileMetaData : FileType,
  setFileMetaData : Dispatch<React.SetStateAction<FileType>>
}
const FileShareContext = createContext<FileContextType | undefined>(undefined);

export const FileShareProvider = ({ children }: { children: React.ReactNode }) => {
  const [files , setFile ] = useState<string[]>([]);
  const [ fileMetaData , setFileMetaData ] = useState<FileType>({
    name : "",
    size : 0,
    type : ""
  })
  const addFile = (file : string) =>{
    setFile(prev => ([ ...prev , file]))
  }

  
    return (
        <FileShareContext.Provider value={{ files , addFile , fileMetaData , setFileMetaData}}>
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