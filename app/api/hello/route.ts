import { NextResponse } from "next/server";

const users = [
    {
      "name": "Jane Doe",
      "age": 28,
      "email": "jane.doe@example.com"
    },
    {
      "name": "John Smith",
      "age": 35,
      "email": "john.smith@example.com"
    },
    {
      "name": "Emily Johnson",
      "age": 22,
      "email": "emily.johnson@example.com"
    },
    {
      "name": "Michael Brown",
      "age": 41,
      "email": "michael.brown@example.com"
    },
    {
      "name": "Sarah Davis",
      "age": 30,
      "email": "sarah.davis@example.com"
    },
    {
      "name": "David Wilson",
      "age": 47,
      "email": "david.wilson@example.com"
    },
    {
      "name": "Jessica Moore",
      "age": 25,
      "email": "jessica.moore@example.com"
    },
    {
      "name": "Robert Taylor",
      "age": 52,
      "email": "robert.taylor@example.com"
    },
    {
      "name": "Ashley Anderson",
      "age": 33,
      "email": "ashley.anderson@example.com"
    },
    {
      "name": "William Thomas",
      "age": 39,
      "email": "william.thomas@example.com"
    }
  ]
  
export async function GET(){
    return NextResponse.json({
        users : users
    })
}