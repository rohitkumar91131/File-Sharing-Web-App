'use client'
import { use , useEffect, useState } from "react";

type Param = {
  id: string
}
type searchParam = {
    admin : boolean
}
type formData = {
    name : string
}
type User = {
  id : string;
  name : string
}
export default function PostPage({ params , searchParams}: { params: Promise<Param> ; searchParams : Promise<searchParam>}) {
  const [allUser, setAllUser] = useState<User[]>([]);
  const [formData , setFormData ] = useState<formData>({
    name : ""
  })
  const { id } = use(params);
  const {admin : _admin}  = use(searchParams);
  async function fetchUser() {
    let res = await fetch("/api/users");
    const data = await res.json();
    setAllUser(data);
  }
  useEffect(() => {
    fetchUser();
  }, [id]);
  const handleChange = (e : React.ChangeEvent<HTMLInputElement>)=>{
    setFormData(prev=>({
        ...prev,
        name : e.target.value
    }))
  }
  const handleSubmit = async(e : React.FormEvent<HTMLFormElement>)=>{
    e.preventDefault();
    if(formData.name === ""){
      return;
    }
    //alert(JSON.stringify(formData));
    const res = await fetch("/api/users",{
        method : "POST",
        headers : {
            "content-type" : "application/json"
        },
        body : JSON.stringify(formData)
    })
    const data = await res.json();
    //alert(data.msg)
    setFormData({name : ""})
    fetchUser();
  }
  return (
    <div className="w-[100dvw] h-[100dvh] relative grid grid-rows-[1fr_9fr]  overflow-hidden">
      <form onSubmit={handleSubmit} className=" w-[100dvw] grid grid-cols-[9fr_1fr] !p-3">
        <input 
            onChange={handleChange}
            value={formData.name}
        className="border !p-2 rounded-md "/>
        <button className="border !p-1 rounded-md active:scale-95 active:bg-red-500  ">Submit</button>
      </form>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5   !p-3 overflow-y-auto scrollbar-none">
        {allUser.map((user) => (
          <div
            key={user.id}
            className="rounded-2xl shadow-md p-4  border h-fit "
          >
            <h2 className="text-lg font-semibold break-words whitespace-pre-wrap">{user.name}</h2>
            <p className="text-sm ">User ID: {user.id}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
