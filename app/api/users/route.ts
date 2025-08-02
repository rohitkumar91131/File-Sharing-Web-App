const users = [
    {
        id : 1 , name :" Rohit kumar"
    },
    {
        id : 2 , name : "Anshu Kumar"
    }
];

let id = 3;
export async function GET(){
    return Response.json(users);
}

export async function POST(req : Response){
    try{
        const data =await req.json();
        console.log(data);
        users.push({
            id : id,
            name: data.name
        })
        id++;
        return Response.json({
            msg : "User received"
        })
    }
    catch(err : any){
        return Response.json({ msg : err.message})
    }
}