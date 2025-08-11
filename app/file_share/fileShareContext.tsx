'use client'
import { createContext, Dispatch, MutableRefObject, useContext, useRef, useState } from "react";

type FileType = {
  name : string,
  size : number ,
  type : string
}

type FileContextType = {
  file : MutableRefObject<File | null>
  fileMetaData : FileType,
  setFileMetaData : Dispatch<React.SetStateAction<FileType>>
}
const FileShareContext = createContext<FileContextType | undefined>(undefined);

export const FileShareProvider = ({ children }: { children: React.ReactNode }) => {
  const file = useRef<File | null>(null);
  const [ fileMetaData , setFileMetaData ] = useState<FileType>({
    name : "",
    size : 0,
    type : ""
  })

  
    return (
        <FileShareContext.Provider value={{ file , fileMetaData , setFileMetaData}}>
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