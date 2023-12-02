import { prisma } from "../server/db/client";

export async function list_users() {
  let users = await prisma.AdminUser.findMany();
  return users;
}

export async function createUser(username, hashedPassword) {
  const newUser = await prisma.AdminUser.create({data: {username, password: hashedPassword}})
  return newUser.id;
}

export async function validate_login(name, password){
  let userStudent =  await prisma.AdminUser.findUnique({
    where: {name}
  });
  return (userStudent.password === password);
  
}

export async function userExists(username) {
  let count = await prisma.AdminUser.count({
      where: {
        username: username
       }
  });
  console.log("COUNT: " + count)
  return (count !== 0);
}



export async function getUsername(id){
  let userStudent =  await prisma.AdminUser.findUnique({
    where: {id: id}
  });
  return (userStudent.username);
}

export async function get_user(username){
  let userStudent =  await prisma.AdminUser.findUnique({
    where: {
      username,
    }
  });
  if (userStudent)
  {
    return (userStudent);
  }
  else return null;
}