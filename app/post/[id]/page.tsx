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
export default function PostPage({ params , searchParams}: { params: Promise<Param> ; searchParams : Promise<searchParam>}) {
  const [allUser, setAllUser] = useState<any[]>([]);
  const [formData , setFormData ] = useState<formData>({
    name : ""
  })
  const { id } = use(params);
  const {admin}  = use(searchParams);
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
    fetchUser();
  }
  return (
    <div>
      <h1>Post ID: {id}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {allUser.map((user) => (
          <div
            key={user.id}
            className="rounded-2xl shadow-md p-4  border"
          >
            <h2 className="text-lg font-semibold">{user.name}</h2>
            <p className="text-sm ">User ID: {user.id}</p>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <input 
            onChange={handleChange}
            value={formData.name}
        className="border !p-2"/>
        <button>Submit</button>
      </form>
    </div>
  );
}
