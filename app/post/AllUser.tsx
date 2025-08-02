"use client";

import { useEffect } from "react";

type User = {
  id: number;
  name: string;
  age: string;
  email: string;
};

export default function UserList({ users }: { users: User[] }) {
  useEffect(()=>{
    console.log(users);
  })
  return (
    <ul>
      {users?.map((user,index) => (
        <li 
          key={index} 
          className="p-2 border rounded cursor-pointer hover:bg-gray-100 hover:text-black "
          onClick={() => alert(user.name)} 
        >
          {user.name}
          {user.age}
          {user.email}
        </li>
      ))}
    </ul>
  );
}
