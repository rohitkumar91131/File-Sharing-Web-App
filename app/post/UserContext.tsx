"use client";

import { useContext } from "react";
import { createContext } from "react";

const PostContext = createContext<any[]>([]);
export const PostProvider = ({ posts, children }: { posts: any[]; children: React.ReactNode })=>{
    return <PostContext.Provider value={posts}>
        {children}
    </PostContext.Provider>
}

export const usePost = () => useContext(PostContext);